import React from 'react'
import useRemoteService from './hooks/RemoteServiceHook'
import useFilters from './hooks/FilterHook'
import { ApexLineChart } from './ApexLineChart'
import { ApexDonutChart } from './ApexDonutChart'
import { CarbonComparisonCard } from './CarbonComparisonCard'
import moment from 'moment'
import MonthFilter from './MonthFilter'
import { Box, CircularProgress, Grid } from '@material-ui/core'
import ServiceFilter from './ServiceFilter'
import DateFilter from './DateFilter'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  filterContainer: {
    display: 'flex',
    padding: theme.spacing(0.5),
  },
  filter: {
    margin: theme.spacing(0.5),
  },
}))

export default function CloudCarbonContainer() {
  const classes = useStyles()
  const startDate: moment.Moment = moment.utc().subtract(11, 'month')
  const endDate: moment.Moment = moment.utc()

  const { data, loading } = useRemoteService([], startDate, endDate)
  const { filteredData, filters, setFilters } = useFilters(data)

  return (
    <Box paddingTop={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <div className={classes.filterContainer}>
            {[ServiceFilter, DateFilter, MonthFilter].map((FilterComponent, i) => (
              <div key={i} className={classes.filter}>
                <FilterComponent filters={filters} setFilters={setFilters} />
              </div>
            ))}
          </div>
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
