import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({title, description, type="article", url=`${process.env.PUBLIC_URL}/${this.props.location}`}) {
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
            <meta property="og:url" content={url} />
            { /* End Facebook tags */ }

            { /* Twitter tags */ }
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:url" content={url} />
            { /* End Twitter tags */ }
        </Helmet>
    )
}