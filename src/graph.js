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

        this.blocks = [
            new app.Block({
                container: this.container,
                x: 20,
                y: 20,
                dragBehavior: this.drag
            }),
            new app.Block({
                container: this.container,
                x: 20,
                y: 200,
                dragBehavior: this.drag
            })
        ];
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