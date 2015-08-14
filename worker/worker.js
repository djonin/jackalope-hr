var Promise = require('bluebird');
var logger = require('shared/logger');

module.exports = Worker;

function Worker(jackalopeApp) {
    var ProcessingRequest = jackalopeApp.models.ProcessingRequest;

    this.handleSimpleRequest = handleSimpleRequest;
    this.handleImageProcessingRequest = handleImageProcessingRequest;

    function handleSimpleRequest(request, ack) {
        logger.info('processing simple request');
        jackalopeApp.jackrabbitConnection.publish('queue.notifications', request);

        ack();
    }

    function handleImageProcessingRequest(processingRequestId, ack) {
        logger.info('starting next image processing task: ', processingRequestId);

        getProcessingRequest(processingRequestId)
            .then(performNextProcess)
            .finally(finishTask);

        function performNextProcess() {

        }

        function finishTask() {
            logger.info('processing task complete');
            jackalopeApp.jackrabbitConnection.publish('queue.notifications', { id: processingRequestId });

            ack();
        }
    }

    function getProcessingRequest(processingRequestId) {
        return new Promise(function(resolve, reject) {
            ProcessingRequest.findById(processingRequestId, function(err, request) {
                if( err ) {
                    return reject(err);
                }

                resolve(request);
            });
        });
    }
}