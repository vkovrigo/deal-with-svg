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
            height = 100,
            inputValueWidth = 142,
            inputErroeWidth = width - inputValueWidth,
            converterValueHeight = 51,
            converterHeaderHeight = height - converterValueHeight;

        // Port sizes.
        this.portHeight = 10;
        this.portWidth = 10;

        var drag = d3.behavior.drag()
            .origin(function(d) { return d })
            .on('dragstart', this.dragstart)
            .on('drag', function() {
                self.dragmove.apply(self, arguments);
            })

        this.dispatch = d3.dispatch(
            'move',
            'connectionstart',
            'connectionend',
            'edit',
            'addValue', 'removeValue' //This events should be specific for each type of blocks
        );

        this.id = options.vertex.id || idGenerator();

        this.type = options.vertex.type;

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

        this.payload =  this.type !== Block.type.input ? options.vertex.payload : options.vertex.payload.sort(p => p.error);

        // Recalculate size for some block types
        if (this.type === Block.type.input) {
            width = this.payload.length > 1 ? inputValueWidth * (this.payload.length - 1) : inputValueWidth;
            width += inputErroeWidth;
        } else if (this.type === Block.type.converter) {
            height = this.payload.length > 0 ? converterValueHeight * this.payload.length : converterValueHeight;
            height += converterHeaderHeight;
        }

        this.rect = this.group.append('rect')
            .attr('height', height)
            .attr('width', width);

        this.portIn = null;
        this.portsOut = [];


        let html, w, h, y;
        if (this.type === Block.type.input) {
            let template = document.getElementById('inputs-template').textContent;

            w = this.width() - 2;
            h = this.height() / 3;
            y = h;
            html = Mustache.render(template, { values: this.payload.filter(v => !v.error) });
        } else if (this.type === Block.type.converter) {
            let template = document.getElementById('converters-template').textContent;

            w = this.width();
            h = this.payload.length > 0 ? converterValueHeight * this.payload.length : 0;
            y = this.payload.length > 0 ? converterHeaderHeight : this.height();
            html = Mustache.render(template, { values: this.payload });
        } else if (this.type === Block.type.say) {
            let template = document.getElementById('say-template').textContent;

            w = this.width() - 2;
            y = 30;
            h = this.height() - y;
            html = Mustache.render(template, { values: this.payload, maxHeight: h - y });
        }

        if (html) {
            this.group.append('foreignObject')
                .datum(this.payload)
                .attr('width', w)
                .attr('height', h)
                .attr('y', y)
                .html(html)
                .on('mousedown', d => this.editing(d));
        }

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
        var portRect = this.portsOut.filter(p => p.id === portId)[0].body.node().getBBox();

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

    Block.prototype.editing = function(d) {
        var action = findDatasetValue(d3.event.target, 'action'),
            valueId;
        if (action) {
            switch (action) {
                case 'add':
                    this.dispatch.addValue(this);
                    break;
                case 'remove':
                    valueId = parseInt(findDatasetValue(d3.event.target, 'valueId'));
                    this.dispatch.removeValue(this, valueId);
                    break;
                case 'edit':
                    valueId = parseInt(findDatasetValue(d3.event.target, 'valueId'));
                    this.dispatch.edit(this, valueId);
                    break;
            }

            d3.event.stopPropagation(); // Stop dragging
        }
    }

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
                this.payload.forEach(value => {
                    this.portsOut.push(new Port({
                        id: value.id,
                        type: Port.type.outgoing,
                        parent: this
                    }));
                });
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

    function onelineTextBlock(options) {
        var fo = options.parent.append('foreignObject')
            .datum(options.data);

        var wrapper = fo.append('xhtml:div')
            .classed('wrapper', true)
            .style('width', '100%')
            .style('padding-left', '10px')
            .style('padding-top', '10px')

        wrapper.append('xhtml:div')
            .classed('truncate', true)
            .style('width', '80%')
            .text(options.text);

        if (options.edit) {
            wrapper.append('xhtml:div')
                .html('<i class="fa fa-pencil-square"></i>')
                .on('click', options.edit);
        }
        if (options.remove) {
            wrapper.append('xhtml:div')
                .html('<i class="fa fa-times"></i>')
                .on('click', options.remove);
        }

        return fo;
    }


    function findDatasetValue(element, name) {
        var value = element && element.dataset[name];

        if (!value && element.parentNode.nodeName !== 'foreignObject') {
            value = findDatasetValue(element.parentNode, name);
        }

        return value;
    }

    app.Block = Block;
    window.idGenerator = idGenerator;
}(app, d3));
