(function(app, undefined) {
    'use strict';

    function Editor(position, payload) {

        this.form = document.getElementsByClassName('form-edit')[0];

        this.overlay = document.getElementsByClassName('overlay')[0];
        if (!this.overlay) { // Create overlay if not exist
            this.overlay = document.createElement('div');
            this.overlay.classList.add('overlay', 'hidden');
            document.body.insertBefore(this.overlay, this.form);
        }

        // d3 event bus;
        this.dispatch = d3.dispatch('save');

        this._position = position;
        this._payload = payload || { id: idGenerator(), text: '', error: false };

        this._loseFocusHandler = event => this._onLoseFocus(event);
        this._keyDownHandler = event => this._onKeyDown(event);

        this._setPayload(this._payload);
    };

    Editor.prototype._getPayload = function() {
        this._payload.text = this.form.querySelector('input').value;

        return this._payload;
    };

    Editor.prototype._setPayload = function(payload) {
        this.form.querySelector('input').value = payload.text;
    };

    Editor.prototype.show = function() {
        this.form.style.left = this._position[0] + 'px';
        this.form.style.top = this._position[1] + 'px';

        this.overlay.classList.remove('hidden');
        this.form.classList.remove('hidden');
        this.form.focus();

        this.overlay.addEventListener('click', this._loseFocusHandler);
        this.form.addEventListener('keydown', this._keyDownHandler);
    };

    Editor.prototype._close = function() {
        this.overlay.classList.add('hidden');
        this.form.classList.add('hidden');

        this.overlay.removeEventListener('click', this._loseFocusHandler);
        this.form.removeEventListener('keydown', this._keyDownHandler);
    };

    Editor.prototype._onKeyDown = function(event) {
        if (event.keyCode === 27) { // Escape pressed
            this._close();
        } else if (event.keyCode === 13) { // Enter pressed
            this.dispatch.save(this._getPayload());
            this._close();
        }
    };

    Editor.prototype._onLoseFocus = function(event) {
        this._close();
    };

    app.Editor = Editor;
}(app));
