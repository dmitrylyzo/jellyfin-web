import React, { Component } from 'react';
import Button from '../emby-button/Button';
import serverNotifications from '../../scripts/serverNotifications';
import { Events } from 'jellyfin-apiclient';
import globalize from '../../scripts/globalize';
import ServerConnections from '../../components/ServerConnections';

export class RatingButton extends Component {
    state = {
        itemId: '',
        serverId: '',
        itemType: '',
        favorite: false,
        likes: false
    };

    //element: null;

    constructor(props) {
        super(props);

        //this.element = React.createRef()

        const item = props.item;
        let itemId;
        let serverId;
        let itemType;
        let favorite;
        let likes;

        if (item) {
            itemId = item.Id;
            serverId = item.ServerId;
            itemType = item.Type;
            favorite = item.UserData?.IsFavorite || false;
            likes = item.UserData?.Likes || false;
        } else {
            itemId = props['data-id'];
            serverId = props['data-serverid'];
            itemType = props['data-itemtype'];
            favorite = props['data-isfavorite'];
            likes = props['data-likes'];
        }

        this.state.itemId = itemId;
        this.state.serverId = serverId;
        this.state.itemType = itemType;
        this.state.favorite = favorite;
        this.state.likes = likes;

        this.onClick = this.onClick.bind(this);
        this.onUserDataChanged = this.onUserDataChanged.bind(this);
    }

    setItem(item) {
        if (item) {
            const itemId = item.Id;
            const serverId = item.ServerId;
            const itemType = item.Type;
            const favorite = item.UserData?.IsFavorite || false;
            const likes = item.UserData?.Likes || false;

            if (itemId && serverId) {
                this.bindEvents();

                this.setState({
                    itemId,
                    serverId,
                    itemType,
                    favorite,
                    likes
                });

                return;
            }
        }

        this.unbindEvents();

        this.setState({
            itemId: '',
            serverId: '',
            itemType: '',
            favorite: false,
            likes: false
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

        apiClient.updateFavoriteStatus(apiClient.getCurrentUserId(), itemId, !this.state.favorite).then((userData) => {
            this.onUserDataChanged(null, apiClient, userData);
        });
    }

    onUserDataChanged(e, apiClient, userData) {
        if (userData.ItemId === this.state.itemId) {
            this.setState({
                favorite: userData.IsFavorite,
                likes: userData.Likes
            });
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
        let iconClass;

        if (this.state.favorite) {
            buttonClass += ' ratingbutton-withrating';
            iconClass += ' ratingbutton-icon-withrating';
        }

        return (
            <Button
                className={buttonClass}
                title={globalize.translate('Favorite')}
                aria-label={this.props['aria-label']}
                data-action='none'
                // FIXME: Probably unnecessary
                data-id={this.state.itemId}
                data-serverid={this.state.serverId}
                data-itemtype={this.state.itemType}
                data-isfavorite={this.state.favorite}
                data-likes={this.state.likes}
                onClick={this.onClick}
            >
                <span className={`material-icons cardOverlayButtonIcon cardOverlayButtonIcon-hover favorite ${iconClass}`}></span>
            </Button>
        );
    }
}

export default RatingButton;
