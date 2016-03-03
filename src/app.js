(function(app, d3) {
    'use strict';

    var canvasWidth = 1024,
        canvasHeight = 768;

    var vertices = [
            {
                id: 1,
                type: app.Block.type.start,
                coordinates: {
                    x: 90,
                    y: 40,
                }
            },
            {
                id: 2,
                type: app.Block.type.input,
                coordinates: {
                    x: 150,
                    y: 250,
                },
                payload: [
                    {
                        id: 0,
                        text: '1',
                        error: false
                    },
                    {
                        id: 1,
                        text: '2',
                        error: false
                    },
                    {
                        id: 2,
                        text: '0',
                        error: false
                    },
                    {
                        id: 3,
                        text: '?',
                        error: true
                    },
                ]
            },
            {
                id: 3,
                type: app.Block.type.converter,
                coordinates: {
                    x: 120,
                    y: 400
                },
                payload: [
                    {
                        id: 0,
                        from: '1',
                        to: 'Paolo Meneguzzi'
                    },
                    {
                        id: 1,
                        from: '2',
                        to: 'Fernando Corena'
                    }
                ]
            },
            {
                id: 4,
                type: app.Block.type.say,
                coordinates: {
                    x: 150,
                    y: 600,
                },
                payload: [
                    {
                        id: 0,
                        message: 'Your vote was %input%. Thank you for voting.'
                    }
                ]
            },
            {
                id: 5,
                type: app.Block.type.say,
                coordinates: {
                    x: 400,
                    y: 511,
                },
                payload: [
                    {
                        id: 0,
                        message: 'You are not sure. Thank you for voting.'
                    }
                ]
            },
            {
                id: 6,
                type: app.Block.type.say,
                coordinates: {
                    x: 400,
                    y: 100,
                },
                payload: [
                    {
                        id: 0,
                        message: 'Please, try again.'
                    }
                ]
            },
            {
                id: 7,
                type: app.Block.type.finish,
                coordinates: {
                    x: 300,
                    y: 740,
                }
            }
        ],
        edges = [
            {
                "source": {
                    "blockId": 1,
                    "portId": 0
                },
                "target": {
                    "blockId": 2,
                    "portId": 0
                }
            },
            {
                "source": {
                    "blockId": 2,
                    "portId": 0
                },
                "target": {
                    "blockId": 3,
                    "portId": 0
                }
            },
            {
                "source": {
                    "blockId": 2,
                    "portId": 1
                },
                "target": {
                    "blockId": 3,
                    "portId": 0
                }
            },
            {
                "source": {
                    "blockId": 2,
                    "portId": 2
                },
                "target": {
                    "blockId": 5,
                    "portId": 0
                }
            },
            {
                "source": {
                    "blockId": 2,
                    "portId": 3
                },
                "target": {
                    "blockId": 6,
                    "portId": 0
                }
            },
            {
                "source": {
                    "blockId": 3,
                    "portId": 0
                },
                "target": {
                    "blockId": 4,
                    "portId": 0
                }
            },
            {
                "source": {
                    "blockId": 4,
                    "portId": 0
                },
                "target": {
                    "blockId": 7,
                    "portId": 0
                }
            },
            {
                "source": {
                    "blockId": 6,
                    "portId": 0
                },
                "target": {
                    "blockId": 2,
                    "portId": 0
                }
            },
            {
                "source": {
                    "blockId": 5,
                    "portId": 0
                },
                "target": {
                    "blockId": 7,
                    "portId": 0
                }
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
