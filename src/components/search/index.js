import React from 'react';
import { InstantSearch, SearchBox, Hits, Highlight } from 'react-instantsearch-dom';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

const searchClient = instantMeiliSearch(
    "https://meilisearch-production-8571.up.railway.app/",
    "9aa6b67a6a36b8d1870bb8e1bf346d87ac44072718f9362e7af09d11c6870baf"
);

const Search = ({index}) => (
    <InstantSearch
        indexName={index}
        searchClient={searchClient}
    >
        <SearchBox />
        <Hits hitComponent={Hit} />
    </InstantSearch>
);

const Hit = ({ hit }) => <Highlight attribute="name" hit={hit} />;

export default Search
