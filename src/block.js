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

        // Port sizes.
        this.portHeight = 10;
        this.portWidth = 10;

        var drag = d3.behavior.drag()
            .origin(function(d) { return d })
            .on('dragstart', this.dragstart)
            .on('drag', function() {
                self.dragmove.apply(self, arguments);
            })

        this.dispatch = d3.dispatch('move', 'connectionstart', 'connectionend');

        this.id = options.vertex.id || idGenerator();

        this.type = options.vertex.type;

        if (this.type === Block.type.inputValue || this.type === Block.type.inputError) {
            width = width / 2;
            height = height / 2;
        } else if (this.type === Block.type.input) {
            height = height / 2;
        }

        this.group = options.container
            .append('g').attr('class', 'block-wrapper') // ?? Extra wrapper for separating data from vertices list and bind this to current block
            .datum(this)
            .attr('fill-opacity', 0.2)
            .attr('class', 'block')
            .classed(this.type.toLowerCase(), true)
            .attr('id', 'block-' + this.id)
            .attr('transform', function(d) {
                return 'translate(' + [ options.vertex.coordinates.x - width/2, options.vertex.coordinates.y - height/2 ] + ')';
            })
            .call(drag);

        this.rect = this.group.append('rect')
            .attr('height', height)
            .attr('width', width);

        this.portIn = null;
        this.portsOut = [];
        this.insertPorts();
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
        var portRect = this.portIn.body.node().getBBox();

        return {
            x: portRect.x + this.x() + portRect.width/2,
            y: this.y() + portRect.height/2
        };
    };

    Block.prototype.outgoingPopsition = function(portId) {
        var portRect = this.portsOut[portId].body.node().getBBox();

        return {
            x: portRect.x + this.x() + portRect.width/2,
            y: portRect.y + this.y() + portRect.height/2
        };
    };

    // Events
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
        if (d.type === Port.type.incoming) {
            this.dispatch.connectionend({ blockId: this.id, portId: d.id });
        } else {
            this.dispatch.connectionstart({ blockId: this.id, portId: d.id });
        }
    };

    // Internal methods
    Block.prototype.insertPorts = function() {
        switch (this.type) {
            case Block.type.start:
                this.portsOut.push(new Port({
                    type: Port.type.outgoing,
                    parent: this
                }));
                break;
            case Block.type.finish:
                this.portIn = new Port({
                    type: Port.type.incoming,
                    parent: this
                });
                break;
            case Block.type.input:
                var count = 2; // Default port count for input type.

                this.portIn = new Port({
                    type: Port.type.incoming,
                    parent: this
                });
                for (var i = 0; i <= count - 1; i++) {
                    this.portsOut.push(new Port({
                        id: i,
                        type: Port.type.outgoing,
                        parent: this
                    }));
                }
                break;
            default:
                this.portsOut.push(new Port({
                    id: 0,
                    type: Port.type.outgoing,
                    parent: this
                }));
                this.portIn = new Port({
                    type: Port.type.incoming,
                    parent: this
                });
                break;
        }

        if (this.portIn) {
            var port = this.portIn,
                position = this.calculatePortPosition(port.type, 0, 1);

            port.body
                .attr('height', this.portHeight)
                .attr('width', this.portWidth)
                .attr('x', position.x)
                .attr('y', position.y);

            port.dispatch.on('portclick', this.portclick.bind(this));
        }

        if (this.portsOut.length) {
            this.portsOut.forEach((port, i, ports) => {
                var position = this.calculatePortPosition(port.type, i, ports.length);

                port.body
                    .attr('height', this.portHeight)
                    .attr('width', this.portWidth)
                    .attr('x', position.x)
                    .attr('y', position.y);

                port.dispatch.on('portclick', this.portclick.bind(this));
            });
        }

    };

    Block.prototype.calculatePortPosition = function(portType, portIndex, portCount) {
        var width = this.width(),
            height = this.height(),
            inputWidth = width / portCount,
            x = inputWidth * (portIndex + 1) - inputWidth / 2 - this.portWidth / 2,
            y = portType === Port.type.incoming ? 0 : height - this.portHeight;

        return { x, y }
    }

    Block.type = {
        start: 'START',
        say: 'SAY',
        handler: 'HANDLER',
        converter: 'CONVERTER',
        input: 'INPUT',
        finish: 'FINISH'
    };


    var Port = function(options) {
        var self = this;

        this.id = options.id || 0;
        this.type = options.type;
        this.parent = options.parent;

        this.dispatch = d3.dispatch('portclick');

        var portClass = this.type === Port.type.incoming ? 'port-in' : 'port-out';

        this.body = this.parent.group.append('rect')
            .attr('class', portClass)
            .on('mousedown', function(d) {
                self.dispatch.portclick({ id: self.id, type: self.type });
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
    })();

    app.Block = Block;
    window.idGenerator = idGenerator;
}(app, d3));
