var express = require('express');

module.exports = JobController;

function JobController(jackalopeApp) {
    var router = express.Router();

    router.get('/', getJobsHomepage);
    router.post('/', createImageProcessingRequest);

    return router;

    function getJobsHomepage(req, res, next) {
        res.render('jobs');
    }

    // Simply send the request straight to the queue (which will be handed right back, no processing)
    function postEvents(req, res, next) {
        jackalopeApp.jackrabbitConnection.publish('queue.simple', req.body);
        res.status(200).end();
    }

    function createImageProcessingRequest(req, res, next) {
        var request = new jackalopeApp.models.ProcessingRequest({
            sourceUrl: req.body.imageUrl,
            stage: 'initial',
            transforms: req.body.transforms,
            outputs: {}
        });

        request.save(onSave);

        function onSave(err, request) {
            if( err ) {
                res.status(500).json({ error: err });
                return;
            }

            jackalopeApp.jackrabbitConnection.publish( 'queue.processing', request.id );
            res.status(200).json({ id: request.id });
        }
    }
}
