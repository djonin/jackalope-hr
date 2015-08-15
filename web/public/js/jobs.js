var Store = require('./data.js');
var Actions = require('./actions.js');
var React = require('react');

var TransformEntry = React.createClass({

    render: function() {
        var assets = "/assets/";
        var png = ".png";
        return (
            <img className="transform img-thumbnail" src={assets + this.props.asset + png} />
            );
    }
});

var Transforms = React.createClass({

    render: function() {
        var elements = [];
        var entries = this.props.transforms;
        for (var i = 0; i < entries.length; ++i) {
            elements.push(<TransformEntry asset={entries[i]} />);
        }

        return (
            <div className="transform-list">
                {elements}
            </div>
            );
    }
});

var ImageJob = React.createClass({

    render: function() {
        var job = Store.getJob(this.props.jobId);

        return (
                <div>
                    <article className="row pendingProcess"></article>
                    <div className="process-job">
                        Job Id: {job.id}
                        <span className="status">{job.status}</span>
                    </div>
                    <Transforms transforms={job.transforms} />
                </div>
            );
    }

});

var AllJobs = React.createClass({

    getInitialState: function() {
        return { jobs: {} };
    },

    componentDidMount: function() {
        Store.addChangeListener(this.onChange);
    },

    componentWillUnmount: function() {
        Store.removeChangeListener(this.onChange);
    },

    onChange: function() {
        this.setState({ jobs: Store.getJobs() });
    },

    render: function() {
        var elements = [];
        var entries = this.state.jobs;
        for (var k in entries) {
            var e = <ImageJob jobId={entries[k].id}/>;
            elements.push(e);
        }

        return (
            <div>
                {elements}
            </div>
        );
    }

});

React.render(<AllJobs/>, document.getElementById('processingJobs'));

$(document).ready(function() {
    var transforms = [];
    var transformTemplate = '<img class="transform img-thumbnail" />';
    var processingTemplate = '<article class="row pendingProcess"></article>';

    $('#transformButtons').on('click', 'button', addTransform);
    $('#clearRequest').on('click', clearRequest);
    $('#submitRequest').on('click', submitRequest);

    function addTransform() {
        var transform = $(this).val();
        var transformEntry = $(transformTemplate);

        transforms.push(transform);
        transformEntry.attr('src', '/assets/' + transform + '.png');

        $('#transformsInput').append(transformEntry);
    }

    function submitRequest() {
        var imageUrl = $('#imageUrlInput').val();

        $.ajax({
            url: '/jobs',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                imageUrl: imageUrl,
                transforms: transforms
            }),
            dataType: 'json',
            success: function(response) {

                var job = {
                    id: response.id,
                    transforms: transforms,
                    status: "Queued"
                };
                Actions.addJob(job);

//                var processingJobs = $( '#processingJobs' );
//                var newJob = $( processingTemplate );
//                var jobTitle = $( '<div class="process-job">Job Id: ' + response.id + ' <span class="status">(Queued)</span></div>' );
//                var jobTransforms = $( '<div class="transform-list"></div>' );
//
//                var i, entry;
//                for( i = 0; i < transforms.length; i++ ) {
//                    entry = $( transformTemplate );
//                    entry.attr( 'src', '/assets/' + transforms[i] + '.png' );
//                    jobTransforms.append( entry );
//                }
//
//                newJob.data('jobId', response.id);
//                newJob.append( jobTitle );
//                newJob.append( jobTransforms );
//                processingJobs.prepend( newJob );

                clearRequest();
            }
        });
    }

    function clearRequest() {
        $('#imageUrlInput').val('');
        transforms = [];
        $('#transformsInput').empty();
    }
});