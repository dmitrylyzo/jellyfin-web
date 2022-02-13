import layoutManager from '../../components/layoutManager';
import './emby-button.scss';

export default function Button(props) {
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
        <button className={cssClass} {...attributes} title={props.title} aria-label={props['aria-label']} onClick={props.onClick}>
            {props.children}
        </button>
    );
}
