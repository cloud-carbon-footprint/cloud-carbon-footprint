import React from 'react'
import useRemoteService from './hooks/RemoteServiceHook'
import useFilters from './hooks/FilterHook'
import { ApexLineChart } from './ApexLineChart'
import { ApexDonutChart } from './ApexDonutChart'
import { CarbonComparisonCard } from './CarbonComparisonCard'
import moment from 'moment'
import MonthFilter from './MonthFilter'
import { Grid, Box, CircularProgress } from '@material-ui/core'
import ServiceFilter from './ServiceFilter'

export default function CloudCarbonContainer() {
  const startDate: moment.Moment = moment.utc().subtract(11, 'month')
  const endDate: moment.Moment = moment.utc()

  const { data, loading } = useRemoteService([], startDate, endDate)
  const { filteredData, filters, setFilters } = useFilters(data)

  return (
    <Box paddingTop={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box marginBottom={4}>
            <ServiceFilter filters={filters} setFilters={setFilters} />
          </Box>
          <Box>
            <MonthFilter filters={filters} setFilters={setFilters} />
          </Box>
        </Grid>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box padding={3} border={1} marginBottom={4} borderColor="grey.400">
                <ApexLineChart data={filteredData} />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <CarbonComparisonCard data={filteredData} />
            </Grid>
            <Grid item xs={6}>
              <Box padding={3} border={1} borderColor="grey.400">
                <ApexDonutChart data={filteredData} />
              </Box>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
