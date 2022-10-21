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
import { Typography, Box } from '@material-ui/core'
const EmissionCard: FunctionComponent<any> = ({ data }): ReactElement => {
  //create data to send to carbon aware sdk api

  const classes = useStyles()
  const accountName = 'aws account 1'
  console.log(data, 'data in ln number 8 ')
  const footPrintData = data.data !== undefined ? data.data.slice(0, 1) : []
  let location = ''
  footPrintData.map((month) => {
    month.serviceEstimates.map((account) => {
      if (account.accountName === accountName) {
        location = account.region
        return
      }
    })
  })

  const dataToSend = {
    location: location,
    workLoadExecutionTime: 60,
  }

  const result = useForecastData(dataToSend)
  // based on the result you create the html code here for the card

  return (
    <DashboardCard>
      <>
        <Box className={classes.topContainer}>
          <Typography className={classes.title}>Your Forecast Data</Typography>
        </Box>
        <Box paddingX={3} textAlign="center">
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Time Frame</TableCell>
                  <TableCell align="right">Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.map((row, index) => {
                  const [date, time] = row.timestamp.split('T')
                  return (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {date}
                      </TableCell>
                      <TableCell align="right">{time}</TableCell>
                      <TableCell align="right">{row.value}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </>
    </DashboardCard>
  )
}

export default EmissionCard
