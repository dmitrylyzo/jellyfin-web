import layoutManager from '../../components/layoutManager';
import './emby-button.scss';

export default function PaperIconButtonLight(props) {
    let cssClass = `paper-icon-button-light ${props.className}`;

    if (layoutManager.tv) {
        cssClass += ' show-focus';
    }

    const attributes = {};

    for (const prop in props) {
        if (prop.startsWith('data-')) {
            attributes[prop] = props[prop];
        }
    }

    return (
        <button className={cssClass} {...attributes} title={props.title} aria-label={props['aria-label']}>
            {props.children}
        </button>
    );
}
