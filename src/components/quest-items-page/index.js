import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Switch from 'react-switch';
import Menu from '../Menu';

import Items from '../../Items';
import Quests, { QuestObjective } from '../../Quests';

import './index.css';

const QuestItemsPage = () => {
  const [onlyFIR, setOnlyFIR] = useState(false);

  const questItemDescriptors = useMemo(() => {
    let innerItemDescriptors = [];
    Object.values(Quests).forEach((quest) => {
      quest.objectives.forEach((objective) => {
        if (objective.type === QuestObjective.Find) {

          const item = Items[objective.targetUid];

          innerItemDescriptors.push({
            key: `${quest.id}-${item.name}`,
            item,
            quest,
            amount: objective.amount,
            findInRaid: objective.findInRaid,
          });
        }
      });
    });

    if (onlyFIR) {
      innerItemDescriptors = innerItemDescriptors.filter(
        (itemDescriptor) => itemDescriptor.findInRaid,
      );
    }

    return innerItemDescriptors;
  }, [onlyFIR]);

  const handleOnlyFIRChange = useCallback(() => {
    setOnlyFIR((oldValue) => !oldValue);
  }, []);

  console.log('items', questItemDescriptors);

  return (
    <div className={'display-wrapper quest-items-page'}>
      <Menu />
      <div className="filter-wrapper">
        <label className="filter-item">
          <span>Only show find in raid</span>
          <Switch
            onChange={handleOnlyFIRChange}
            checked={onlyFIR}
          />
        </label>
      </div>
      <div className={'quest-items-wrapper'}>
        {questItemDescriptors.map((questItemDescriptor) => {
          const [cols, rows] = questItemDescriptor.item.gridSize.split('x');

          console.log('ii', questItemDescriptor.item)

          return (
            <a
              key={questItemDescriptor.key}
              href={questItemDescriptor.item.wikiLink}
              style={{
                gridColumnEnd: `span ${cols}`,
                gridRowEnd: `span ${rows}`,
              }}
              className={`quest-item quest-item-${
                questItemDescriptor.item.gridSize
              }${questItemDescriptor.findInRaid ? ' quest-item-fir' : ''}`}
            >
              <img
                alt={questItemDescriptor.item.name}
                src={questItemDescriptor.item.imgLink}
              />
              {questItemDescriptor.amount > 1 && (
                <div className={'sell-to-icon'}>
                  x{questItemDescriptor.amount}
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default QuestItemsPage;
