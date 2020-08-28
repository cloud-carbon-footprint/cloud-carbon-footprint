import React, { FunctionComponent, Dispatch, SetStateAction, useState, useEffect } from 'react'
import { Button, ButtonGroup } from '@material-ui/core'
import moment from 'moment'
import { EstimationResult } from './types'

const MonthFilter: FunctionComponent<MonthFilterProps> = ({ dataFromRemoteService, setDataInTimeframe }) => {
  const [timeframe, setTimeframe] = useState(12)

  useEffect(() => {
    // Assumption: API always returns timestamps at start of day, i.e. YYYY-MM-DDT00:00:00.000Z
    const today: moment.Moment = moment.utc()
    const todayMinusXMonths: moment.Moment = today.clone().subtract(timeframe, 'M')

    const dataInTimeframe: EstimationResult[] = dataFromRemoteService.filter((estimationResult: EstimationResult) =>
      moment.utc(estimationResult.timestamp).isBetween(todayMinusXMonths, today, 'day', '[]'),
    )

    setDataInTimeframe(dataInTimeframe)
  }, [timeframe, dataFromRemoteService, setDataInTimeframe])

  return (
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
  )
}

type MonthFilterProps = {
  dataFromRemoteService: EstimationResult[]
  setDataInTimeframe: Dispatch<SetStateAction<EstimationResult[]>>
}

export default MonthFilter
