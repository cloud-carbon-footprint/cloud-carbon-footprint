import React, { useState } from 'react'
import useRemoteService from './hooks/RemoteServiceHook'
import { ApexLineChart } from './ApexLineChart'
import { ApexDonutChart } from './ApexDonutChart'
import { CarbonComparisonCard } from './CarbonComparisonCard'
import moment from 'moment'
import MonthFilter from './MonthFilter'
import { Grid, Box, CircularProgress } from '@material-ui/core'

const CloudCarbonContainer = () => {
  const startDate: moment.Moment = moment.utc().subtract(11, 'month')
  const endDate: moment.Moment = moment.utc()
  const region: string = 'us-east-1'

  const { data, loading } = useRemoteService([], startDate, endDate, region)

  const [dataInTimeframe, setDataInTimeframe] = useState(data)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box marginBottom={4} marginTop={4}>
          <MonthFilter dataFromRemoteService={data} setDataInTimeframe={setDataInTimeframe} />
        </Box>
      </Grid>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box padding={3} border={1} marginBottom={4} borderColor="grey.400">
              <ApexLineChart data={dataInTimeframe} />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <CarbonComparisonCard data={dataInTimeframe} />
          </Grid>
          <Grid item xs={6}>
            <Box padding={3} border={1} borderColor="grey.400">
              <ApexDonutChart data={dataInTimeframe} />
            </Box>
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}

export default CloudCarbonContainer
