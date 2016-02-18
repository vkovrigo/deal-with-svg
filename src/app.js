(function(app, d3) {
    'use strict';

    var canvasWidth = 600,
        canvasHeight = 600;

    // Initial data
    var vertices = [
            {
                id: 0,
                coordinates: {
                    x: 120,
                    y: 70,
                }
            },
            {
                id: 1,
                coordinates: {
                    x: 120,
                    y: 200,
                }
            },
            {
                id: 2,
                coordinates: {
                    x: 350,
                    y: 350,
                }
            }
        ],
        edges = [
            {
                source: vertices[0].id,
                target: vertices[1].id
            },
            {
                source: vertices[0].id,
                target: vertices[2].id
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

    // Move graph object to global scope.
    window.graph = graph;
}(app, d3));
