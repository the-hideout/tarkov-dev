import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Switch from 'react-switch';
import BarterItem from '../BarterItem';
import Menu from '../Menu';

import Quests, { QuestObjective } from './data';

import './index.css';

const QuestItemsPage = () => {
  const questItemDescriptor = useMemo(() => {
    const items = [];
    Object.values(Quests).forEach((quest) => {
      quest.objectives.forEach((objective) => {
        if (objective.type === QuestObjective.Find) {
          console.log('qu', quest);

          items.push({
            item: objective.target,
            amount: objective.amount,
            findInRaid: objective.findInRaid,
          });
        }
      });
    });

    return items;
  }, []);

  console.log('items', questItemDescriptor);

  return (
    <div className={'display-wrapper'}>
      <Menu />
      QuestItemsPage
      <div className={'quest-items-wrapper'}>
        {questItemDescriptor.map((questItemDescription) => {
          return (
            <a
              href={questItemDescription.item.wikiUrl}
              className={`quest-item quest-item-${
                questItemDescription.item.gridSize
              }${questItemDescription.findInRaid ? ' quest-item-fir' : ''}`}
            >
              <img
                alt={questItemDescription.item.name}
                src={questItemDescription.item.imgSrc}
              />
              {questItemDescription.amount > 1 && (
                <div className={'sell-to-icon'}>x{questItemDescription.amount}</div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default QuestItemsPage;
