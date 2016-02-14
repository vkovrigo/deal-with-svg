(function(app, d3) {
    'use strict';

    var canvasWidth = 600,
        canvasHeight = 600;

    var svg = d3.select('body').append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    var graph = new app.Graph({
        svg: svg
    })

}(app, d3));