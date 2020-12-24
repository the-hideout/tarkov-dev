import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Switch from 'react-switch';
import Menu from '../Menu';

import Items from '../../Items';
import Quests, { QuestObjective } from '../../Quests';

import './index.css';

const getQuestItemDescriptors = () => {
  const QuestItemDescriptorsMap = {};
  Object.values(Quests).forEach((quest) => {
    quest.objectives.forEach((objective) => {
      if (objective.type === QuestObjective.Find) {
        const item = Items[objective.targetUid];
        if (!QuestItemDescriptorsMap[item.uid]) {
          QuestItemDescriptorsMap[item.uid] = {
            item,
            quests: [],
            findInRaidAmount: 0,
            notFindInRaidAmount: 0,
          };
        }

        QuestItemDescriptorsMap[item.uid].quests.push(quest.id);
        if (objective.findInRaid) {
          QuestItemDescriptorsMap[item.uid].findInRaidAmount +=
            objective.amount;
        } else {
          QuestItemDescriptorsMap[item.uid].notFindInRaidAmount +=
            objective.amount;
        }
      }
    });
  });

  return Object.values(QuestItemDescriptorsMap);
};
const QuestItemDescriptors = getQuestItemDescriptors();

const QuestItemsPage = () => {
  const [onlyFIR, setOnlyFIR] = useState(false);

  const data = useMemo(() => {
    let innerData = QuestItemDescriptors.map((questItemDescriptor) => {
      return {
        ...questItemDescriptor,
        key: questItemDescriptor.item.uid,
        findInRaid: questItemDescriptor.findInRaidAmount > 0
      }
    });

    if (onlyFIR) {
      innerData = innerData.filter(
        (itemDescriptor) => itemDescriptor.findInRaid,
      );
    }

    return innerData;
  }, [onlyFIR]);

  const handleOnlyFIRChange = useCallback(() => {
    setOnlyFIR((oldValue) => !oldValue);
  }, []);

  return (
    <div className={'display-wrapper quest-items-page'}>
      <Menu />
      <div className="filter-wrapper">
        <label className="filter-item">
          <span>Only show find in raid</span>
          <Switch onChange={handleOnlyFIRChange} checked={onlyFIR} />
        </label>
      </div>
      <div className={'quest-items-wrapper'}>
        {data.map((questItemDescriptor) => {
          const [cols, rows] = questItemDescriptor.item.gridSize.split('x');

          console.log('ii', questItemDescriptor.item);

          return (
            <button
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
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestItemsPage;
