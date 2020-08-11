import React from 'react';

import barterItems from '../barter-items.json';
import BarterGroup from './BarterGroup';

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

const sortedItems = barterItems.sort((itemA, itemB) => {    
    if(itemA.pricePerSlot > itemB.pricePerSlot){
        return -1;
    }
    
    if(itemA.pricePerSlot < itemB.pricePerSlot){
        return 1;
    }
    
    return 0;
});

const itemChunks = arrayChunk(sortedItems, sortedItems.length / 7);

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

function Barter(props) {      
    if(!props.show){
        return false;
    }
    return <div
        className="barter-wrapper" 
    >
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


