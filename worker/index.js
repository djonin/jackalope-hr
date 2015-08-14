var path = require('path');
var throng = require('throng');
var config = require('config');
var _ = require('lodash');
var JackalopeApp = require('shared/app');
var logger = require('shared/logger');
var Worker = require('./worker');

throng(start, { workers: config.get('server.worker_concurrency') });

function start() {
    logger.info('spinning up worker thread');

    var shutdownOnce = _.once(shutdown);
    var app;
    var worker;

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

    // Create our instance of the app, and start the worker when its ready
    app = new JackalopeApp();
    app.ready.then(startWorker, shutdown);

    function startWorker() {
        logger.info('worker starting');

        worker = new Worker(app);
        app.jackrabbitConnection.handle('queue.simple', worker.handleSimpleRequest);
        app.jackrabbitConnection.handle('queue.processing', worker.handleImageProcessingRequest);

        logger.info('worker started');
    }

    function shutdown() {
        logger.info('server shutting down');

        app.jackrabbitConnection.ignore('queue.simple');
        app.jackrabbitConnection.ignore('queue.processing');
        app.shutdown().finally(process.exit);
    }
}