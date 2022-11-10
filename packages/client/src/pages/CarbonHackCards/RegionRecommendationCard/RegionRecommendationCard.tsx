import React, { FunctionComponent, ReactElement } from 'react'
import { useRegionRecommendationData } from '../../../utils/hooks/RegionRecommendationDataHook'
import useStyles from '../../EmissionsMetricsPage/CarbonComparisonCard/carbonComparisonStyles'
import { AWS_REGIONS } from './AWSRegions'
import DashboardCard from '../../../layout/DashboardCard'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Typography, CardContent } from '@material-ui/core'
import LoadingMessage from '../../../common/LoadingMessage'
const RegionRecommendationCard: FunctionComponent<any> = ({
  data,
}): ReactElement => {
  const accountRegionMap = new Map()

  const classes = useStyles()
  const footPrintData = data !== undefined ? data : []

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { result, error, loading } = useRegionRecommendationData(dataToSend)

  const bestLocationTable = (result) => {
    // eslint-disable-next-line prefer-const
    let array = []
    for (const [key, value] of result) {
      if (value != undefined) {
        const expectedEmissionsForBestLocation =
          (value.carbonIntensity * accountRegionMap.get(key)[3]) / 1000000
        const actualEmissions = accountRegionMap.get(key)[2]
        const percentReduction =
          100 - (expectedEmissionsForBestLocation * 100) / actualEmissions
        array.push(
          <TableRow
            key={actualEmissions}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell align="center">{key}</TableCell>
            <TableCell component="th" scope="row" align="center">
              {accountRegionMap.get(key)[0]}
            </TableCell>
            <TableCell align="center">{actualEmissions.toFixed(5)}</TableCell>
            <TableCell align="center">{value.location}</TableCell>
            <TableCell align="center">
              {accountRegionMap.get(key)[0] === value.location
                ? actualEmissions.toFixed(5)
                : expectedEmissionsForBestLocation.toFixed(5)}
            </TableCell>
            <TableCell align="center">
              {accountRegionMap.get(key)[0] === value.location
                ? 0
                : Math.floor(percentReduction)}{' '}
              %
            </TableCell>
          </TableRow>,
        )
      }
    }
    return array
  }

  const renderTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Account</TableCell>
              <TableCell align="center">Region</TableCell>
              <TableCell align="center">Actual Emissions (Mg)</TableCell>
              <TableCell align="center">Best Location</TableCell>
              <TableCell align="center">Expected Emissions (Mg)</TableCell>
              <TableCell align="center">Reduction in Emissions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{bestLocationTable(result)}</TableBody>
        </Table>
      </TableContainer>
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
            Best Location to Shift your Deployed Location
          </Typography>
          <Typography className={classes.posOne}></Typography>
        </CardContent>
        {loading ? (
          <LoadingMessage
            message={'Loading cloud data. This may take a while...'}
          />
        ) : (
          renderTable()
        )}
      </React.Fragment>
    </DashboardCard>
  )
}

export default RegionRecommendationCard
