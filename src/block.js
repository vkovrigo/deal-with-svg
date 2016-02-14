(function(app, d3) {
    'use strict';

    /**
     * Create simple rectangle field on svg canvas.
     *
     * @class
     * @param {Object} options - The initial property;
     * @param {Object} options.container - The d3 elements that should contains this block;
     * @param {Object} options.payload - The information for display on the current block;
     * @param {number} options.x - The x position coordinate;
     * @param {number} options.y - The y position coordinate;
     * @param {function} options.dragBehavior - The d3 drag behavior;
     */
    var Block = function(options) {
        //Default block width and height;
        var width = 200,
            height = 100;

        this.group = options.container.append('g')
            .data([{
                x: options.x,
                y: options.y
            }])
            .attr('fill-opacity', 0.2)
            .attr('class', 'block')
            .attr('transform', function(d) {
                return 'translate(' + [ d.x, d.y ] + ')';
            })
            .call(options.dragBehavior);

        this.rect = this.group.append('rect')
            .attr('height', height)
            .attr('width', width);
    };

    app.Block = Block;
}(app, d3));
