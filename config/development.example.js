module.exports = {

    // Server configuration
    server: {
        port: +process.env.PORT || 3000,
        concurrency: process.env.CONCURRENCY || 1,
        worker_concurrency: process.env.WORKER_CONCURRENCY || 1,
        thrifty: process.env.THRIFTY === 'true',

        // Security
        cookie_secret: process.env.COOKIE_SECRET || 'supersecret'
    },

    // Mongo configuration
    mongo: {
        url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/jackalopeDev'
    },

    // Jackrabbit configuration (AMQP)
    jackrabbit: {
        url: process.env.CLOUDAMQP_URL || 'amqp://localhost'
    }

};