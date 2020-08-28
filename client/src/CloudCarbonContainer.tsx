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

  const { data, loading } = useRemoteService([], startDate, endDate)

  const [dataInTimeframe, setDataInTimeframe] = useState(data)

  return (
    <div>
      <MonthFilter dataFromRemoteService={data} setDataInTimeframe={setDataInTimeframe} />
      <Box m={5} border={1}>
        {loading ? (
          <Container>
            <CachedIcon fontSize={'large'} /> Your cloud carbon footprint data is loading
          </Container>
        ) : (
          <ApexLineChart data={dataInTimeframe} />
        )}
      </Box>
    </div>
  )
}

export default CloudCarbonContainer
