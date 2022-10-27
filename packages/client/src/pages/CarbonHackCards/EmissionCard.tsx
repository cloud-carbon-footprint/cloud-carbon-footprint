/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionComponent, ReactElement } from 'react'
import { useEmissionsData } from 'src/utils/hooks/EmissionDataHook'
import useStyles from '../EmissionsMetricsPage/CarbonComparisonCard/carbonComparisonStyles'
import { AWS_REGIONS } from './AWSRegions'
import DashboardCard from '../../layout/DashboardCard'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Typography, Box, CardContent } from '@material-ui/core'
const EmissionCard: FunctionComponent<any> = ({ data }): ReactElement => {
  const accountRegionMap = new Map()

  const classes = useStyles()
  const footPrintData = data !== undefined ? data : []
  console.log('Footprint: ', footPrintData)

  const findNearestRegions = (
    accountRegion: string,
    cloudProvider: string,
  ): string[] => {
    if (cloudProvider === 'AWS') {
      return getNearestRegionFromEnum(accountRegion, AWS_REGIONS)
    } else if (cloudProvider === 'AZURE') {
      return ['ukwest', 'UK South']
    } else {
      return ['us-east1', 'us-west1', 'us-east4', 'us-west2']
    }
  }

  const truncateDecimals = function (number) {
    return Math[number < 0 ? 'ceil' : 'floor'](number)
  }

  const getNearestRegionFromEnum = (accountRegion: string, REGIONS: any) => {
    const nearestRegions = []
    const countryPrefix: string = accountRegion.slice(0, 2).toUpperCase()
    for (const awsRegionName in REGIONS) {
      if (awsRegionName.startsWith(countryPrefix)) {
        nearestRegions.push(REGIONS[awsRegionName])
      }
    }
    return nearestRegions
  }

  footPrintData.map((month) => {
    month.serviceEstimates.map((account) => {
      accountRegionMap.set(account.accountName, [
        account.region,
        account.cloudProvider,
        account.co2e,
        account.kilowattHours,
        findNearestRegions(account.region, account.cloudProvider),
        month.timestamp,
        '2020-02-25',
      ])
    })
  })

  const dataToSend = accountRegionMap
  console.log(dataToSend, ' in emussins card')

  const result = useEmissionsData(dataToSend)
  console.log(result, 'result of emission card')

  const bestLocationTable = (result) => {
    // eslint-disable-next-line prefer-const
    let array = []
    for (const [key, value] of result) {
      if (value != undefined) {
        const expectedEmissionsForBestLocation =
          (truncateDecimals(value.carbonIntensity) *
            truncateDecimals(accountRegionMap.get(key)[3])) /
          1000000
        const actualEmissions = accountRegionMap.get(key)[2]
        const percentReduction = truncateDecimals(
          100 - (expectedEmissionsForBestLocation * 100) / actualEmissions,
        )
        array.push(
          <>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{key}</TableCell>
              <TableCell component="th" scope="row">
                {accountRegionMap.get(key)[0]}
              </TableCell>
              <TableCell>{actualEmissions}</TableCell>
              <TableCell>{value.location}</TableCell>
              <TableCell>
                {accountRegionMap.get(key)[0] === value.location
                  ? actualEmissions
                  : expectedEmissionsForBestLocation}
              </TableCell>
              <TableCell>
                {accountRegionMap.get(key)[0] === value.location
                  ? 0
                  : percentReduction}{' '}
                %
              </TableCell>
            </TableRow>
          </>,
        )
      }
    }
    return array
  }

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
            Best Location to Shift your Deployed Location
          </Typography>
          <Typography className={classes.posOne}></Typography>
        </CardContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Actual Emissions</TableCell>
                <TableCell>Best Location</TableCell>
                <TableCell>Expected Emissions</TableCell>
                <TableCell>Percentage reduction in Emissions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{bestLocationTable(result)}</TableBody>
          </Table>
        </TableContainer>
      </Box>
    </DashboardCard>
  )
}

export default EmissionCard
