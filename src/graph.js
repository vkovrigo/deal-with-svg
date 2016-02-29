(function(app, d3) {
    'use strict';

    /**
     * { function_description }
     *
     * @class
     * @param      {<type>}  options  { description }
     */
    var Graph = function(options) {
        this.zoom = getZoom();

        this.container = options.svg.append('g')
            .attr('class', 'graph-container')
            .attr("transform", "translate(-5,-5)")
            .call(this.zoom);

        this.blocks = this.container
            .append("g")
            .classed("blocks", true)
            .selectAll("g");

        this.paths = this.container
            .append("g")
            .classed("paths", true)
            .selectAll("g");

        this.vertices = options.vertices || [];
        this.edges = options.edges || [];

        this.selectedPort = null;

        this.update();
    };

    Graph.prototype.update = function () {
        var self = this;

        this.blocks = this.blocks.data(this.vertices, function (d) {
            var hash = (d.payload) ? JSON.stringify(d.payload) : '';

            return d.id + hash;
        });

        this.blocks.enter().append('g').each(function(d, i) {
            var block = new app.Block({
                vertex: d,
                container: d3.select(this),
            });
            block.dispatch
                .on('move', self.update.bind(self))
                .on('connectionstart', self.connectionstart.bind(self))
                .on('connectionend', self.connectionend.bind(self))
                .on('edit', (...arg) => self.showEditForm(...arg))
                .on('removeValue', (...arg) => self.removeInput(...arg))
                .on('addValue', (block) => self.showEditForm(block));
        });

        this.blocks.exit().remove();

        this.paths = this.paths
            .data(this.edges, function(d) {
                return d.source.blockId + '+' + d.target.blockId + '+' + d.source.portId + '+' + d.target.portId;
            })
            .attr("d", this.connectItems);

        this.paths.enter().append("path")
            .classed("path", true)
            .attr("d", this.connectItems)
            .on('mousedown', this.selectBlockType.bind(this));

        this.paths.exit().remove();
    };

    Graph.prototype.connectionstart = function(d) {
        this.selectedPort = d;

        // Highlight all ports for connection.
        d3.selectAll('.port-in').classed('port-open', true);
    };

    Graph.prototype.connectionend = function(d) {
        if (this.selectedPort && this.selectedPort !== d) {
            var source = this.selectedPort,
                target = d;

            this.edges.push({
                source: {
                    blockId: source.blockId,
                    portId: source.portId
                },
                target: {
                    blockId: target.blockId,
                    portId: target.portId
                }
            });

            this.update();
        }

        // Remove highlight all ports for connection.
        d3.selectAll('.port-in').classed('port-open', false);

        this.selectedPort = null;
    };

    Graph.prototype.connectItems = function(edge) {
        var source = d3.select('#block-' + edge.source.blockId).datum(),
            target = d3.select('#block-' + edge.target.blockId).datum(),
            sourcePosition = source.outgoingPopsition(edge.source.portId),
            targetPosition = target.incomingPopsition(),
            sourceX = sourcePosition.x,
            sourceY = sourcePosition.y,
            targetX = targetPosition.x,
            targetY = targetPosition.y,
            sourceW = source.width(),
            targetW = target.width(),
            indent = 50,
            points = [],
            line = d3.svg.line().interpolate('basis');

        if (sourceY - targetY > indent * 2) { // Top
            /**
             *                  p4
             *         p5' +-----+-----+ p5
             *   Left      |     |     |    Right
             *         p6' +     |     + p6
             *                   |
             *          p1 +     |
             *             |     |
             *          p2 +-----+ p3
             *
             * p1 - source port point;
             * p6/p6' - target port point;
             * p2.y - p1.y === p6.y - p5.y === indent;
             */
            var p3x, p3y, p4y;

            points.push([sourceX, sourceY]) // p1
            points.push([sourceX, sourceY + indent]); // p2
            if (sourceX - targetX < 0) { // Right
                p3x = sourceX + (((targetX - sourceX) > (sourceW + targetW)/2) ? (targetX - sourceX)/2 : targetX - sourceX + targetW);
            } else { // Left
                p3x = targetX + (((sourceX - targetX) > (sourceW + targetW)/2) ? (sourceX - targetX)/2 : sourceX - targetX - targetW/2);
            }
            p3y = sourceY + indent;
            points.push([p3x, p3y]); // p3
            p4y = targetY - indent;
            points.push([p3x, p4y]); // p4
            points.push([targetX, p4y]); // p5
            points.push([targetX, targetY]); // p6
        } else { // Bottom
            /**
             *                   + p1
             *                   |
             *                   | p2
             *    p3 +-----------+
             *       |
             *       |
             *    p4 +
             *
             * p1 - source port point;
             * p4 - target port point;
             * p2.y - p1.y === p4.y - p3.y;
             */
            var p2y;

            points.push([sourceX, sourceY]); // p1
            p2y = (targetY - sourceY) / 2 + sourceY;
            points.push([sourceX, p2y]); // p2
            points.push([targetX, p2y]); // p3
            points.push([targetX, targetY]); // p4

        }

        return line(points);
    };

    Graph.prototype.insertNewItem = function(edge, type, position) {
        var source = d3.select('#block-' + edge.source.blockId).datum(),
            target = d3.select('#block-' + edge.target.blockId).datum(),
            vertex = {
                id: idGenerator(),
                type: type,
                coordinates: {
                    x: position[0],
                    y: position[1]
                }
            },
            currentEdgeIndex = graph.edges.indexOf(edge);

            if (type === app.Block.type.input) {
                vertex.payload = [
                    {
                        id: 1,
                        text: '?',
                        error: true
                    },
                    {
                        id: 0,
                        text: 'All user input',
                        error: false
                    }
                ];
            }

            if (currentEdgeIndex !== -1) {
                this.edges.splice(currentEdgeIndex, 1); // Remove old edge.

                this.vertices.push(vertex);

                // Insert 2 edges for connect new inserted vertex
                this.edges.push({
                    source: { blockId: edge.source.blockId, portId: edge.source.portId },
                    target: { blockId: vertex.id, portId: 0 }
                },{
                    source: { blockId: vertex.id, portId: 0 },
                    target: { blockId: edge.target.blockId, portId: edge.target.portId }
                });

                this.update();
            }
    };

    Graph.prototype.selectBlockType = function(d) {
        var self = this,
            xy = d3.mouse(d3.select('svg').node()),
            popup = d3.select('.popup');

        popup.classed('hidden', false)
            .style("left", xy[0] + "px")
            .style("top", xy[1] + "px")
            .on('click', function(event) {
                var type = d3.select(d3.event.target)
                    .datum(function() { return this.dataset; })
                    .datum().type;

                d3.select(this).classed('hidden', true);

                if (type) self.insertNewItem(d, app.Block.type[type], xy);
            });

        d3.event.preventDefault();
    };

    Graph.prototype.showEditForm = function(block, inputId) {
        var xy = d3.mouse(d3.select('svg').node()),
            vertex = this.vertices.filter(v => v.id === block.id)[0],
            copyVertex = JSON.parse(JSON.stringify(vertex)), // deep copy
            payload = copyVertex.payload.filter(value => value.id === inputId)[0],
            editor = app.editorFactory(block.type, xy, payload);

        editor.dispatch.on('save', (payload) => {
            if (inputId === undefined) { // New value
                var finish = this.vertices.filter(v => v.type === app.Block.type.finish)[0],
                    edge = {
                        source: { blockId: block.id, portId: payload.id },
                        target: { blockId: finish.id, portId: 0 }
                    };

                copyVertex.payload.push(payload);
                this.edges.push(edge); // Add new edge for new input closed to finish block.
            }

            this.vertices.splice(this.vertices.indexOf(vertex), 1);
            this.vertices.push(copyVertex);

            this.update();
        });

        editor.show();
    };

    Graph.prototype.removeInput = function(block, inputId) {
        var vertex = this.vertices.filter(v => v.id === block.id)[0],
            copyVertex = JSON.parse(JSON.stringify(vertex)), // deep copy
            input = copyVertex.payload.filter(value => value.id === inputId)[0],
            inputIndex = copyVertex.payload.indexOf(input);

        copyVertex.payload.splice(inputIndex, 1); // Remove selected input
        this.vertices.splice(this.vertices.indexOf(vertex), 1);
        this.vertices.push(copyVertex);

        var edgesToRemove = this.edges.filter(e => e.source.blockId === block.id && e.source.portId === inputId);
        this.edges = this.edges.filter(e => !edgesToRemove.some(er => er === e));

        this.update();
    }

    function getZoom() {
        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on('zoom', zoomed);

        function zoomed() {
            d3.select(this).attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        return zoom;
    };

    app.Graph = Graph;
}(app, d3));