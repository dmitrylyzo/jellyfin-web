import React, { Component } from 'react';
import Button from '../emby-button/Button';
import serverNotifications from '../../scripts/serverNotifications';
import { Events } from 'jellyfin-apiclient';
import globalize from '../../scripts/globalize';
import ServerConnections from '../../components/ServerConnections';

export class PlayStateButton extends Component {
    state = {
        itemId: '',
        serverId: '',
        itemType: '',
        played: false,
    };

    //element: null;

    constructor(props) {
        super(props);

        //this.element = React.createRef()

        const item = props.item;
        let itemId;
        let serverId;
        let itemType;
        let played;

        if (item) {
            itemId = item.Id;
            serverId = item.ServerId;
            itemType = item.Type;
            played = item.UserData?.Played || false;
        } else {
            itemId = props['data-id'];
            serverId = props['data-serverid'];
            itemType = props['data-itemtype'];
            played = props['data-played'];
        }

        this.state.itemId = itemId;
        this.state.serverId = serverId;
        this.state.itemType = itemType;
        this.state.played = played;

        this.onClick = this.onClick.bind(this);
        this.onUserDataChanged = this.onUserDataChanged.bind(this);
    }

    setItem(item) {
        if (item) {
            const itemId = item.Id;
            const serverId = item.ServerId;
            const itemType = item.Type;
            const played = item.UserData?.Played || false;

            if (itemId && serverId) {
                this.bindEvents();

                this.setState({
                    itemId,
                    serverId,
                    itemType,
                    played
                });

                return;
            }
        }

        this.unbindEvents();

        this.setState({
            itemId: '',
            serverId: '',
            itemType: '',
            played: false
        });
    }

    bindEvents() {
        this.unbindEvents();

        //this.element.current.addEventListener('click', this.onClick);
        Events.on(serverNotifications, 'UserDataChanged', this.onUserDataChanged);
    }

    unbindEvents() {
        //this.element.current.removeEventListener('click', this.onClick);
        Events.off(serverNotifications, 'UserDataChanged', this.onUserDataChanged);
    }

    onClick() {
        const itemId = this.state.itemId;
        const serverId = this.state.serverId;

        if (!itemId || !serverId) {
            //throw new Error('Unexpected click - item Id or server Id are undefined');
            return;
        }

        const apiClient = ServerConnections.getApiClient(serverId);
        const currentUserId = apiClient.getCurrentUserId();
        const date = new Date();

        if (!this.state.played) {
            apiClient.markPlayed(currentUserId, itemId, date);
            this.setState({played: true});
        } else {
            apiClient.markUnplayed(currentUserId, itemId, date);
            this.setState({played: false});
        }
    }

    onUserDataChanged(e, apiClient, userData) {
        if (userData.ItemId === this.state.itemId) {
            this.setState({played: userData.Played});
        }
    }

    componentDidMount() {
        if (this.state.itemId && this.state.serverId) {
            this.bindEvents();
        }
    }

    componentWillUnmount() {
        this.unbindEvents();
    }

    /*handleRef(ref) {
        this.element.current = ref;
    }*/

    render() {
        let buttonClass = this.props.className;

        if (this.state.played) {
            buttonClass += ' playstatebutton-played';
        }

        const iconClass = this.state.played ? 'playstatebutton-icon-played' : 'playstatebutton-icon-unplayed';

        const itemType = this.state.itemType;
        let title;

        if (itemType !== 'AudioBook' && itemType !== 'AudioPodcast') {
            title = globalize.translate('Watched');
        } else {
            title = globalize.translate('Played');
        }

        return (
            <Button
                className={buttonClass}
                title={title}
                aria-label={this.props['aria-label']}
                data-action='none'
                // FIXME: Probably unnecessary
                data-id={this.state.itemId}
                data-serverid={this.state.serverId}
                data-itemtype={itemType}
                data-played={this.state.played}
                onClick={this.onClick}
            >
                <span className={`material-icons cardOverlayButtonIcon cardOverlayButtonIcon-hover check ${iconClass}`}></span>
            </Button>
        );
    }
}

/*function PlayStateButton(props) {
    const attributes = {};

    for (const prop in props) {
        if (prop.startsWith('data-')) {
            attributes[prop] = props[prop];
        }
    }

    const item = props.item;

    const button = (
        <Button className={props.className}
            {...attributes}
            title={props.title}
            aria-label={props['aria-label']}
            data-action='none'
        >
            <span className='material-icons cardOverlayButtonIcon cardOverlayButtonIcon-hover check'></span>
        </Button>
    );

    button.setItem = (item) => {
        if (item) {
            button.setAttribute('data-id', item.Id);
            button.setAttribute('data-serverid', item.ServerId);

            const played = item.UserData?.Played;
            //setState(button, played);
            //bindEvents(button);

            //setTitle(button, item.Type);
        } else {
            button.removeAttribute('data-id');
            button.removeAttribute('data-serverid');
            button.removeAttribute('data-played');
            //clearEvents(button);
        }
    };

    button.setItem(item);

    return button;
}*/

export default PlayStateButton;
