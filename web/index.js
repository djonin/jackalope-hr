var path = require('path');
var http = require('http');
var socketIO = require('socket.io');
var express = require('express');
var ejs = require('ejs');
var throng = require('throng');
var config = require('config');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var _ = require('lodash');
var logger = require('shared/logger');
var JackalopeApp = require('shared/app');
var routesFactory = require('./routes');
var Worker = require('worker/worker');

http.globalAgent.maxSockets = Infinity;
throng(start, { workers: config.get('server.concurrency') });

// Start a web thread
function start() {
    logger.info('spinning up web thread');

    var webapp = express();
    var port = config.get('server.port');
    var thrifty = config.get('server.thrifty');
    var staticAssets = path.join(__dirname, '/public');
    var shutdownOnce = _.once(shutdown);
    var thrifty = config.get('server.thrifty');
    var connectedSockets = {};
    var server;
    var io;
    var app;
    var thriftyWorker;

    // Attempt graceful exit for windows
    if (process.platform === 'win32') {
        var rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('SIGINT', function () {
            process.emit('SIGINT');
        });
    }

    // Set listeners to gracefully shutdown
    process.once('SIGTERM', shutdownOnce);
    process.once('SIGINT', shutdownOnce);

    // Setup express app
    webapp.set('views', path.join(__dirname, '/views'));
    webapp.set('view engine', 'ejs');
    webapp.set('port', port);
    webapp.engine('ejs', ejs.renderFile);

    // Parse express requests into json
    webapp.use(bodyParser.json());

    // Server static assets
    webapp.use(express.static(staticAssets));

    // Create our server and setup the listeners
    server = http.createServer(webapp);
    server.on('listening', onServerStartSuccess);
    server.on('error', onServerStartFailed);

    // Hookup socket.io to our server
    io = socketIO(server);
    io.on('connection', onSocketConnection);

    // Create our instance of the app, and start the server when its ready
    app = new JackalopeApp();
    app.ready
        .then(setupRoutes)
        .then(startServer)
        .catch(shutdown);

    function setupRoutes() {
        var routes = routesFactory(app);
        _.forEach(routes, function(router, route) {
            logger.log('setting up route: ', route);
            webapp.use(route, router);
        });
    }

    function startServer() {
        logger.info('server starting');

        if( thrifty ) {
            logger.info('starting thrifty worker');

            thriftyWorker = new Worker(app);
            app.jackrabbitConnection.handle('queue.simple', thriftyWorker.handleSimpleRequest);
            app.jackrabbitConnection.handle('queue.processing', thriftyWorker.handleImageProcessingRequest);
        }

        app.jackrabbitConnection.handle('queue.notifications', notifyClients);
        server.listen(port);
    }


    function notifyClients(notification, ack) {
        logger.info('notifying clients of an update');

        // Tell each connection that has subscribed about the notification
        _.each(connectedSockets, function(connection) {
            if( connection.clientId !== null ) {
                connection.socket.emit('update', notification);
            }
        });

        ack();
    }

    function shutdown() {
        logger.info('server shutting down');

        app.jackrabbitConnection.ignore('queue.notifications');

        if( thrifty ) {
            logger.info('shutting down thrifty worker');

            app.jackrabbitConnection.ignore('queue.simple');
            app.jackrabbitConnection.ignore('queue.processing');
        }

        Promise.all([
            app.shutdown(),
            Promise.promisify(server.close)()
        ]).finally(process.exit);
    }

    function onSocketConnection(socket) {
        var connection = {
            socket: socket,
            clientId: null
        };

        connectedSockets[socket.id] = connection;

        socket.on('subscribe', onSubscribe);
        socket.on('unsubscribe', onUnsubscribe);
        socket.on('disconnect', onDisconnected);

        function onSubscribe(clientId) {
            logger.info('client subscribed', clientId);
            connection.clientId = clientId;
        }

        function onUnsubscribe() {
            logger.info('client unsubscribed', connection.clientId);
            connection.clientId = null;
        }

        function onDisconnected() {
            delete connectedSockets[socket.id];
        }
    }

    function onServerStartSuccess() {
        logger.info('server started');
    }

    function onServerStartFailed(err) {
        logger.error('server failed to start', err);
        process.exit(1);
    }
}