    import React, { useState, useEffect } from 'react';
import {
    useParams,
  } from "react-router-dom";

import BarterGroup from './BarterGroup';

const MAX_ITEMS = 224;

const groupNames = [
    'S',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
];

const arrayChunk = (inputArray, chunkLength) => {
    return inputArray.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkLength);

        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray
    }, []);
};

function Barter() {
    const [items, setItems] = useState([]);
    const [updateDate, setUpdateDate] = useState(new Date());
    const {currentLoot} = useParams();
    const [nameFilter, setNameFilter] = useState('');

    useEffect(() => {
        async function fetchData(){
            let itemFilter = currentLoot;
            if(!currentLoot || currentLoot === 'barter'){
                itemFilter = 'barter-items';
            }

            const result = await fetch(
              `${process.env.PUBLIC_URL}/${itemFilter}.json`,
            )
            .then(response => response.json());

            setUpdateDate(new Date(result.updated));

            const sortedItems = result.data
                .sort((itemA, itemB) => {
                    if(itemA.pricePerSlot > itemB.pricePerSlot){
                        return -1;
                    }

                    if(itemA.pricePerSlot < itemB.pricePerSlot){
                        return 1;
                    }

                    return 0;
                });

            setItems(sortedItems);
        }

        fetchData();
    }, [currentLoot, setItems]);

    const itemChunks = arrayChunk(items.slice(0, MAX_ITEMS), MAX_ITEMS / 7);

    for(let i = 0; i < itemChunks.length; i = i + 1){
        itemChunks[i] = itemChunks[i].sort((itemA, itemB) => {
            if(itemA.slots > itemB.slots){
                return -1;
            }

            if(itemA.slots < itemB.slots){
                return 1;
            }

            return 0;
        });
    };

    // console.log(displayItems)

    return <div
        className="barter-wrapper"
    >
        <div class="barter-group-wrapper filter-wrapper">
            <div
                className = {'text-label'}
            >
                {`Prices updated: ${updateDate.toLocaleDateString()}`}
            </div>
            <span>
                Filter
            </span>
            <input
                type = {'text'}
                placeholder = {'btc, graphics e.t.c'}
                onChange = {e => setNameFilter(e.target.value)}
            />
        </div>
        {itemChunks.map((items, index) =>
            <BarterGroup
                filter = {nameFilter}
                key = {`barter-group-${groupNames[index]}`}
                name = {groupNames[index]}
                items = {items}
            />
        )}
    </div>;
}

export default Barter;


