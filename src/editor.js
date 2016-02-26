(function(app, undefined) {
    'use strict';

    function Editor() {

        this.form = document.getElementsByClassName('form-edit')[0];

        this.overlay = document.getElementsByClassName('overlay')[0];
        if (!this.overlay) { // Create overlay if not exist
            this.overlay = document.createElement('div');
            this.overlay.classList.add('overlay', 'hidden');
            document.body.insertBefore(this.overlay, this.form);
        }

        // d3 event bus;
        this.dispatch = d3.dispatch('close');

        this._loseFocusHandler = event => this.onLoseFocus(event);
        this._keyDownHandler = event => this.onKeyDown(event);
    };

    Editor.prototype.getData = function() {
        return this.form.querySelector('input').value;
    };

    Editor.prototype.show = function(position) {
        this.form.style.left = position[0] + 'px';
        this.form.style.top = position[1] + 'px';

        this.overlay.classList.remove('hidden');
        this.form.classList.remove('hidden');
        this.form.focus();

        this.overlay.addEventListener('click', this._loseFocusHandler);
        this.form.addEventListener('keydown', this._keyDownHandler);

    };

    Editor.prototype.close = function() {
        this.overlay.classList.add('hidden');
        this.form.classList.add('hidden');

        this.overlay.removeEventListener('click', this._loseFocusHandler);
        this.form.removeEventListener('keydown', this._keyDownHandler);
    };

    Editor.prototype.onKeyDown = function(event) {
        if (event.keyCode === 27) { // Escape pressed
            this.dispatch.close(false);
        } else if (event.keyCode === 13) { // Enter pressed
            this.dispatch.close(true);
        }
    };

    Editor.prototype.onLoseFocus = function(event) {
        this.dispatch.close(false);
    };

    app.Editor = Editor;
}(app));
