(function(app, d3) {
    'use strict';

    var canvasWidth = 600,
        canvasHeight = 600;

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

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on('zoom', zoomed);

    function zoomed() {
        d3.select(this).attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var svg = d3.select('body').append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)

    var container = svg.append('g')
        .attr("transform", "translate(-5,-5)")
        .call(zoom);

    var block1 = new app.Block({
        container: container,
        x: 20,
        y: 20,
        dragBehavior: drag
    });

    var block2 = new app.Block({
        container: container,
        x: 20,
        y: 200,
        dragBehavior: drag
    });

}(app, d3));