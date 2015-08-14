var Promise = require('bluebird');
var mongoose = require('mongoose');
var jackrabbit = require('jackrabbit');
var config = require('config');
var _ = require('lodash');
var logger = require('shared/logger');
var modelFactory = require('shared/models');

var ONE_HOUR = 24 * 60 * 60 * 1000;

module.exports = JackalopeApp;

/**
 * This is a shared application used by web and worker processes.
 * It contains all the common elements such as models and data
 * connections.
 */
function JackalopeApp() {
    var appInstance = this;
    var mongoUrl = config.get('mongo.url');
    console.log(mongoUrl);
    var jackrabbitUrl = config.get('jackrabbit.url');
    var pending = Promise.pending();
    var readyConnections = {
        mongo: false,
        jackrabbit: false
    };

    // Create mongo and jackrabbit connections
    appInstance.mongoConnection = mongoose.createConnection(mongoUrl);
    appInstance.jackrabbitConnection = jackrabbit(jackrabbitUrl);

    // Add mongo listeners
    appInstance.mongoConnection.on('connected', onMongoConnected);
    appInstance.mongoConnection.on('disconnected', onMongoDisconnected);
    appInstance.mongoConnection.on('error', onMongoError);

    // Add jackrabbit listeners
    appInstance.jackrabbitConnection.on('connected', onJackrabbitConnected);
    appInstance.jackrabbitConnection.on('disconnected', onJackrabbitDisconnected);
    appInstance.jackrabbitConnection.on('error', onJackrabbitError);

    // Setup models for Mongo (connection doesn't have to be ready)
    appInstance.models = modelFactory(this.mongoConnection);

    // Create queues object
    appInstance.queues = {};

    // Create a ready hook via promises
    appInstance.ready = pending.promise;
    appInstance.shutdown = shutdown;

    function shutdown() {
        return new Promise(shutdownAsync);
    }

    function shutdownAsync(resolve) {
        appInstance.mongoConnection.close(resolve);
        appInstance.jackrabbitConnection.close();
    }

    function onConnectionReady(connectionName) {
        readyConnections[connectionName] = true;
        if( _.all(readyConnections, _.identity) ) {
            logger.info('jackalope connections ready');
            createQueues();
        }
    }

    // Create our RabbitMQ queues
    function createQueues() {
        Promise.all([
            createQueueAsync('queue.simple'),
            createQueueAsync('queue.processing'),
            createQueueAsync('queue.notifications')
        ])
            .then(markReady)
            .catch(pending.reject);
    }

    // Create a single queue using a promise for completion notification
    function createQueueAsync(queueName) {
        return new Promise(function(resolve) {
            appInstance.jackrabbitConnection.create(queueName, { messageTtl: ONE_HOUR }, resolve);
        });
    }

    // Mark our application instance as ready
    function markReady() {
        logger.info('jackalope app instance ready');
        pending.resolve();
    }

    function onMongoConnected() {
        logger.info('mongo connected');
        onConnectionReady('mongo');
    }

    function onMongoDisconnected() {
        logger.info('mongo disconnected');
    }

    function onMongoError(err) {
        logger.error('mongo error', { error: err });
        pending.reject(err);
    }

    function onJackrabbitConnected() {
        logger.info('jackrabbit connected');
        onConnectionReady('jackrabbit');
    }

    function onJackrabbitDisconnected() {
        logger.info('jackrabbit disconnected');
    }

    function onJackrabbitError(err) {
        logger.error('jackrabbit error', { error: err });
        pending.reject(err);
    }
}
