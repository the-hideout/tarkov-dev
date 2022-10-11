import { useQuery } from 'react-query';
import doFetchQuests from './do-fetch-quests';
import { langCode } from '../../modules/lang-helpers';
import { placeholderTasks } from '../../modules/placeholder-data';

export const useQuestsQuery = (queryOptions) => {
    const questsQuery = useQuery('quests', () => doFetchQuests(langCode()), {
        refetchInterval: 600000,
        placeholderData: placeholderTasks(langCode()),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return questsQuery;
};

export const useQuestByIdQuery = (questId, queryOptions) => {
    const questQuery = useQuestsQuery({
        select: (quests) => quests.find((quest) => quest.id === questId),
        ...queryOptions,
    });

    return questQuery;
};
