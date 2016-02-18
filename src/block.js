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
        var self = this;

        //Default block width and height;
        var width = 200,
            height = 100;

        var drag = d3.behavior.drag()
            .origin(function(d) { return d })
            .on('dragstart', this.dragstart)
            .on('drag', function() {
                self.dragmove.apply(self, arguments);
            })

        this.dispatch = d3.dispatch('move', 'connectionstart', 'connectionend');

        this.id = options.id || idGenerator();

        this.group = options.container
            .data([options.vertex])
            .attr('fill-opacity', 0.2)
            .attr('class', 'block')
            .attr('transform', function(d) {
                return 'translate(' + [ d.coordinates.x - width/2, d.coordinates.y - height/2 ] + ')';
            })
            .call(drag);

        this.rect = this.group.append('rect')
            .attr('height', height)
            .attr('width', width);


        this.portIn = new Port({
            type: Port.type.incoming,
            parent: this
        }).dispatch.on('portclick', function(d) { self.portclick.apply(self, arguments)});

        this.portOut = new Port({
            type: Port.type.outgoing,
            parent: this
        }).dispatch.on('portclick', function(d) { self.portclick.apply(self, arguments)});
    };

    Block.prototype.width = function() {
        return this.group.node().getBBox().width;
    };

    Block.prototype.height = function() {
        return this.group.node().getBBox().height;
    };

    Block.prototype.x = function() {
        return d3.transform(this.group.attr('transform')).translate[0];
    };

    Block.prototype.y = function() {
        return d3.transform(this.group.attr('transform')).translate[1];
    };

    Block.prototype.incomingPopsition = function() {
        var x = +this.portIn.body.attr('x'),
            y = +this.portIn.body.attr('x'),
            portW = +this.portIn.body.attr('width'),
            portH = +this.portIn.body.attr('height');

        return {
            x: x + this.x() + portW/2,
            y: this.y() + portH/2
        };
    };

    Block.prototype.outgoingPopsition = function() {
        var x = +this.portOut.body.attr('x'),
            y = +this.portOut.body.attr('x'),
            portW = +this.portOut.body.attr('width'),
            portH = +this.portOut.body.attr('height');

        return {
            x: x + this.x() + portW/2,
            y: y + this.y()
        };
    };

    Block.prototype.dragstart = function () {
        d3.event.sourceEvent.stopPropagation();
    };

    Block.prototype.dragmove = function (d) {
        var width = this.width(),
            height = this.height(),
            x = this.x() + d3.event.dx,
            y = this.y() + d3.event.dy;

        this.group
            .attr('transform', function(d) {
                return 'translate(' + [ x, y ] + ')';
            });

        this.dispatch.move();
    };

    Block.prototype.portclick = function(d) {
        if (d === Port.type.incoming) {
            this.dispatch
                .connectionend({
                    blockId: this.id
                });
        } else {
            this.dispatch
                .connectionstart({
                    blockId: this.id
                });
        }
    }


    var Port = function(options) {
        var self = this;

        this.type = options.type;
        this.parent = options.parent;

        this.dispatch = d3.dispatch('portclick');

        var portClass = this.type === Port.type.incoming ? 'port-in' : 'port-out',
            width = this.parent.width(),
            height = this.parent.height(),
            portHeight = 10,
            portWidth = 10,
            portX = width / 2 - portWidth / 2,
            portY = this.type === Port.type.incoming ? 0 : height - portHeight;

        this.body = this.parent.group.append('rect')
            .attr('class', portClass)
            .attr('height', portHeight)
            .attr('width', portWidth)
            .attr('x', portX)
            .attr('y', portY)
            .on('mousedown', function(d) {
                self.dispatch.portclick(self.type);
            });
    };

    Port.type = {
        incoming: 'INCOMING',
        outgoing: 'OUTGOING'
    };

    var idGenerator = (function () {
        var id = 100;

        return function () {
            return id++;
        }; // Return and increment
    })()

    app.Block = Block;
}(app, d3));
