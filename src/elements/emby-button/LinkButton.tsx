import layoutManager from '../../components/layoutManager';
import shell from '../../scripts/shell';
import { appRouter } from '../../components/appRouter';
import { appHost } from '../../components/apphost';
import './emby-button.scss';

function onAnchorClick(e) {
    const href = e.target.getAttribute('href') || '';
    if (href !== '#') {
        if (e.target.getAttribute('target')) {
            if (!appHost.supports('targetblank')) {
                e.preventDefault();
                shell.openUrl(href);
            }
        } else {
            e.preventDefault();
            appRouter.show(href);
        }
    } else {
        e.preventDefault();
    }
}

export default function LinkButton(props) {
    if (props['data-autohide'] === 'true' && !appHost.supports('externallinks')) {
        return null;
    }

    let cssClass = `${props.className} emby-button`;

    // TODO replace all instances of element-showfocus with this method
    if (layoutManager.tv) {
        // handles all special css for tv layout
        // this method utilizes class chaining
        cssClass += ' show-focus';
    }

    const attributes = {};

    for (const prop in props) {
        if (prop.startsWith('data-')) {
            attributes[prop] = props[prop];
        }
    }

    return (
        <a className={cssClass} {...attributes} href={props.href} target={props.target} title={props.title} aria-label={props['aria-label']} onClick={onAnchorClick}>
            {props.children}
        </a>
    );
}
