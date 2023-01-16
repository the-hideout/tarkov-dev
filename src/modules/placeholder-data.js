import cachedBarters from '../data/barters.json';
import cachedCrafts from '../data/crafts.json';

import cachedHideout from '../data/hideout.json'

import cachedItems from '../data/items.json';
import cachedItemsLocale from '../data/items_locale.json';

import cachedMeta from '../data/meta.json';

import cachedMaps from '../data/maps_cached.json';
import cachedMapsLocale from '../data/maps_locale.json';

import cachedBosses from '../data/bosses.json';
import cachedBossesLocale from '../data/bosses_locale.json';

import cachedTasks from '../data/quests.json';
import cachedTasksLocale from '../data/quests_locale.json';

import cachedTraders from '../data/traders.json'
import cachedTradersLocale from '../data/traders_locale.json';

export function placeholderBarters(language = 'en') {
    return cachedBarters;
}

export function placeholderCrafts(language = 'en') {
    return cachedCrafts;
}

export function placeholderHideout(language = 'en') {
    return cachedHideout;
}

export function placeholderItems(language = 'en') {
    if (language !== 'en' && cachedItemsLocale[language]) {
        return cachedItems.map(item => {
            return {
                ...item,
                ...cachedItemsLocale[language][item.id]
            };
        });
    }
    return cachedItems;
}

export function placeholderMaps(language = 'en') {
    if (language !== 'en' && cachedMapsLocale[language]) {
        return cachedMaps.map(map => {
            return {
                ...map,
                ...cachedMapsLocale[language][map.id]
            }
        });
    }
    return cachedMaps;
}

export function placeholderBosses(language = 'en') {
    if (language !== 'en' && cachedBossesLocale[language]) {
        return cachedBosses.map(boss => {
            return {
                ...boss,
                ...cachedBossesLocale[language][boss.normalizedName]
            }
        });
    }
    return cachedBosses;
}

export function placeholderMeta(language = 'en') {
    return cachedMeta;
}

export function placeholderTasks(language = 'en') {
    if (language !== 'en' && cachedTasksLocale[language]) {
        return cachedTasks.map(task => {
            return {
                ...task,
                name: cachedTasksLocale[language][task.id].name,
                objectives: task.objectives.map(defObj => {
                    return {
                        ...defObj,
                        description: cachedTasksLocale[language][task.id].objectives[defObj.id]
                    }
                })
            };
        });
    }
    return cachedTasks;
}

export function placeholderTraders(language = 'en') {
    if (language !== 'en' && cachedTradersLocale[language]) {
        return cachedTraders.map(trader => {
            return {
                ...trader,
                ...cachedTradersLocale[language][trader.id]
            };
        });
    }
    return cachedTraders;
}