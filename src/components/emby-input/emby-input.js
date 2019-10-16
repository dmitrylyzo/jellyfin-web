define(['layoutManager', 'browser', 'dom', 'css!./emby-input', 'registerElement'], function (layoutManager, browser, dom) {
    'use strict';

    var EmbyInputPrototype = Object.create(HTMLInputElement.prototype);

    var inputId = 0;
    var supportsFloatingLabel = false;

    if (Object.getOwnPropertyDescriptor && Object.defineProperty) {

        var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

        // descriptor returning null in webos
        if (descriptor && descriptor.configurable) {
            var baseSetMethod = descriptor.set;
            descriptor.set = function (value) {
                baseSetMethod.call(this, value);

                this.dispatchEvent(new CustomEvent('valueset', {
                    bubbles: false,
                    cancelable: false
                }));
            };

            Object.defineProperty(HTMLInputElement.prototype, 'value', descriptor);
            supportsFloatingLabel = true;
        }
    }

    EmbyInputPrototype.createdCallback = function () {

        if (!this.id) {
            this.id = 'embyinput' + inputId;
            inputId++;
        } if (this.classList.contains('emby-input')) {
            return;
        }

        this.classList.add('emby-input');

        var parentNode = this.parentNode;
        var document = this.ownerDocument;
        var label = document.createElement('label');
        label.innerHTML = this.getAttribute('label') || '';
        label.classList.add('inputLabel');
        label.classList.add('inputLabelUnfocused');

        label.htmlFor = this.id;
        parentNode.insertBefore(label, this);
        this.labelElement = label;

        dom.addEventListener(this, 'focus', function () {
            onChange.call(this);

            // For Samsung orsay devices
            if (document.attachIME) {
                document.attachIME(this);
            }

            label.classList.add('inputLabelFocused');
            label.classList.remove('inputLabelUnfocused');
        }, {
            passive: true
        });

        dom.addEventListener(this, 'blur', function () {
            onChange.call(this);
            label.classList.remove('inputLabelFocused');
            label.classList.add('inputLabelUnfocused');
        }, {
            passive: true
        });

        dom.addEventListener(this, 'change', onChange, {
            passive: true
        });
        dom.addEventListener(this, 'input', onChange, {
            passive: true
        });
        dom.addEventListener(this, 'valueset', onChange, {
            passive: true
        });

        if (browser.orsay) {
            if (this === document.activeElement) {
                //Make sure the IME pops up if this is the first/default element on the page
                if (document.attachIME) {
                    document.attachIME(this);
                }
            }
        }

        // Prevent editing until clicked or Return pressed (to block on-screen keyboard)
        // FIXME: Doesn't work in Tizen browser due to Back button handled by the browser itself (actually not needed while keyboard is in use)
        // FIXME: Doesn't work in webOS due to Back button handled by webOS itself
        if (layoutManager.tv && browser.tizen && window.appMode !== undefined) {
            var unlock = function(input) {
                if (input.readOnly && !input.readOnlyInitial) {
                    input.readOnly = false;

                    // Fire empty keydown event to force webOS to show cursor
                    if (browser.web0s) {
                        var event = new KeyboardEvent('keydown');
                        input.dispatchEvent(event);
                    }
                }

                return !input.readOnly;
            }

            this.addEventListener('click', function() {
                unlock(this);
            });

            this.addEventListener('focus', function() {
                this.readOnlyInitial = this.readOnly || false;
                this.readOnly = true;
            });

            this.addEventListener('blur', function() {
                this.readOnly = this.readOnlyInitial || false;
            });

            this.addEventListener('keydown', function(e) {
                switch (e.key) {
                case '':
                case 'Unidentified': // webOS emulator generates keydown event with 'Unidentified' after cursor move
                    break;

                case 'Enter':
                    if (this.readOnly) {
                        unlock(this);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    break;

                case 'Escape':
                case 'XF86Back': // Tizen Remote Control's Back
                    if (!this.readOnly) {
                        this.readOnly = true;
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    break;

                case 'ArrowLeft':
                case 'ArrowUp':
                case 'ArrowRight':
                case 'ArrowDown':
                    if (!this.readOnly) {
                        e.stopPropagation();
                    }
                    break;

                default:
                    unlock(this);
                }
            });
        }
    };

    function onChange() {

        var label = this.labelElement;
        if (this.value) {
            label.classList.remove('inputLabel-float');
        } else {

            var instanceSupportsFloat = supportsFloatingLabel && this.type !== 'date' && this.type !== 'time';

            if (instanceSupportsFloat) {
                label.classList.add('inputLabel-float');
            }
        }
    }

    EmbyInputPrototype.attachedCallback = function () {

        this.labelElement.htmlFor = this.id;

        onChange.call(this);
    };

    EmbyInputPrototype.label = function (text) {
        this.labelElement.innerHTML = text;
    };

    document.registerElement('emby-input', {
        prototype: EmbyInputPrototype,
        extends: 'input'
    });
});