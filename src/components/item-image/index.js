import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {renderToStaticMarkup} from "react-dom/server";
import ImageViewer from 'react-simple-image-viewer';

import './index.css';

const colors = {
    black: {r: 0, g: 0, b: 0, alpha: 77/255},
    blue: {r: 28, g: 65, b: 86, alpha: 77/255},
    default: {r: 127, g: 127, b: 127, alpha: 77/255},
    green: {r: 21, g: 45, b: 0, alpha: 77/255},
    grey: {r: 29, g: 29, b: 29, alpha: 77/255},
    orange: {r: 60, g: 25, b: 0, alpha: 77/255},
    red: {r: 109, g: 36, b: 24, alpha: 77/255},
    violet: {r: 76, g: 42, b: 85, alpha: 77/255},
    yellow: {r: 104, g: 102, b: 40, alpha: 77/255},
};

function ItemImage({ item, backgroundScale = 1, imageField = 'baseImageLink', nonFunctionalOverlay = true, imageViewer = false, children = '' }) {
    const refContainer = useRef();
    /*const [containerDimensions, setDimensions] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (!refContainer.current) return;
        const resizeObserver = new ResizeObserver(() => {
            setDimensions({
                width: refContainer.current.offsetWidth,
                height: refContainer.current.offsetHeight,
            });
        });
        resizeObserver.observe(refContainer.current);
        return () => resizeObserver.disconnect();
    }, []);*/

    const refImage = useRef();
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0});
    useEffect(() => {
        if (!refImage.current) return;
        const resizeObserver = new ResizeObserver(() => {
            setImageDimensions({
                width: refImage.current.width,
                height: refImage.current.height,
            });
        });
        resizeObserver.observe(refImage.current);
        return () => resizeObserver.disconnect();
    }, []);

    const loadingImage = useMemo(() => {
        const loadingStyle = {
            WebkitMask:`url(${item[imageField]}) center/cover`,
                  mask:`url(${item[imageField]}) center/cover`,
        };
        if (!item.types?.includes('loading')) {
            loadingStyle.display = 'none';
        }
        
        return (
            <div className="item-image-mask" style={loadingStyle}></div>
        );
    }, [item, imageField]);

    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const openImageViewer = useCallback(() => {
        setIsViewerOpen(true);
      }, []);
    const closeImageViewer = () => {
        setIsViewerOpen(false);
    };
    const viewerBackgroundStyle = {
        backgroundColor: 'rgba(0,0,0,.9)',
        zIndex: 20,
        maxWidth: '100%',
        maxHeight: '100%',
    };

    const imageElement = useMemo(() => {
        const imageStyle = {};
        if (item.types?.includes('loading')) {
            imageStyle.display = 'none';
        }
        if (imageViewer) {
            imageStyle.cursor = 'zoom-in';
        }
        //console.log(dimensions);
        return <img ref={refImage} onClick={openImageViewer} src={item[imageField]} alt={item.name} loading="lazy" style={imageStyle}/>;
    }, [item, refImage, imageField, openImageViewer, imageViewer]);
    
    const textSize = useMemo(() => {
        const baseWidth = (item.width * 63) +1;
        return Math.min(12 * (imageDimensions.width / baseWidth), 16);
    }, [imageDimensions, item]);

    const { colorString, gridPercentX, gridPercentY } = useMemo(() => {
        const color = colors[item.backgroundColor];
        return {
            colorString: `${color.r}, ${color.g}, ${color.b}, ${color.alpha}`,
            gridPercentX: (1 / item.width) * 100,
            gridPercentY: (1 / item.height) * 100,
        };
    }, [item]);

    const nonFunctional = useMemo(() => {
        if (!nonFunctionalOverlay || !item.types.includes('gun') || !item.properties?.defaultPreset) {
            return <></>;
        }
        return <div className='item-nonfunctional-mask' onClick={openImageViewer} style={{
            position: 'absolute',
            boxSizing: 'border-box',
            top: `${1*backgroundScale}px`, 
            left: `${1*backgroundScale}px`,
            height: `calc(100% - ${2*backgroundScale}px)`,
            width:  `calc(100% - ${2*backgroundScale}px)`,
            fallbacks: [
                {width: `-webkit-calc(100% - ${2*backgroundScale}px)`},
                {width:    `-moz-calc(100% - ${2*backgroundScale}px)`},
                {height: `-webkit-calc(100% - ${2*backgroundScale}px)`},
                {height:    `-moz-calc(100% - ${2*backgroundScale}px)`},
            ],
            backgroundColor: '#4400008f',
        }}/>;
    }, [item, nonFunctionalOverlay, backgroundScale, openImageViewer]);

    const gridSvg = () => 
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
                <pattern id="smallChecks" width={2*backgroundScale} height={2*backgroundScale} patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width={1*backgroundScale} height={1*backgroundScale} style={{fill:'rgba(29, 29, 29, .62)'}} />
                    <rect x="0" y={1*backgroundScale} width={1*backgroundScale} height={1*backgroundScale} style={{fill:'rgba(44, 44, 44, .62)'}} />
                    <rect x={1*backgroundScale} y="0" width={1*backgroundScale} height={1*backgroundScale} style={{fill:'rgba(44, 44, 44, .62)'}} />
                    <rect x={1*backgroundScale} y={1*backgroundScale} width={1*backgroundScale} height={1*backgroundScale} style={{fill:'rgba(29, 29, 29, .62)'}} />
                </pattern>
                <pattern id="gridCell" width="100%" height="100%" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#smallChecks)"/>
                    <line x1="0" x2="0" y1="0" y2="100%" stroke="rgba(50, 50, 50, .75)" strokeWidth={`${2*backgroundScale}`}/>
                    <line x1="0" x2="100%" y1="0" y2="0" stroke="rgba(50, 50, 50, .75)" strokeWidth={`${2*backgroundScale}`}/>
                    <rect x="0" y="0" width="100%" height="100%" style={{fill:`rgba(${colorString})`}} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#000"/>
            <rect width="100%" height="100%" fill="url(#gridCell)"/>
        </svg>;
    const backgroundStyle = {
        backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(gridSvg()))}')`,
        backgroundSize: `${gridPercentX}% ${gridPercentY}%`,
        position: 'relative',
        outline: `${1*backgroundScale}px solid #495154`,
        outlineOffset: `-${1*backgroundScale}px`,
        maxHeight: `calc(100% - ${2*backgroundScale}px)`,
        maxWidth:  `calc(100% - ${2*backgroundScale}px)`,
        fallbacks: [
            {maxWidth: `-webkit-calc(100% - ${2*backgroundScale}px)`},
            {maxWidth:    `-moz-calc(100% - ${2*backgroundScale}px)`},
            {maxHeight: `-webkit-calc(100% - ${2*backgroundScale}px)`},
            {maxHeight:    `-moz-calc(100% - ${2*backgroundScale}px)`},
        ],
    };

    const imageTextStyle = {
        position: 'absolute',
        top: `${2*backgroundScale}px`,
        right: `${3.5*backgroundScale}px`,
        cursor: 'default',
        color: '#a4aeb4',
        fontWeight: 'bold',
        textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
        fontSize: `${textSize}px`,
        textAlign: 'right',
    }

    return (
        <div ref={refContainer} style={backgroundStyle}>
            {loadingImage}
            {imageElement}
            {nonFunctional}
            <div style={imageTextStyle}>{item.shortName}</div>
            {children}
            {isViewerOpen && (
                <ImageViewer
                    src={[item.image8xLink]}
                    currentIndex={0}
                    backgroundStyle={viewerBackgroundStyle}
                    disableScroll={true}
                    closeOnClickOutside={true}
                    onClose={closeImageViewer}
                    style={{                
                        maxWidth: '100%',
                        maxHeight: '100%',
                    }}
                />
            )}
        </div>
    );
}

export default ItemImage;
