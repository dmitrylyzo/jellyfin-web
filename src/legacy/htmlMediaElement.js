/**
 * Polyfill for HTMLMediaElement
 * - HTMLMediaElement.play
 *   Return a `Promise`.
 */

(function (HTMLMediaElement) {
    'use strict';

    function isPlayPromised() {
        const elem = document.createElement('audio');
        elem.classList.add('testMediaPlayerAudio');
        elem.classList.add('hide');

        document.body.appendChild(elem);

        elem.volume = 1; // Volume should not be zero to trigger proper permissions
        elem.src = 'assets/audio/silence.mp3'; // Silent sound

        let promised = false;

        try {
            const promise = elem.play();
            promised = typeof promise?.then === 'function';
        } catch (err) {
            console.error('HTMLMediaElement.play test failed', err);
        }

        elem.pause();
        elem.remove();

        return promised;
    }

    if (!isPlayPromised()) {
        const HTMLMediaElement_proto = HTMLMediaElement.prototype;
        const real_play = HTMLMediaElement_proto.play;

        HTMLMediaElement_proto.play = function () {
            try {
                real_play.apply(this, arguments);
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            }
        };
    }
}(HTMLMediaElement));
