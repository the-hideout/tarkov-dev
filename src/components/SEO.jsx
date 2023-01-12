import React from 'react';
import { Helmet } from 'react-helmet';

export default function SEO({title, description, url, image, type="article", card="summary"}) {
    let urlPath = url ? url : window.location.href;
    return (
        <Helmet>
            { /* Standard metadata tags */ }
            <title>{title}</title>
            <meta name='description' content={description} />
            { /* End standard metadata tags */ }
            
            { /* OpenGraph / Facebook tags */ }
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={urlPath} />
            <meta property="og:image" content={image} />
            { /* End Facebook tags */ }
            
            { /* Twitter tags */ }
            <meta name="twitter:card" content={card} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:url" content={urlPath} />
            <meta name="twitter:image" content={image} />
            { /* End Twitter tags */ }
        </Helmet>
    )
}