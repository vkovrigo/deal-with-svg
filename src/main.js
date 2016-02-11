(function(d3){
    'use strict';

    var canvasWidth = 600,
        canvasHeight = 600;

    var width = 200,
        height = 100;

    var drag = d3.behavior.drag()
        .origin(function(d) { return d })
        .on('drag', dragmove);

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on('zoom', zoomed);

    var svg = d3.select('body').append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)

    var container = svg.append('g')
        .attr("transform", "translate(-5,-5)")
        .call(zoom);

    var newg = container.append('g')
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
        .on('dragstart', dragstart)
        .on('drag', newDragmove);

    var group = container.append('g')
        .data([{x: width / 10, y: height / 10}])
        .attr('fill-opacity', 0.2)
        .attr('class', 'block')
        .attr('transform', function(d) {
            return 'translate(' + [ d.x, d.y ] + ')';
        })
        .call(newDrag);

    var react = group.append('rect')
        .attr('height', height)
        .attr('width', width);

    var fo = group.append('foreignObject')
        .attr("height", height - 10)
        .attr("width", width - 20);

        // Add div with some text
        fo.append('xhtml:div').text('It will take 5 minutes on Python!')
        // Add input with predefined value
        fo.append('xhtml:input').attr('value', 'blah-blah');
        // Add checkbox
        fo.append('xhtml:input').attr('type', 'checkbox')

    function newDragmove(d) {
        d.x += d3.event.dx;
        d.y += d3.event.dy;

        d3.select(this).attr("transform", function(d,i){
            return "translate(" + [ d.x, d.y ] + ")";
        });
    }

    function zoomed() {
        d3.select(this).attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

}(d3));
