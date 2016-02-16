(function(app, d3) {
    'use strict';

    var canvasWidth = 600,
        canvasHeight = 600;

    // Initial data
    var vertices = [
            {
                id: 0,
                coordinates: {
                    x: 20,
                    y: 20,
                }
            },
            {
                id: 1,
                coordinates: {
                    x: 20,
                    y: 200,
                }
            },
            {
                id: 2,
                coordinates: {
                    x: 300,
                    y: 200,
                }
            }
        ],
        edges = [
            {
                source: vertices[0],
                target: vertices[1]
            },
            {
                source: vertices[0],
                target: vertices[2]
            }
        ];


    var svg = d3.select('body').append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    var graph = new app.Graph({
        svg: svg,
        vertices: vertices,
        edges: edges
    })

}(app, d3));