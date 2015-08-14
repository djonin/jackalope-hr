var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var ProcessingRequestSchema = mongoose.Schema({
    sourceUrl: String,
    transforms: [String],
    stage: String,
    outputs: {}
});

ProcessingRequestSchema.statics = {};
ProcessingRequestSchema.plugin(timestamps);

module.exports = ProcessingRequestSchema;