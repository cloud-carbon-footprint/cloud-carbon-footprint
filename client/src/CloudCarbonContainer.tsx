import React from 'react'
import useRemoteService from './hooks/RemoteServiceHook'
import useFilters from './hooks/FilterHook'
import { ApexLineChart } from './ApexLineChart'
import { ApexDonutChart } from './ApexDonutChart'
import moment from 'moment'
import MonthFilter from './MonthFilter'
import { Box, CircularProgress } from '@material-ui/core'
import ServiceFilter from './ServiceFilter'

export default function CloudCarbonContainer() {
  const startDate: moment.Moment = moment.utc().subtract(11, 'month')
  const endDate: moment.Moment = moment.utc()
  const region: string = 'us-east-1'

  const { data, loading } = useRemoteService([], startDate, endDate, region)
  const { filteredData, filters, setFilters } = useFilters(data)

  return (
    <Box marginTop={4}>
      <Box marginBottom={4}>
        <ServiceFilter filters={filters} setFilters={setFilters} />
        <MonthFilter filters={filters} setFilters={setFilters} />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          <Box padding={3} border={1} marginBottom={4} borderColor="grey.400">
            <ApexLineChart data={filteredData} />
          </Box>
          <Box padding={3} border={1} borderColor="grey.400">
            <ApexDonutChart data={filteredData} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
