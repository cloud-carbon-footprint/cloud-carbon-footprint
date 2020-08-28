import React, { useState, useEffect } from 'react'
import useRemoteService from './hooks/RemoteServiceHook'
import { ApexLineChart } from './ApexLineChart'
import { Button, ButtonGroup } from '@material-ui/core'
import moment from 'moment'
import { EstimationResult } from './types'

const CloudCarbonContainer = () => {
  const { data, loading, error } = useRemoteService([], '2020-08-26', '2020-08-27')

  const [dataInTimeframe, setDataInTimeframe] = useState(data)
  const [timeframe, setTimeframe] = useState(12)

  useEffect(() => {
    // Assumption: API always returns timestamps at start of day, i.e. YYYY-MM-DDT00:00:00.000Z
    const today: moment.Moment = moment.utc()
    const todayMinusXMonths: moment.Moment = today
      .clone()
      .subtract(12, 'M')
      .hours(0)
      .minutes(0)
      .seconds(0)
      .milliseconds(0)

    setDataInTimeframe(
      data.filter((estimationResult: EstimationResult) =>
        moment.utc(estimationResult.timestamp).isBetween(todayMinusXMonths, today),
      ),
    )
  }, [timeframe])

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
