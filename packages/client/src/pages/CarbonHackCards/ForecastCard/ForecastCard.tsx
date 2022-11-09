/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent, ReactElement } from 'react'
import { useForecastData } from 'src/utils/hooks/ForecastDataHook'
import useStyles from '../../EmissionsMetricsPage/CarbonComparisonCard/carbonComparisonStyles'
import DashboardCard from '../../../layout/DashboardCard'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Typography, CardContent } from '@material-ui/core'
import moment from 'moment'
import LineChartDialog from './LineChartDialog'
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
    // eslint-disable-next-line prefer-const
    let array = []
    for (const [key, value] of result) {
      if (value != undefined) {
        value.optimalDataPoints.map((eachOptimalTime, index) => {
          const [date, time] = convertUTCtoLocalTime(eachOptimalTime.timestamp)
          array.push(
            <>
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="center">{key}</TableCell>
                <TableCell align="center">
                  {accountRegionMap.get(key)[0]}
                </TableCell>
                <TableCell align="center">{date}</TableCell>
                <TableCell align="center">{time}</TableCell>
                <TableCell align="center">{eachOptimalTime.value}</TableCell>
                <TableCell align="center">
                  <LineChartDialog
                    forecastData={value.forecastData}
                    region={accountRegionMap.get(key)[0]}
                  ></LineChartDialog>
                </TableCell>
              </TableRow>
            </>,
          )
        })
      }
    }
    return array
  }

  const dataToSend = accountRegionMap

  const result = useForecastData(dataToSend)

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
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Account</TableCell>
                <TableCell align="center">Region</TableCell>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Time</TableCell>
                <TableCell align="center">Rating (g/kWh)</TableCell>
                <TableCell align="center">More Info</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{optimalRegionTimeMap(result)}</TableBody>
          </Table>
        </TableContainer>
      </React.Fragment>
    </DashboardCard>
  )
}

export default ForecastCard
