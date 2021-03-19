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
    const traderIsBest = currentItemData.traderPrice > currentItemData.price - currentItemData.fee ? true : false;
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
                <div
                    className = 'information-grid'
                >
                    <div
                        className = {`text-and-image-information-wrapper ${traderIsBest ? '' : 'best-profit'}`}
                    >
                        <img
                            alt = 'Flea market'
                            src = {`${ process.env.PUBLIC_URL }/images/flea-market-icon.png`}
                            title = {`Sell ${currentItemData.name} on the Flea market`}
                        />
                        <div
                            className = 'price-wrapper'
                        >
                            {formatPrice(currentItemData.price)}
                            {/* {formatPrice(currentItemData.fee)} */}
                        </div>
                        {/* <div
                            className = 'price-wrapper'
                        >
                            {formatPrice(currentItemData.bestPrice)} {formatPrice(currentItemData.bestPriceFee)}
                        </div> */}
                    </div>
                    <div
                        className = {`text-and-image-information-wrapper ${traderIsBest ? 'best-profit' : ''}`}
                    >
                        <img
                            alt = {currentItemData.traderName}
                            src = {`${ process.env.PUBLIC_URL }/images/${currentItemData.traderName.toLowerCase()}-icon.png`}
                            title = {`Sell ${currentItemData.name} on the Flea market`}
                        />
                        <div
                            className = 'price-wrapper'
                        >
                            {formatPrice(currentItemData.traderPrice)}
                        </div>
                    </div>
                    <div
                        className = 'text-information-wrapper'
                    >
                        <a
                            href={currentItemData.wikiLink}
                        >Wiki</a>
                    </div>
                </div>

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


