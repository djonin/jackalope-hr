var projStorage = {};

$(document).ready(function() {
	var socket = io.connect(window.location.origin);
	socket.on('update', function(notification) {
		console.log(notification);
		if((notification.type === 'project')&&(notification.action === 'new')) {
			var elem = $('<li>'+notification.data.name+'</li>');
			elem.on('click', selectProject);
			$('#projects').append(elem);
			projStorage[notification.data.id] = { name: notification.data.name };
		} else if(notification.type === 'notification') {
			var id = notification.target;
			if(projStorage[id]) {
				if(!projStorage[id].notifications) {
					projStorage[id].notifications = [];
				}
				projStorage[id].notifications.push(notification.data);
			}
		}
	});
	socket.emit('subscribe', 'randomid');

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