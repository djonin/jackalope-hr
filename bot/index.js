var Faker = require('Faker');
var projectNameGenerator = require('project-name-generator');
var request = require('request');
var serverUrl = 'http://127.0.0.1:3000/events';

var MAX_OPEN_PROJECTS = 20;
var projectIds = 1;
var openProjects = {
};

setInterval(createNotification, 2000);

function createNotification() {
    var choice = Math.floor(Math.random() * 5); // 0 - 4

    // Create a new project
    if( choice === 0 ) {
        // Don't let our randomizer generate too many open projects
        if( Object.keys(openProjects).length > MAX_OPEN_PROJECTS ) {
            closeProject();
            return;
        }

        startProject();
    }
    // Add a comment to a project (1 - 3 for more weight)
    else if( choice > 0 && choice < 4 ) {
        // If there are no open projects, open one instead
        if( Object.keys(openProjects).length === 0 ) {
            startProject();
            return;
        }

        createComment();
    }
    // Complete a project
    else if( choice === 4 ) {
        // If there are no open projects, open one instead
        if( Object.keys(openProjects).length === 0 ) {
            startProject();
            return;
        }

        closeProject();
    }
}

function startProject() {
    var projectId = projectIds++;
    var projectName = projectNameGenerator.generate({ words: Math.floor(Math.random() * 5 + 1) }).dashed;
    var update = {
        type: 'project',
        action: 'new',
        data: {
            id: projectId,
            name: projectName
        }
    };

    openProjects[projectId] = projectName;

    send(update);
}

function closeProject() {
    var projectIds = Object.keys(openProjects);
    var selection = Math.floor(Math.random() * projectIds.length);
    var projectId = projectIds[selection];
    var update = {
        type: 'project',
        action: 'complete',
        target: projectId
    };

    delete openProjects[projectId];

    send(update);
}

function createComment() {
    var projectIds = Object.keys(openProjects);
    var selection = Math.floor(Math.random() * projectIds.length);
    var projectId = projectIds[selection];
    var comment = {
        type: 'notification',
        target: projectId,
        data: {
            message: Faker.Lorem.sentences(Math.floor(Math.random() * 5 + 1)),
            user: {
                name: Faker.Name.findName(),
                avatar: Faker.Image.avatar()
            }
        }
    };

    send(comment);
}

function send(data) {
    try {
        request({
            method: 'POST',
            url: serverUrl,
            body: data,
            json: true
        }, function() { });
    } catch(e) { }
}