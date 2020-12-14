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
import { useFilterDataService } from './client/FilterDataServiceHook'
import AccountFilter from './filters/AccountFilter'
import config from '../ConfigLoader'
import { useAccountNamesFromEstimates } from './transformData'
import { FilterResultResponse } from '../models/types'
const PADDING_FILTER = 0.5
const PADDING_LOADING = 2

const useStyles = makeStyles((theme) => ({
  boxContainer: {
    padding: theme.spacing(3, 10),
  },
  filterContainer: {
    display: 'flex',
    paddingBottom: theme.spacing(PADDING_FILTER),
  },
  filter: {
    marginRight: theme.spacing(PADDING_FILTER),
  },
  loadingMessage: {
    padding: theme.spacing(PADDING_LOADING),
    fontSize: '24px',
  },
}))

export default function CloudCarbonContainer(): ReactElement {
  const classes = useStyles()
  const startDate: moment.Moment = moment.utc().subtract(11, 'month')
  const endDate: moment.Moment = moment.utc()

  const { data, loading } = useRemoteService([], startDate, endDate)

  let filteredAccountsResults: FilterResultResponse
  if (config().AWS.USE_BILLING_DATA) {
    filteredAccountsResults = useAccountNamesFromEstimates(data)
  } else {
    filteredAccountsResults = useFilterDataService()
  }
  const { filteredData, filters, setFilters } = useFilters(data, filteredAccountsResults)

  return loading ? (
    <Grid container direction="column" alignItems="center" justify="center" style={{ minHeight: '100vh' }}>
      <CircularProgress size={100} />
      <div className={classes.loadingMessage}>Loading cloud data...</div>
    </Grid>
  ) : (
    <Box className={classes.boxContainer}>
      <Grid container>
        <Grid item xs={12}>
          <div className={classes.filterContainer}>
            {[CloudProviderFilter, AccountFilter, ServiceFilter, DateFilter, MonthFilter].map((FilterComponent, i) => (
              <div key={i} className={classes.filter}>
                <FilterComponent filters={filters} setFilters={setFilters} options={filteredAccountsResults} />
              </div>
            ))}
          </div>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card style={{ width: '100%', height: '100%' }}>
              <Box padding={3} paddingRight={4}>
                <ApexLineChart data={filteredData} />
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
      </Grid>
    </Box>
  )
}
