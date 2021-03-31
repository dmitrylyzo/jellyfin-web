//import 'consolejs';
import appSettings from '../../scripts/settings/appSettings';
import './devtools.scss'
import template from './devtools.template.html';

const endThreshold = 20;

let container;
let interval;

function scrollDown() {
    container.scrollTop = container.scrollHeight;
}

function startScrollDown() {
    if (interval) return;

    interval = setInterval(() => {
        container.scrollTop = container.scrollHeight;
    }, 1000);
}

function stopScrollDown() {
    clearInterval(interval);
    interval = null;
}

if (appSettings.devmodeShowLog()) {
    import('consolejs').then(() => {
        document.body.insertAdjacentHTML('beforeend', template);

        ConsoleJS.init({
            selector: '.devtools-console'
        });

        container = document.querySelector('.devtools-console-container');

        container.addEventListener('scroll', () => {
            const atEnd = container.scrollTop + container.clientHeight + endThreshold > container.scrollHeight;
            if (atEnd) {
                startScrollDown();
            } else {
                stopScrollDown();
            }
        });

        startScrollDown();
    });
}
