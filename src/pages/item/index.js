import { useMemo } from 'react';
import {Helmet} from 'react-helmet';
import {
    useParams,
} from "react-router-dom";
import Favicon from 'react-favicon';

import ID from '../../components/ID.jsx';
import CraftsTable from '../../components/crafts-table';
import BartersTable from '../../components/barters-table';
import QuestsList from '../../components/quests-list'

import formatPrice from '../../modules/format-price';

import Items from '../../Items';
import Quests from '../../Quests';

import './index.css';

function Item(props) {
    const {itemName} = useParams();
    const currentItemData = Object.values(Items).find(item => {
        return item.normalizedName === itemName;
    });

    const itemQuests = useMemo(() => {
        return Quests
            .filter((questData) => {
                return questData.objectives.find((objectiveData) => {
                    return objectiveData.targetId === currentItemData.id;
                });
            });
    }, [currentItemData]);

    console.log(currentItemData);
    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta charSet="utf-8" />
            <title>
                {`${currentItemData.name} - Escape from Tarkov`}
            </title>
            <meta
                name="description"
                content= {`All the relevant information about ${currentItemData.name}`}
            />
        </Helmet>,
        <Favicon
            key = {'item-favicon'}
            url={`https://assets.tarkov-tools.com/${currentItemData.id}-icon.jpg`}
        />,
        <div
            className="display-wrapper"
            key = {'display-wrapper'}
        >
            <div
            className = {'item-page-wrapper'}
            >
                <h1>
                    {currentItemData.name}
                    <img
                        className = {'item-image'}
                        alt = {currentItemData.name}
                        src = {`https://assets.tarkov-tools.com/${currentItemData.id}-grid-image.jpg`}
                    />
                    <cite>
                        {currentItemData.shortName}
                    </cite>
                </h1>
                <p>
                    Current flea price: {formatPrice(currentItemData.price)} with a fee of {formatPrice(currentItemData.fee)}
                </p>
                <p>
                    Best flea price to maximise profit: {formatPrice(currentItemData.bestPrice)} with a fee of {formatPrice(currentItemData.bestPriceFee)}
                </p>
                <p>
                    Sell to {currentItemData.traderName} for: {formatPrice(currentItemData.traderPrice)}
                </p>
                <a
                    href={currentItemData.wikiLink}
                >Wiki link</a>
                <div>
                    <h2>
                        Barters with {currentItemData.name}
                    </h2>
                    <BartersTable
                        nameFilter = {currentItemData.name}
                    />
                </div>
                <div>
                    <h2>
                        Crafts with {currentItemData.name}
                    </h2>
                    <CraftsTable
                        nameFilter = {currentItemData.name}
                    />
                </div>
                <QuestsList
                    itemQuests = {itemQuests}
                />
                {/* <pre>
                    {JSON.stringify(currentItemData, null, 4)}
                </pre> */}
            </div>
        </div>,
        <ID
            key = {'session-id'}
            sessionID = {props.sessionID}
        />
    ];
};

export default Item;


