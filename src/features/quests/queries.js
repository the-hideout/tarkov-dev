import { useQuery } from 'react-query';
import doFetchQuests from './do-fetch-quests';

export const useQuestsQuery = (queryOptions) => {
    const questsQuery = useQuery('quests', () => doFetchQuests(), {
        refetchInterval: 600000,
        placeholderData: [],
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
