var ProcessingRequestSchema = require('./processingRequest');

module.exports = modelFactory;

function modelFactory(mongoConnection) {
    var ProcessingRequestModel = mongoConnection.model('ProcessingRequest', ProcessingRequestSchema);

    return {
        ProcessingRequest: ProcessingRequestModel
    };
}