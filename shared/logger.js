var winston = require('winston');

// Uncomment to add a file logger to winston
// winston.add(winston.transports.File, { prettyPrint: true, depth: 10, filename: process.env.FOREMAN_WORKER_NAME });

module.exports = winston;