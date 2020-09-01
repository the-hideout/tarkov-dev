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
    const [itemChunks, setChunks] = useState([]);
    const [updateDate, setUpdateDate] = useState(new Date());
    const {currentLoot} = useParams();
    
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
                })
                .slice(0, MAX_ITEMS);
            
            const newChunks = arrayChunk(sortedItems, sortedItems.length / 7);
         
            setChunks(newChunks);
        }

        fetchData();
      }, [currentLoot]);
    
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
    
    
    return <div
        className="barter-wrapper" 
    >
        <div
            className = {'updated-label'}
        >
            {`Prices updated: ${updateDate.toLocaleDateString()}`}        
        </div>
        {itemChunks.map((items, index) => 
            <BarterGroup
                key = {`barter-group-${groupNames[index]}`}
                name = {groupNames[index]}
                items = {items}
            />
        )}
    </div>;
}

export default Barter;


