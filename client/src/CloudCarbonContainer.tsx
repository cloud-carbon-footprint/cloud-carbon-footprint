import React, { useState } from 'react'
import useRemoteService from './hooks/RemoteServiceHook'
import { ApexLineChart } from './ApexLineChart'
import moment from 'moment'
import MonthFilter from './MonthFilter'
import CachedIcon from '@material-ui/icons/Cached'
import { Box, Container } from '@material-ui/core'

const CloudCarbonContainer = () => {
  const startDate: moment.Moment = moment.utc().subtract(1, 'year')
  const endDate: moment.Moment = moment.utc()
  const region: string = 'us-east-1'

  const { data, loading } = useRemoteService([], startDate, endDate, region)

  const [dataInTimeframe, setDataInTimeframe] = useState(data)

  return (
    <>
      <Box marginBottom={4}>
        <MonthFilter dataFromRemoteService={data} setDataInTimeframe={setDataInTimeframe} />
      </Box>
      <Box padding={1} border={1}>
        {loading ? (
          <Container>
            <CachedIcon fontSize={'large'} /> Your cloud carbon footprint data is loading
          </Container>
        ) : (
          <ApexLineChart data={dataInTimeframe} />
        )}
      </Box>
    </>
  )
}

export default CloudCarbonContainer
