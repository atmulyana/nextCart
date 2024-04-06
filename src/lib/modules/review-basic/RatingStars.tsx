/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';

function Star({fill, size, onClick}: {fill: number | boolean, size: number, onClick?: () => void}) {
    let scale = 0;
    if (typeof(fill) == 'number') scale = fill < 0 ? 0 : fill > 1 ? 1 : fill;
    else scale = !!fill ? 1 : 0;
    //scale = Math.round( (2 + scale * 20) * (size / 24) );
    // return <div className='relative flex-none bg-blend-lighten' style={{height: `${size}px`, width: `${size}px`}}>
    //     <div className='absolute top-0 left-0 bottom-0 bg-amber-500' style={{width: `${scale}px`}}></div>
    //     <Icon name='star' className='absolute top-0 left-0 z-10 bg-[--bg-color] text-[--fg-color] fill-[--fg-color]' />
    // </div>;
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        fill="none"
        strokeWidth={2}
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`feather feather-star flex-none text-[--fg-color] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        height={size}
        width={size}
        onClick={onClick}
    >
        <mask id="ratingStarMask">
            <rect x="0" y="0" width="24" height="24" fill="black" />
            <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill='white'
                strokeWidth={0}
            ></polygon>
        </mask>
        <rect x={2} y={2} height={22} width={scale * 20} fill="#f59e0b" strokeWidth={0} mask="url(#ratingStarMask)" />
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>;
}

export default function RatingStars({
    rating,
    className = '',
    showNumber = true,
    numberPosition = 'right',
    starSize = 16,
    onClick,
}: {
    rating: number,
    className?: string,
    showNumber?: boolean,
    numberPosition?: 'left' | 'right', 
    starSize?: number,
    onClick?: (rating: number) => void
}) {
    let ratingVal = rating;
    if (ratingVal > 5) ratingVal = 5;
    else if (ratingVal < 0) ratingVal = 0;
    else ratingVal = Math.round(ratingVal * 10) / 10;
    rating = ratingVal;

    const stars: React.ReactElement[] = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(<Star
            key={i}
            fill={ratingVal}
            size={starSize}
            onClick={typeof(onClick) == 'function' ? (() => onClick(i)) : void(0)}
        />);
        ratingVal -= 1;
    }

    return <span
        className={`!inline-flex ${className}`}
        style={{height:`${starSize}px`, fontSize:`${starSize}px`, lineHeight:`${starSize}px`}}
    >
        {showNumber && numberPosition == 'left' && <strong className='mr-2'>{rating}</strong>}
        {stars}
        {showNumber && numberPosition != 'left' && <strong className='ml-2'>{rating}</strong>}
    </span>;
}