var rootController = require('./rootController');
var jobController = require('./jobController');

module.exports = routesFactory;

function routesFactory(jackalopeApp) {
    // TODO: Look into DI module for auto-magic injection
    // Create routes from controller, passing in dependencies
    var rootRoute = rootController(jackalopeApp);
    var jobRoutes = jobController(jackalopeApp);

    return {
        '/': rootRoute,
        '/jobs': jobRoutes
    };
}