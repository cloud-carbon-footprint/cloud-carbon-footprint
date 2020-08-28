import React, { useState, useEffect } from 'react'
import useRemoteService from './hooks/RemoteServiceHook'
import { ApexLineChart } from './ApexLineChart'
import { Button, ButtonGroup } from '@material-ui/core'
import moment from 'moment'
import { EstimationResult } from './types'

const CloudCarbonContainer = () => {
  const startDate : moment.Moment = moment.utc().subtract(1, 'year')
  const endDate : moment.Moment = moment.utc()

  const { data } = useRemoteService([], startDate, endDate)

  const [dataInTimeframe, setDataInTimeframe] = useState(data)
  const [timeframe, setTimeframe] = useState(12)

    useEffect(() => {
        // Assumption: API always returns timestamps at start of day, i.e. YYYY-MM-DDT00:00:00.000Z
        const today : moment.Moment = moment.utc()
        const todayMinusXMonths : moment.Moment = today.clone().subtract(timeframe, 'M')

        setDataInTimeframe(
            data.filter((estimationResult : EstimationResult) => 
                moment.utc(estimationResult.timestamp).isBetween(todayMinusXMonths, today, 'day', '[]')))
            
    }, [timeframe, data])

  return (
    <div>
      <ButtonGroup>
        <Button color={timeframe === 1 ? 'primary' : 'default'} onClick={() => setTimeframe(1)}>
          1M
        </Button>
        <Button color={timeframe === 3 ? 'primary' : 'default'} onClick={() => setTimeframe(3)}>
          3M
        </Button>
        <Button color={timeframe === 6 ? 'primary' : 'default'} onClick={() => setTimeframe(6)}>
          6M
        </Button>
        <Button color={timeframe === 12 ? 'primary' : 'default'} onClick={() => setTimeframe(12)}>
          12M
        </Button>
      </ButtonGroup>
      <ApexLineChart data={dataInTimeframe} />
    </div>
  )
}

export default CloudCarbonContainer
