var projStorage = {};
var elemStorage = {};


var CSE = function(addr, newProjCB, compProjCB, newNotCB) {
	this.socket = io.connect(addr);
	this.onNewProject = newProjCB || function(){};
	this.onNewNotification = newNotCB || function(){};
	this.onProjectComplete = compProjCB || function(){};
}


CSE.prototype.constructor = CSE;

CSE.prototype.subscribe = function(clientId) {
	var self = this;
	this.socket.on('update', function(notification) {
		if(notification.type === 'project') {
			if(notification.action === 'complete') {
				self.onProjectComplete(notification.target);
			} else if(notification.action === 'new') {
				self.onNewProject(notification.data.id, notification.data.name);
			}
		} else if(notification.type === 'notification') {
			self.onNewNotification(notification.target, notification.data);
		}
	});
	this.socket.emit('subscribe', clientId);
}

CSE.prototype.setOnNewNotification = function(callback) {
	if(!callback) {
		callback = function(){};
	}
	this.onNewNotification = callback;
}

CSE.prototype.setOnProjectComplete = function(callback) {
	if(!callback) {
		callback = function(){};
	}
	this.onProjectComplete = callback;
}

CSE.prototype.setOnNewProject = function(callback) {
	if(!callback) {
		callback = function(){};
	}
	this.onNewProject = callback;
}




$(document).ready(function() {
	var cse = new CSE(window.location.origin);
	cse.subscribe('randomid');

	cse.setOnNewNotification(function(target,data) {
		if(projStorage[target]) {
			if(!projStorage[target].notifications) {
				projStorage[target].notifications = [];
			}
			projStorage[target].notifications.push(data);
		}
	});

	cse.setOnNewProject(function(id, name) {
		var elem = $('<li>'+name+'</li>');
		elem.on('click', selectProject);
		$('#projects').append(elem);
		projStorage[id] = { name: name };
		elemStorage[id] = { elem: elem };
	});

	cse.setOnProjectComplete(function(id) {
		elemStorage[id].elem.remove;
		delete elemStorage[id];
		delete projStorage[id];
	});
});

var selectProject = function(evt) {
	console.log(evt.target);
	$('#notifications').empty();
	for (var key in projStorage) {
		if(projStorage[key].name === evt.target.textContent) {
			if(!projStorage[key].notifications)
				continue;
			for(var i = 0; i<projStorage[key].notifications.length; i++) {
				var data = projStorage[key].notifications[i];
				var elem = $('<li>'+'<img src='+data.user.avatar+'/><div class="username">'+data.user.name+'</div>'+data.message+'</li>');
				elem.on('click', selectProject);
				$('#notifications').append(elem);
			}
			return;
		}
	}
}