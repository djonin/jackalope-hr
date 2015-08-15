var AppDispatcher = require('./dispatcher.js');

module.exports = {
  addJob: function(job) {
    AppDispatcher.dispatch({actionType: 'addJob', data: job});
  }
};
