var express = require('express');

module.exports = RootController;

function RootController(jackalopeApp) {
    var router = express.Router();

    router.get('/', getHomepage);
    router.post('/events', postEvents);

    return router;

    function getHomepage(req, res, next) {
        res.render('index');
    }

    // Simply send the request straight to the queue (which will be handed right back, no processing)
    function postEvents(req, res, next) {
        jackalopeApp.jackrabbitConnection.publish('queue.simple', req.body);
        res.status(200).end();
    }
}
