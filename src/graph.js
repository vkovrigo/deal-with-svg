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

        this.drag = getDrag();

        this.vertices = options.vertices || [];
        this.edges = options.edges || [];

        this.update();
    };

    Graph.prototype.update = function () {
        var self = this;
        this.blocks = this.blocks.data(this.vertices, function (d) {
            return d.id;
        });

        this.blocks.enter().append('g').each(function(d, i) {
            new app.Block({
                id: d.id,
                x: d.x,
                y: d.y,
                coordinates: d.coordinates,
                container: d3.select(this),
                dragBehavior: self.drag
            });
        });

        this.blocks.exit().remove();

        this.paths = this.paths.data(this.edges)
            .attr("d", function (d) {
                return "M" + d.source.coordinates.x + "," + d.source.coordinates.y + "L" + d.target.coordinates.x + "," + d.target.coordinates.y;
            });

        this.paths.enter().append("path")
            .classed("path", true)
            .attr("d", function (d) {
                console.log(d)
                return "M" + d.source.coordinates.x + "," + d.source.coordinates.y + "L" + d.target.coordinates.x + "," + d.target.coordinates.y;
            });

        this.paths.exit().remove();
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

    function getDrag() {
        var drag = d3.behavior.drag()
            .origin(function(d) { return d })
            .on('dragstart', dragstart)
            .on('drag', dragmove);

        function dragstart() {
            d3.event.sourceEvent.stopPropagation();
        }

        function dragmove(d) {
            d.x += d3.event.dx;
            d.y += d3.event.dy;

            d3.select(this).attr("transform", function(d){
                return "translate(" + [ d.x, d.y ] + ")";
            });
        }

        return drag;
    }

    app.Graph = Graph;
}(app, d3));