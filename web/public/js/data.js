var AppDispatcher = require('./dispatcher.js');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var jobStore = {};

var Store = assign({}, EventEmitter.prototype, {
  getJob: function(id) {
    return jobStore[id];
  },

  getJobs: function() {
    return jobStore;
  },

  emitChange: function() {
    this.emit('change');
  },

  addChangeListener: function(cb) {
    this.on('change', cb);
  },

  removeChangeListener: function(cb) {
    this.removeListener('change', cb);
  }
});

module.exports = Store;

var addJob = function(data) {
  jobStore[data.id] = data;
};


AppDispatcher.register(function(action) {

  switch (action.actionType) {
    case 'addJob':
      addJob(action.data);
      Store.emitChange();
      break;
  }

});