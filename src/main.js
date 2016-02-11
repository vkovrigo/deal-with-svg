(function(d3){
    'use strict';

    var canvasWidth = 600,
        canvasHeight = 600;

    var width = 200,
        height = 100;

    var drag = d3.behavior.drag()
        .origin(function(d) { return d })
        .on('drag', dragmove);

    var svg = d3.select('body').append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)

    var newg = svg.append('g')
          .data([{x: width / 2, y: height / 2}]);

    var dragrect = newg.append('rect')
        .attr('class', 'block')
        .attr('id', 'block-1')
        .attr('x', function(d) { return d.x; })
        .attr('y', function(d) { return d.y; })
        .attr('height', height)
        .attr('width', width)
        .attr('fill-opacity', 0.5)
        .call(drag);

    function dragmove(d) {
        d3.select(this)
            .attr('x', d.x = Math.max(0, Math.min(canvasWidth - width, d3.event.x)))
            .attr('y', d.y = Math.max(0, Math.min(canvasHeight - height, d3.event.y)));
    }


    // Creare rect inside tag `g` and than add `foreignObject` with some html.

    var newDrag = d3.behavior.drag()
        .origin(function(d) { return d; })
        .on('drag', newDragmove);

    var group = svg.append('g')
        .data([{x: width / 10, y: height / 10}])
        .attr('class', 'block')
        .attr('transform', function(d) {
            return 'translate(' + [ d.x, d.y ] + ')';
        })
        .call(newDrag);

    var react = group.append('rect')
        .attr('height', height)
        .attr('width', width);

    function newDragmove(d) {
        d.x += d3.event.dx;
        d.y += d3.event.dy;

        d3.select(this).attr("transform", function(d,i){
            return "translate(" + [ d.x, d.y ] + ")";
        });
    }

}(d3));
