import wipeDetailsJson from '../data/wipe-details.json';

// number or wipes to use when calculating the average
const CountLastNumWipesForAverage = 6; //Infinity;

const data = [];
for (let i = 0; i < wipeDetailsJson.length; i += 1) {
    const currentWipe = wipeDetailsJson[i];
    const nextWipe = wipeDetailsJson[i + 1];
    const currentWipeStart = new Date(currentWipe.start);

    let end;
    let ongoing;
    if (nextWipe) {
        end = new Date(nextWipe.start);
        ongoing = false;
    } else {
        end = new Date();
        ongoing = true;
    }

    const lengthDays = Math.floor(
        (end.getTime() - currentWipeStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    const addData = {
        ...currentWipe,
        start: currentWipeStart,
        lengthDays,
        end,
        ongoing,
    };
    data.push(addData);
}

// calculate average wipe length
export function averageWipeLength() {
    const endedWipes = data.filter(({ ongoing }) => !ongoing);
    endedWipes.sort((a, b) => b.start.getTime() - a.start.getTime());
    const calculateUsingWipes = endedWipes.slice(
        0,
        CountLastNumWipesForAverage,
    );

    let sum = 0;
    for (const endedWipe of calculateUsingWipes) {
        sum += endedWipe.lengthDays;
    }
    const average = sum / calculateUsingWipes.length;

    return Math.floor(average);
}

data.reverse();

export function wipeDetails() {
    return data;
}

export function currentWipeLength() {
    return data.find(({ongoing}) => ongoing === true).lengthDays;
}
