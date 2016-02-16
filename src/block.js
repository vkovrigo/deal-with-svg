(function(app, d3) {
    'use strict';

    /**
     * Create simple rectangle field on svg canvas.
     *
     * @class
     * @param {Object} options - The initial property;
     * @param {Object} options.container - The d3 elements that should contains this block;
     * @param {Object} options.payload - The information for display on the current block;
     * @param {Object} options.coordinates - The initial position for block;
     * @param {number} options.coordinates.x - The x position coordinate;
     * @param {number} options.coordinates.y - The y position coordinate;
     */
    var Block = function(options) {
        //Default block width and height;
        var width = 200,
            height = 100;

        var drag = d3.behavior.drag()
            .origin(function(d) { return d })
            .on('dragstart', this.dragstart)
            .on('drag', this.dragmove);

        this.id = options.id || idGenerator();

        this.group = options.container
            .data([options.coordinates])
            .attr('fill-opacity', 0.2)
            .attr('class', 'block')
            .attr('transform', function(d) {
                return 'translate(' + [ d.x, d.y ] + ')';
            })
            .call(drag);

        this.rect = this.group.append('rect')
            .attr('height', height)
            .attr('width', width);
    };

    Block.prototype.dragstart = function () {
        d3.event.sourceEvent.stopPropagation();
    };

    Block.prototype.dragmove = function (d) {
        d.x += d3.event.dx;
        d.y += d3.event.dy;

        d3.select(this).attr("transform", function(d){
            return "translate(" + [ d.x, d.y ] + ")";
        });
    };

    var idGenerator = (function () {
        var id = 100;

        return function () {
            return id++;
        }; // Return and increment
    })()

    app.Block = Block;
}(app, d3));
