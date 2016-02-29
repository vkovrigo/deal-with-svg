(function(app, undefined) {
    'use strict';

    const key = {
        enter: 13,
        escape: 27
    };

    class AbstractEditor {
        constructor(position) {
            this.overlay = document.getElementsByClassName('overlay')[0];
            if (!this.overlay) { // Create overlay if not exist
                this.overlay = document.createElement('div');
                this.overlay.classList.add('overlay', 'hidden');
                // Insert overlay as first element in body
                document.body.insertBefore(this.overlay, document.body.childNodes[0]);
            }

            // d3 event bus;
            this.dispatch = d3.dispatch('save');

            this._position = position;

            this._loseFocusHandler = event => this._onLoseFocus(event);
            this._keyDownHandler = event => this._onKeyDown(event);
        }

        show() {
            this.form.style.left = this._position[0] + 'px';
            this.form.style.top = this._position[1] + 'px';

            this.overlay.classList.remove('hidden');
            this.form.classList.remove('hidden');
            this.form.focus();

            this.overlay.addEventListener('click', this._loseFocusHandler);
            this.form.addEventListener('keydown', this._keyDownHandler);
        }

        _close() {
            this.overlay.classList.add('hidden');
            this.form.classList.add('hidden');

            this.overlay.removeEventListener('click', this._loseFocusHandler);
            this.form.removeEventListener('keydown', this._keyDownHandler);
        }

        _onLoseFocus(event) {
            this._close();
        }

        _onKeyDown(event) {
            if (event.keyCode === key.escape) {
                this._close();
            }
        }
    }

    class Editor extends AbstractEditor {
        constructor(position, payload) {
            super(position);

            this.form = document.getElementsByClassName('form-edit')[0];

            this._payload = payload || { id: idGenerator(), text: '', error: false };

            this._setPayload(this._payload);
        }

        _getPayload() {
            this._payload.text = this.form.querySelector('input').value;

            return this._payload;
        }

        _setPayload(payload) {
            this.form.querySelector('input').value = payload.text;
        }

        _onKeyDown(event) {
            super._onKeyDown(event);

            if (event.keyCode === key.enter) {
                this.dispatch.save(this._getPayload());
                this._close();
            }
        }
    }

    class ConverterEditor extends AbstractEditor {
        constructor(position, payload) {
            super(position);

            this.form = document.getElementsByClassName('form-edit-converter')[0];

            this._payload = payload || { id: idGenerator(), from: '', to: '' };

            this._setPayload(this._payload);
        }

        _getPayload() {
            this._payload.from = this.form.querySelector('input.from').value;
            this._payload.to = this.form.querySelector('input.to').value;

            return this._payload;
        }

        _setPayload(payload) {
            this.form.querySelector('input.from').value = payload.from;
            this.form.querySelector('input.to').value = payload.to;
        }

        _onKeyDown(event) {
            super._onKeyDown(event);

            if (event.keyCode === key.enter) {
                if (event.target.classList.contains('from')) { // Switch to next input
                    this.form.querySelector('input.to').focus();
                } else {
                    this.dispatch.save(this._getPayload());
                    this._close();
                }
            }
        }
    }

    app.Editor = Editor;
    app.ConverterEditor = ConverterEditor;
}(app));
