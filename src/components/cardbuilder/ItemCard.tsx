import React, { FunctionComponent } from 'react';
import Card, { Shape } from './Card';
import cardBuilder from './cardBuilder';
import itemHelper from '../itemHelper';
import layoutManager from '../layoutManager';
import { playbackManager } from '../playback/playbackmanager';

const btnCssClass = 'cardOverlayButton cardOverlayButton-hover itemAction paper-icon-button-light';

function PlayButton() {
    import('../../elements/emby-button/paper-icon-button-light');

    const cssClass = `${btnCssClass} cardOverlayFab-primary`;

    return (
        <button is='paper-icon-button-light' class={cssClass} data-action='resume'>
            <span className='material-icons cardOverlayButtonIcon cardOverlayButtonIcon-hover play_arrow'></span>
        </button>
    );
}

function PlayStateButton(props) {
    import('../../elements/emby-playstatebutton/emby-playstatebutton');

    const item = props.item;
    const userData = props.userData;

    return (
        <button is='emby-playstatebutton' type='button' class={btnCssClass}
            data-action='none'
            data-id={item.Id}
            data-serverid={item.ServerId}
            data-itemtype={item.Type}
            data-played={userData.Played}
        >
            <span className='material-icons cardOverlayButtonIcon cardOverlayButtonIcon-hover check'></span>
        </button>
    );
}

function RatingButton(props) {
    import('../../elements/emby-ratingbutton/emby-ratingbutton');

    const item = props.item;
    const userData = props.userData;

    return (
        <button is='emby-ratingbutton' type='button' class={btnCssClass}
            data-action='none'
            data-id={item.Id}
            data-serverid={item.ServerId}
            data-itemtype={item.Type}
            data-likes={userData.Likes}
            data-isfavorite={userData.IsFavorite}
        >
            <span className='material-icons cardOverlayButtonIcon cardOverlayButtonIcon-hover favorite'></span>
        </button>
    );
}

function MoreButton() {
    import('../../elements/emby-button/paper-icon-button-light');

    return (
        <button is='paper-icon-button-light' class={btnCssClass} data-action='menu'>
            <span className='material-icons cardOverlayButtonIcon cardOverlayButtonIcon-hover more_vert'></span>
        </button>
    );
}

type IProps = {
    action?: string,
    cardLayout?: boolean,
    coverImage?: boolean,
    index?: number,
    item: any,
    overlayMarkPlayedButton?: boolean,
    overlayMoreButton?: boolean,
    overlayPlayButton?: boolean,
    overlayRateButton?: boolean,
    shape?: Shape
    title?: string,
    width: number,
    options?: any
}

const ItemCard: FunctionComponent<IProps> = ({
    action,
    cardLayout,
    coverImage,
    index,
    item,
    overlayMarkPlayedButton = true,
    overlayMoreButton = true,
    overlayPlayButton = true,
    overlayRateButton = true,
    shape,
    width,
    options = {}
}: IProps) => {
    // FIXME: without string
    let strShape = shape || '';

    if (!strShape) {
        cardBuilder.setCardData([item], options);
        strShape = options.shape;
    }

    const imgInfo = cardBuilder.getCardImageUrl(item, window.ApiClient, { width }, strShape);
    const imgUrl = imgInfo.imgUrl;
    const blurhash = imgInfo.blurhash;
    const userData = item.UserData

    let className;
    if (layoutManager.desktop) {
        className = 'card-hoverable';
    }

    const nameWithPrefix = (item.SortName || item.Name || '');
    const prefix = nameWithPrefix.substring(0, Math.min(3, nameWithPrefix.length)).toUpperCase();

    return (
        <Card
            className={className}
            backgroundClass={!imgUrl ? cardBuilder.getDefaultBackgroundClass(item.Name) : null}
            blurhash={blurhash}
            cardLayout={cardLayout}
            coverImage={coverImage || imgInfo.coverImage}
            defaultText={cardBuilder.getDefaultText(item, {})}
            imgUrl={imgUrl}
            shape={strShape}
            title={item.Name}
            attributes={{
                'data-index': index,
                'data-timerid': item.TimerId,
                'data-seriestimerid': item.SeriesTimerId,
                'data-action': action,
                'data-isfolder': item.IsFolder,
                'data-serverid': (item.ServerId || options.serverId),
                'data-id': (item.Id || item.ItemId),
                'data-type': item.Type,
                'data-prefix': prefix,
                'data-positionticks': userData?.PlaybackPositionTicks,
                'data-collectionid': options.collectionId,
                'data-playlistid': options.playlistId,
                'data-mediatype': item.MediaType,
                'data-channelid': item.ChannelId,
                'data-path': item.Path,
                'data-collectiontype': item.CollectionType,
                'data-context': options.context,
                'data-parentid': options.parentId,
                'data-startdate': item.StartDate?.toString(),
                'data-enddate': item.EndDate?.toString()
            }}
        >
            <div className='cardOverlayContainer itemAction' data-action={action}>
                {overlayPlayButton && playbackManager.canPlay(item) ? <PlayButton action={action}/> : null}
                {overlayMarkPlayedButton || overlayMoreButton || overlayRateButton ? (
                    <div className='cardOverlayButton-br flex'>
                        {overlayMarkPlayedButton && itemHelper.canMarkPlayed(item) ? <PlayStateButton item={item} userData={userData}/> : null}
                        {overlayMarkPlayedButton && itemHelper.canRate(item) ? <RatingButton item={item} userData={userData}/> : null}
                        {overlayMoreButton ? <MoreButton/> : null}
                    </div>
                ) : null}
            </div>
        </Card>
    );
};

export default ItemCard;
