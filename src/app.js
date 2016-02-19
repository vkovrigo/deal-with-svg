(function(app, d3) {
    'use strict';

    var canvasWidth = 600,
        canvasHeight = 600;

    // Initial data
    var vertices = [
            {
                id: 1,
                type: app.Block.type.start,
                coordinates: {
                    x: 300,
                    y: 60,
                }
            },
            {
                id: 2,
                type: app.Block.type.say,
                coordinates: {
                    x: 300,
                    y: 180,
                }
            },
            {
                id: 3,
                type: app.Block.type.input,
                coordinates: {
                    x: 300,
                    y: 300,
                }
            },
            {
                id: 4,
                type: app.Block.type.inputValue,
                coordinates: {
                    x: 250,
                    y: 375,
                }
            },
            {
                id: 5,
                type: app.Block.type.inputError,
                coordinates: {
                    x: 350,
                    y: 375,
                }
            },
            {
                id: 6,
                type: app.Block.type.finish,
                coordinates: {
                    x: 300,
                    y: 500,
                }
            }
        ],
        edges = [
            {
                source: vertices[0].id,
                target: vertices[1].id
            },
            {
                source: vertices[1].id,
                target: vertices[2].id
            },
            {
                source: vertices[2].id,
                target: vertices[3].id
            },
            {
                source: vertices[2].id,
                target: vertices[4].id
            },
            {
                source: vertices[3].id,
                target: vertices[5].id
            },
            {
                source: vertices[4].id,
                target: vertices[5].id
            },
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
