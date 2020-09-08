import React, { useState } from 'react'
import useRemoteService from './hooks/RemoteServiceHook'
import { ApexLineChart } from './ApexLineChart'
import { ApexDonutChart } from './ApexDonutChart'
import moment from 'moment'
import MonthFilter from './MonthFilter'
import { Box, CircularProgress } from '@material-ui/core'

const CloudCarbonContainer = () => {
  const startDate: moment.Moment = moment.utc().subtract(11, 'month')
  const endDate: moment.Moment = moment.utc()
  const region: string = 'us-east-1'

  const { data, loading } = useRemoteService([], startDate, endDate, region)

  const [dataInTimeframe, setDataInTimeframe] = useState(data)

  return (
    <Box marginTop={4}>
      <Box marginBottom={4}>
        <MonthFilter dataFromRemoteService={data} setDataInTimeframe={setDataInTimeframe} />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          <Box padding={3} border={1} marginBottom={4} borderColor="grey.400">
            <ApexLineChart data={dataInTimeframe} />
          </Box>
          <Box padding={3} border={1} borderColor="grey.400">
            <ApexDonutChart data={dataInTimeframe} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default CloudCarbonContainer
