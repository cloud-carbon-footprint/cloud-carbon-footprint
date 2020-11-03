/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { ReactElement } from 'react'
import useRemoteService from './client/RemoteServiceHook'
import useFilters from './filters/FilterHook'
import { ApexLineChart } from './charts/ApexLineChart'
import { CarbonComparisonCard } from './CarbonComparisonCard'
import moment from 'moment'
import MonthFilter from './filters/MonthFilter'
import { Box, Card, CircularProgress, Grid } from '@material-ui/core'
import ServiceFilter from './filters/ServiceFilter'
import CloudProviderFilter from './filters/CloudProviderFilter'
import DateFilter from './filters/DateFilter'
import { makeStyles } from '@material-ui/core/styles'
import { DonutChartTabs } from './charts/DonutChartTabs'

const useStyles = makeStyles((theme) => ({
  boxContainer: {
    padding: theme.spacing(3, 10),
  },
  filterContainer: {
    display: 'flex',
    paddingBottom: theme.spacing(0.5),
  },
  filter: {
    marginRight: theme.spacing(0.5),
  },
}))

export default function CloudCarbonContainer(): ReactElement {
  const classes = useStyles()
  const startDate: moment.Moment = moment.utc().subtract(11, 'month')
  const endDate: moment.Moment = moment.utc()

  const { data, loading } = useRemoteService([], startDate, endDate)
  const { filteredData, filters, setFilters } = useFilters(data)

  return (
    <Box className={classes.boxContainer}>
      <Grid container>
        <Grid item xs={12}>
          <div className={classes.filterContainer}>
            {[CloudProviderFilter, ServiceFilter, DateFilter, MonthFilter].map((FilterComponent, i) => (
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
              <Card style={{ width: '100%', height: '100%' }}>
                <Box padding={3} paddingRight={4}>
                  <ApexLineChart data={filteredData} />
                  <Grid container justify="center">
                    <div>*estimated with average CPU not actual CPU</div>
                  </Grid>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <CarbonComparisonCard data={filteredData} />
            </Grid>
            <Grid item xs={6}>
              <DonutChartTabs data={filteredData} />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
