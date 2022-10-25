/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionComponent, ReactElement } from 'react'
import { useForecastData } from 'src/utils/hooks/ForecastDataHook'
import useStyles from '../EmissionsMetricsPage/CarbonComparisonCard/carbonComparisonStyles'
import DashboardCard from '../../layout/DashboardCard'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Typography, Box, CardContent } from '@material-ui/core'
import moment from 'moment'
const ForecastCard: FunctionComponent<any> = ({ data }): ReactElement => {
  const convertUTCtoLocalTime = (utcTime) => {
    const stillUtc = moment.utc(utcTime).toDate()
    const local = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss')
    const [date, time] = local.split(' ')
    return [date, time]
  }

  const accountRegionMap = new Map()

  const classes = useStyles()
  console.log(data, 'data in ln number 8 ')
  const footPrintData = data !== undefined ? data : []
  console.log('Footprint: ', footPrintData)
  footPrintData.map((month) => {
    console.log('Month: ', month)
    month.serviceEstimates.map((account) => {
      console.log('Account: ', account)
      accountRegionMap.set(account.accountName, [account.region, 60])
      console.log(accountRegionMap.get(account.accountName))
    })
  })

  console.log('Account map: ', accountRegionMap)

  const optimalRegionTimeMap = (result) => {
    // eslint-disable-next-line prefer-const
    let array = []
    for (const [key, value] of result) {
      if (value != undefined) {
        value.map((eachOptimalTime, index) => {
          const [date, time] = convertUTCtoLocalTime(eachOptimalTime.timestamp)
          array.push(
            <>
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{key}</TableCell>
                <TableCell component="th" scope="row">
                  {accountRegionMap.get(key)[0]}
                </TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>{time}</TableCell>
                <TableCell>{eachOptimalTime.value}</TableCell>
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
  // based on the result you create the html code here for the card

  return (
    <DashboardCard>
      <Box paddingX={3} textAlign="center">
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
                <TableCell>Account</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{optimalRegionTimeMap(result)}</TableBody>
          </Table>
        </TableContainer>
      </Box>
    </DashboardCard>
  )
}

export default ForecastCard