import React, { useState, useEffect } from 'react';

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

function Barter() {
    const [itemChunks, setChunks] = useState([]);
    const [updateDate, setUpdateDate] = useState(new Date());
    
    useEffect(() => {
        async function fetchData(){
            const result = await fetch(
              `${process.env.PUBLIC_URL}/barter-items.json`,
            )
            .then(response => response.json());
            
            setUpdateDate(new Date(result.updated));
            
            const sortedItems = result.data.sort((itemA, itemB) => {    
                if(itemA.pricePerSlot > itemB.pricePerSlot){
                    return -1;
                }
                
                if(itemA.pricePerSlot < itemB.pricePerSlot){
                    return 1;
                }
                
                return 0;
            });
            
            const newChunks = arrayChunk(sortedItems, sortedItems.length / 7);
         
            setChunks(newChunks);
        }
        
        fetchData();
      }, []);
    
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


