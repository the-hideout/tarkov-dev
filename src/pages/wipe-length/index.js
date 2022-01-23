import {Helmet} from 'react-helmet';
import React, { useMemo } from 'react';


import wipeDetailsJson from '../../data/wipe-details.json'

import './index.css';
import DataTable from '../../components/data-table';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { VictoryBar, VictoryChart, VictoryTheme } from 'victory';

const wipeDetails = wipeDetailsJson.map((wipeDetailJson) => {
  return {
    ...wipeDetailJson,
    start: new Date(wipeDetailJson.start),
  }
});


const data = [];
for (let i = 0; i < wipeDetails.length; i += 1) {
  const currentWipe = wipeDetails[i];
  const nextWipe = wipeDetails[i + 1];

  let end;
  let ongoing;
  if (nextWipe) {
    end = nextWipe.start;
    ongoing = false;
  } else {
    end = new Date();
    ongoing = true;
  }

  const lengthDays = Math.floor((end.getTime() - currentWipe.start.getTime()) / (1000 * 60 * 60 * 24));

  const addData = {
    ...currentWipe,
    lengthDays,
    end,
    ongoing,
  };
  data.push(addData);
}


// calculate average wipe length
const calculateAverage = (wipeDatas) => {
  const endedWipes = wipeDatas.filter(({ ongoing }) => !ongoing);
  let sum = 0;
  for (const endedWipe of endedWipes) {
    sum += endedWipe.lengthDays;
  };
  const average = sum / endedWipes.length;

  return Math.floor(average);
}

const lengthDaysAverage = calculateAverage(data);

data.push({
  name: 'Average',
  lengthDays: lengthDaysAverage,
})

data.reverse();


const WipeLength = (props) => {
  const {t} = useTranslation();

  const columns = useMemo(() => {
    return [
      {
        Header: t('Patch'),
        accessor: 'name',
      },
      {
        Header: t('Wipe start'),
        accessor: ({start}) => {
          if (start) {
            return dayjs(start).format('YYYY-MM-DD')
          }
          return '';
        },
        id: 'start',
      },
      {
        Header: t('Wipe end'),
        accessor: ({end, ongoing}) => {
          if (ongoing) {
            return t('Ongoing wipe')
          }
          if (end) {
            return dayjs(end).format('YYYY-MM-DD')
          }
          return '';
        },
        id: 'end',
      },
      {
        Header: t('Wipe length'),
        accessor: 'lengthDays',
      }
    ]
  }, [t]);


  const graphData = useMemo(() => {
    return data.map(({start, lengthDays}) => {
      return {
        x: dayjs(start).format('YYYY-MM-DD'),
        y: lengthDays
      }
    })
  }, []);


  return <React.Fragment>
    <Helmet>
          <meta
              charSet='utf-8'
          />
          <title>
              {t('Escape from Tarkov Wipe Length')}
          </title>
          <meta
              name='description'
              content={t('Escape from Tarkov length of wipes')}
          />
      </Helmet>
      <div className={'page-wrapper'}>
        <h1 className='center-title'>Escpae from Tarkov wipe length</h1>
        <DataTable
          columns={columns}
          data={data}
          disableSortBy={true}
        />
        {/* <VictoryChart
          theme={VictoryTheme.material}
        >
          <VictoryBar
            horizontal={true}
            data={graphData}
          />
        </VictoryChart> */}
      </div>
  </React.Fragment>;
};

export default WipeLength;
