(function(app, d3) {
    'use strict';

    var canvasWidth = 1024,
        canvasHeight = 768;

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
                type: app.Block.type.finish,
                coordinates: {
                    x: 300,
                    y: 500,
                }
            }
        ],
        edges = [
            {
                source: { blockId: vertices[0].id, portId: 0 },
                target: { blockId: vertices[1].id, portId: 0 }
            },
            {
                source: { blockId: vertices[1].id, portId: 0 },
                target: { blockId: vertices[2].id, portId: 0 }
            },
            {
                source: { blockId: vertices[2].id, portId: 0 },
                target: { blockId: vertices[3].id, portId: 0 }
            },
            {
                source: { blockId: vertices[2].id, portId: 1 },
                target: { blockId: vertices[1].id, portId: 0 }
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
