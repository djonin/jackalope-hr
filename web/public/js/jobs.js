$(document).ready(function() {
    var transforms = [];
    var transformTemplate = '<img class="transform img-thumbnail" />';
    var processingTemplate = '<article class="row"></article>';

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
                var processingJobs = $( '#processingJobs' );
                var newJob = $( processingTemplate );
                var jobTitle = $( '<div class="process-job">Job Id: ' + response.id + ' <span class="status">(Queued)</span></div>' );
                var jobTransforms = $( '<div class="transform-list"></div>' );

                var i, entry;
                for( i = 0; i < transforms.length; i++ ) {
                    entry = $( transformTemplate );
                    entry.attr( 'src', '/assets/' + transforms[i] + '.png' );
                    jobTransforms.append( entry );
                }

                newJob.data('jobId', response.id);
                newJob.append( jobTitle );
                newJob.append( jobTransforms );
                processingJobs.prepend( newJob );

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