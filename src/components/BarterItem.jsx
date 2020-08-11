import React from 'react';

function BarterItem(props) {   
    const imgClassBase = 'barter-icon-';
    let imgClass;
    switch (props.slots){
        case 2:
            imgClass = `${imgClassBase}1x-2x`;    
            break;
        case 3:
            imgClass = `${imgClassBase}1x-3x`;    
            break;
        case 4:
            imgClass = `${imgClassBase}2x-2x`;    
            break;
        case 6:
            imgClass = `${imgClassBase}2x-3x`;    
            break;
        case 8:
            imgClass = `${imgClassBase}2x-4x`;    
            break;
        case 9:
            imgClass = `${imgClassBase}2x-2x`;    
            break;
        case 1:
        default:
            imgClass = `${imgClassBase}1x-1x`;    
    };
    
    let imgSrc = props.src;
    
    if(props.rotate){
        imgSrc = `//images.weserv.nl/?url=${encodeURIComponent(imgSrc)}&ro=${props.rotate}}`;
        // imgClass = `${imgClassBase}2x-1x`;
    }
    
    return <img
        alt = {props.name}
        title = {props.name}
        className = {imgClass}
        src = {imgSrc}
    />
}

export default BarterItem;


