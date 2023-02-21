import React, { FunctionComponent, ReactElement } from 'react'
import { useForecastData } from '../../../utils/hooks/ForecastDataHook'
import useStyles from '../../EmissionsMetricsPage/CarbonComparisonCard/carbonComparisonStyles'
import DashboardCard from '../../../layout/DashboardCard'
import { Typography, CardContent } from '@material-ui/core'
import moment from 'moment'
import LoadingMessage from '../../../common/LoadingMessage'
import { DataGrid, GridColumns, GridOverlay } from '@mui/x-data-grid'
import LineChartDialog from './LineChartDialog'
import ErrorPage from '../../../layout/ErrorPage'

const ForecastCard: FunctionComponent<any> = ({ data }): ReactElement => {
  const convertUTCtoLocalTime = (utcTime) => {
    const stillUtc = moment.utc(utcTime).toDate()
    const local = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss')
    const [date, time] = local.split(' ')
    return [date, time]
  }

  const accountRegionMap = new Map()

  const classes = useStyles()
  const footPrintData = data !== undefined ? data : []
  footPrintData.map((month) => {
    month.serviceEstimates.map((account) => {
      accountRegionMap.set(account.accountName, [account.region, 60])
    })
  })

  const optimalRegionTimeMap = (result) => {
    const row = []
    for (const [key, value] of result) {
      value.optimalDataPoints.map((eachOptimalTime) => {
        const [date, time] = convertUTCtoLocalTime(eachOptimalTime.timestamp)
        row.push({
          id: key,
          region: accountRegionMap.get(key)[0],
          date: date,
          time: time,
          rating: eachOptimalTime.value,
          moreinfo: {
            forecastData: value.forecastData,
            region: accountRegionMap.get(key)[0],
          },
        })
      })
    }
    return row
  }

  const dataToSend = accountRegionMap

  const { result, error, loading } = useForecastData(dataToSend)

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'Account',
      width: 250,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'region',
      headerName: 'Region',
      flex: 0.75,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 0.75,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 0.75,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'rating',
      headerName: 'Rating (g/kWh)',
      flex: 0.75,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'moreinfo',
      headerName: 'More Info',
      flex: 0.75,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <LineChartDialog
          testId="line-chart-dialog"
          forecastData={params.value.forecastData}
          region={params.value.region}
        ></LineChartDialog>
      ),
    },
  ]

  const renderTable = () => {
    return (
      // <div style={{ height: 371, width: '100%' }}>
      <div style={{ height: 371, width: '100%' }}>
        <DataGrid
          rows={optimalRegionTimeMap(result)}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          columnBuffer={6}
          rowBuffer={5}
          hideFooterSelectedRowCount={true}
          components={{
            NoRowsOverlay: () => (
              <GridOverlay>
                There's no data to display! Expand your search parameters to get
                started. (Try adding accounts, regions or recommendation types)
              </GridOverlay>
            ),
          }}
        />
      </div>
    )
  }

  return (
    <DashboardCard noPadding>
      <React.Fragment>
        <CardContent className={classes.topContainer}>
          <Typography className={classes.title} gutterBottom></Typography>
          <Typography
            className={classes.metricOne}
            id="metric-one"
            variant="h4"
            component="p"
            data-testid="co2"
          >
            {' '}
            Optimal Time to Schedule your Workloads
          </Typography>
          <Typography className={classes.posOne}></Typography>
        </CardContent>
        {error != null ? (
          <ErrorPage errorMessage={'Error loading cloud data'} />
        ) : (
          <>
            {loading ? (
              <LoadingMessage
                message={'Loading cloud data. This may take a while...'}
              />
            ) : (
              renderTable()
            )}
          </>
        )}
      </React.Fragment>
    </DashboardCard>
  )
}

export default ForecastCard
