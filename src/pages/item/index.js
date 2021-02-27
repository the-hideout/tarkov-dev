// import { useState, useEffect } from 'react';
import {Helmet} from 'react-helmet';
import {
    useParams,
} from "react-router-dom";

import ID from '../../components/ID.jsx';

import Items from '../../Items';
import Barters from '../../data/barters.json';
import Quests from '../../Quests';

import './index.css';

function Item(props) {
    const {itemName} = useParams();

    console.log(itemName);

    const currentItemData = Object.values(Items).find(item => {
        console.log(item);
        return item.urlName === itemName;
    });

    console.log(currentItemData);
    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta charSet="utf-8" />
            <title>Tarkov loot tiers</title>
            <meta
                name="description"
                content="Visualization of all different valuable loot"
            />
        </Helmet>,
        <div
            className="display-wrapper"
            key = {'display-wrapper'}
        >
            <div
            className = {'item-page-wrapper'}
            >
                <h1>
                    {currentItemData.name}
                </h1>
                <p>
                    {currentItemData.shortName}
                </p>
                <img
                    alt = {currentItemData.name}
                    src = {currentItemData.imgLink}
                />
                <pre>
                    {JSON.stringify(currentItemData, null, 4)}
                </pre>
                <div>
                    <h2>
                        Used in these quests:
                    </h2>
                    {
                    Quests
                        .filter((questData) => {
                            return questData.objectives.find((objectiveData) => {
                                return objectiveData.targetId === currentItemData.id;
                            });
                        })
                        .map((questData) => {
                            return <div>{questData.name}</div>;
                        })
                    }
                </div>
                <div>
                    <h2>
                        Used in these barters:
                    </h2>
                    {
                    Barters
                        .filter((barterData) => {
                            console.log(barterData);
                            return barterData.requiredItems.find((barterItemData) => {
                                return barterItemData.id === currentItemData.id;
                            });
                        })
                        .map((barterData) => {
                            return <div>
                                {barterData.trader}
                                {barterData.requiredItems.map((requiredItem) => {
                                    return <div><img
                                        alt = {Items[requiredItem.id].name}
                                        src = {Items[requiredItem.id].imgLink}
                                    />x{requiredItem.count}</div>
                                })}
                                for
                                {barterData.rewardItems.map((requiredItem) => {
                                    return <div><img
                                        alt = {Items[requiredItem.id].name}
                                        src = {Items[requiredItem.id].imgLink}
                                    />x{requiredItem.count}</div>
                                })}
                            </div>;
                        })
                    }
                </div>
                <div>
                    <h2>
                        Reward in these barters:
                    </h2>
                    {
                    Barters
                        .filter((barterData) => {
                            return barterData.rewardItems.find((barterItemData) => {
                                return barterItemData.targetId === currentItemData.id;
                            });
                        })
                        .map((barterData) => {
                            return <div>
                                {barterData.trader}
                                {barterData.requiredItems.map((requiredItem) => {
                                    return <div><img
                                        alt = {Items[requiredItem.id].name}
                                        src = {Items[requiredItem.id].imgLink}
                                    />x{requiredItem.count}</div>
                                })}
                                for
                                {barterData.rewardItems.map((requiredItem) => {
                                    return <div><img
                                        alt = {Items[requiredItem.id].name}
                                        src = {Items[requiredItem.id].imgLink}
                                    />x{requiredItem.count}</div>
                                })}
                            </div>;
                        })
                    }
                </div>
            </div>
        </div>,
        <ID
            key = {'session-id'}
            sessionID = {props.sessionID}
        />
    ];
};

export default Item;


