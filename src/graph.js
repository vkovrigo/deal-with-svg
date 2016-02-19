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
            return d.id;
        });

        this.blocks.enter().append('g').each(function(d, i) {
            var block = new app.Block({
                vertex: d,
                container: d3.select(this),
            });
            block.dispatch
                .on('move', self.update.bind(self))
                .on('connectionstart', self.connectionstart.bind(self))
                .on('connectionend', self.connectionend.bind(self));
        });

        this.blocks.exit().remove();

        this.paths = this.paths.data(this.edges, function(d) { return d.source + '+' + d.target; })
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
            var sourceId = this.selectedPort,
                targetId = d;

            this.edges.push({
                source: sourceId,
                target: targetId
            });

            this.update();
        }

        // Remove highlight all ports for connection.
        d3.selectAll('.port-in').classed('port-open', false);

        this.selectedPort = null;
    };

    Graph.prototype.connectItems = function(relations) {
        var source = d3.select('#block-' + relations.source).datum(),
            target = d3.select('#block-' + relations.target).datum(),
            sourcePosition = source.outgoingPopsition(),
            targetPosition = target.incomingPopsition();

        return "M" + sourcePosition.x + "," + sourcePosition.y + "L" + targetPosition.x + "," + targetPosition.y;
    };

    Graph.prototype.insertNewItem = function(edge, type, position) {
        var source = d3.select('#block-' + edge.source).datum(),
            target = d3.select('#block-' + edge.target).datum(),
            vertix = {
                id: idGenerator(),
                type: type,
                coordinates: {
                    x: position[0],
                    y: position[1]
                }
            },
            currentEdgeIndex = graph.edges.indexOf(edge);

            if (currentEdgeIndex !== -1) {
                this.edges.splice(currentEdgeIndex, 1); // Remove old edge.

                this.vertices.push(vertix);

                // Insert 2 edges for connect new inserted vertex
                this.edges.push({
                    source: edge.source,
                    target: vertix.id
                },{
                    source: vertix.id,
                    target: edge.target
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