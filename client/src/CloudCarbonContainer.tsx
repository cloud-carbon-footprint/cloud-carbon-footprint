import React, { useState } from 'react'
import useRemoteService from './hooks/RemoteServiceHook'
import { ApexLineChart } from './ApexLineChart'
import moment from 'moment'
import MonthFilter from './MonthFilter'

const CloudCarbonContainer = () => {
  const startDate: moment.Moment = moment.utc().subtract(1, 'year')
  const endDate: moment.Moment = moment.utc()

  const { data } = useRemoteService([], startDate, endDate)

  const [dataInTimeframe, setDataInTimeframe] = useState(data)

  return (
    <div>
      <MonthFilter dataFromRemoteService={data} setDataInTimeframe={setDataInTimeframe} />
      <ApexLineChart data={dataInTimeframe} />
    </div>
  )
}

export default CloudCarbonContainer
