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
        this.portOut = null;
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

    Block.prototype.outgoingPopsition = function() {
        var portRect = this.portOut.body.node().getBBox();

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
        if (d === Port.type.incoming) {
            this.dispatch.connectionend(this.id);
        } else {
            this.dispatch.connectionstart(this.id);
        }
    };

    // Internal methods
    Block.prototype.insertPorts = function() {
        switch (this.type) {
            case Block.type.start:
                this.portOut = new Port({
                    type: Port.type.outgoing,
                    parent: this
                });
                break;
            case Block.type.finish:
                this.portIn = new Port({
                    type: Port.type.incoming,
                    parent: this
                });
                break;
            default:
                this.portOut = new Port({
                    type: Port.type.outgoing,
                    parent: this
                });
                this.portIn = new Port({
                    type: Port.type.incoming,
                    parent: this
                });
                break;
        }

        if (this.portIn) this.portIn.dispatch.on('portclick', this.portclick.bind(this));
        if (this.portOut) this.portOut.dispatch.on('portclick', this.portclick.bind(this));

    }

    Block.type = {
        start: 'START',
        say: 'SAY',
        handler: 'HANDLER',
        converter: 'CONVERTER',
        input: 'INPUT',
        inputValue: 'INPUTVALUE',
        inputError: 'INPUTERROR',
        finish: 'FINISH'
    };


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
    })();

    app.Block = Block;
    window.idGenerator = idGenerator;
}(app, d3));
