import React, { FunctionComponent } from 'react';
import cardBuilder from './cardBuilder';
import layoutManager from '../layoutManager';

function CardPadder(props) {
    return (
        <div className={`cardPadder cardPadder-${props.shape}`}>{props.children}</div>
    );
}

function ImageContainer(props) {
    if (props.imgUrl) {
        if (layoutManager.tv) {
            // Don't use the IMG tag with safari because it puts a white border around it
            return (
                <div
                    className={`${props.cardImageContainerClass} cardContent lazy`}
                    data-src={props.imgUrl}
                    data-blurhash={props.blurhash}
                >
                    {props.children}
                </div>
            );
        } else {
            // Don't use the IMG tag with safari because it puts a white border around it
            return (
                <button
                    className={`${props.cardImageContainerClass} cardContent itemAction lazy`}
                    data-action={props.action}
                    data-blurhash={props.blurhash}
                    data-src={props.imgUrl}
                >
                    {props.children}
                </button>
            );
        }
    } else {
        if (layoutManager.tv) {
            return (
                <div className={`${props.cardImageContainerClass} cardContent`}>{props.children}</div>
            );
        } else {
            return (
                <button className={`${props.cardImageContainerClass} cardContent itemAction`} data-action={props.action}>{props.children}</button>
            );
        }
    }
};

export enum Shape {
    Portrait = 'portrait',
    Thumb = 'thumb',
    Square = 'square',
    Banner = 'banner',
    Backdrop = 'backdrop',
    SmallBackdrop = 'smallBackdrop',
}

type IProps = {
    attributes?: any,
    backgroundClass?: string,
    blurhash?: string,
    cardLayout?: boolean,
    className?:string,
    coverImage?: boolean,
    defaultText?: string,
    imgUrl?: string,
    overlay?: any,
    shape?: Shape,
    title?: string,
    children?: any
}

const Card: FunctionComponent<IProps> = ({
    attributes,
    backgroundClass,
    blurhash,
    cardLayout,
    children,
    className,
    coverImage,
    defaultText,
    imgUrl,
    shape = Shape.Portrait,
    title
}: IProps) => {
    const cardClass = `card ${shape}Card ${className}`;

    let cardBoxClass = cardLayout ? 'cardBox visualCardBox' : 'cardBox';

    let cardImageContainerClass = 'cardImageContainer';

    if (coverImage) {
        cardImageContainerClass += ' coveredImage';

        //if (item.Type === 'TvChannel') {
        //    cardImageContainerClass += ' coveredImage-contain';
        //}
    }

    if (!imgUrl) {
        if (!backgroundClass) {
            backgroundClass = cardBuilder.getDefaultBackgroundClass('');
        }

        cardImageContainerClass += ` ${backgroundClass}`;
    }

    return (
        <div className={cardClass} {...attributes}>
            <div className={cardBoxClass}>
                <div className='cardScalable'>
                    <CardPadder shape={shape}>
                        {imgUrl ? <div dangerouslySetInnerHTML={{__html: defaultText}}></div> : null}
                    </CardPadder>
                    <ImageContainer
                        blurhash={blurhash}
                        cardImageContainerClass={cardImageContainerClass}
                        imgUrl={imgUrl}
                    >
                        {!imgUrl ? <div dangerouslySetInnerHTML={{__html: defaultText}}></div> : null}
                    </ImageContainer>
                    {children}
                </div>
                <div className='cardFooter visualCardBox-cardFooter'>
                    <div className='cardText flex align-items-center'>
                    </div>
                    <div className='cardText cardText-secondary'>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
