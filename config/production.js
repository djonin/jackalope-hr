module.exports = {

    // Server configuration
    server: {
        port: +process.env.PORT,
        concurrency: process.env.CONCURRENCY,
        worker_concurrency: process.env.WORKER_CONCURRENCY,
        thrifty: process.env.THRIFTY === 'true',

        // Security
        cookie_secret: process.env.COOKIE_SECRET
    },

    // Mongo configuration
    mongo: {
        url: process.env.MONGOLAB_URI
    },

    // Jackrabbit configuration (AMQP)
    jackrabbit: {
        url: process.env.CLOUDAMQP_URL
    }

};