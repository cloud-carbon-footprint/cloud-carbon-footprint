import React, { FunctionComponent, ReactElement } from 'react'
import { useRegionRecommendationData } from '../../../utils/hooks/RegionRecommendationDataHook'
import useStyles from '../../EmissionsMetricsPage/CarbonComparisonCard/carbonComparisonStyles'
import { AWS_REGIONS, AZURE_REGIONS, GCP_REGIONS } from './CloudRegions'
import DashboardCard from '../../../layout/DashboardCard'
import { Typography, CardContent } from '@material-ui/core'
import { DataGrid, GridColumns, GridOverlay } from '@mui/x-data-grid'
import LoadingMessage from '../../../common/LoadingMessage'
import ErrorPage from '../../../layout/ErrorPage'

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
      return getNearestRegionFromObject(accountRegion, AZURE_REGIONS)
    } else {
      return getNearestRegionFromEnum(accountRegion, GCP_REGIONS)
    }
  }

  const getNearestRegionFromEnum = (accountRegion: string, REGIONS: any) => {
    const nearestRegions = []
    const countryPrefix: string = accountRegion.slice(0, 2).toUpperCase()
    for (const regionName in REGIONS) {
      if (regionName.startsWith(countryPrefix)) {
        nearestRegions.push(REGIONS[regionName])
      }
    }
    return nearestRegions
  }

  const getNearestRegionFromObject = (accountRegion: string, REGIONS: any) => {
    const nearestRegions = []
    const countryPrefix: string = accountRegion.slice(0, 2).toUpperCase()
    for (const regionPair in Object.entries(REGIONS)) {
      if (regionPair[0].startsWith(countryPrefix)) {
        nearestRegions.push(regionPair[1])
      }
    }
    return nearestRegions
  }

  footPrintData.map((month) => {
    month.serviceEstimates.map((account) => {
      const date = new Date(
        new Date(month.timestamp).setMonth(
          new Date(month.timestamp).getMonth() + 1,
        ),
      )
      const endMonth =
        date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      if (accountRegionMap.get(account.accountName) != undefined) {
        const previousCo2e = accountRegionMap.get(account.accountName)[2]
        const previouskilowattHours = accountRegionMap.get(
          account.accountName,
        )[3]
        accountRegionMap.set(account.accountName, [
          account.region,
          account.cloudProvider,
          account.co2e + previousCo2e,
          account.kilowattHours + previouskilowattHours,
          findNearestRegions(account.region, account.cloudProvider),
          month.timestamp,
          `${date.getFullYear()}-${endMonth}-${date.getDate()}T00:00:00.000Z`,
        ])
      } else {
        accountRegionMap.set(account.accountName, [
          account.region,
          account.cloudProvider,
          account.co2e,
          account.kilowattHours,
          findNearestRegions(account.region, account.cloudProvider),
          month.timestamp,
          `${date.getFullYear()}-${endMonth}-${date.getDate()}T00:00:00.000Z`,
        ])
      }
    })
  })

  const { result, error, loading } =
    useRegionRecommendationData(accountRegionMap)

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
      field: 'actualEmissions',
      headerName: 'Actual Emisssions (Mg)',
      flex: 0.75,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'bestLocation',
      flex: 0.75,
      headerName: 'Best Location',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'expectedEmissions',
      headerName: 'Expected Emissions (Mg)',
      flex: 0.75,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'reduction',
      headerName: 'Reduction in Emissions',
      flex: 0.75,
      headerAlign: 'center',
      align: 'center',
    },
  ]

  const bestLocationTable = (result) => {
    // eslint-disable-next-line prefer-const
    let array = []
    for (const [key, value] of result) {
      if (value != undefined) {
        const expectedEmissionsForBestLocation =
          (value.carbonIntensity * accountRegionMap.get(key)[3]) / 1000000
        const actualEmissions = accountRegionMap.get(key)[2]
        const percentReduction =
          actualEmissions === 0
            ? 0
            : 100 - (expectedEmissionsForBestLocation * 100) / actualEmissions
        const reduction =
          accountRegionMap.get(key)[0] === value.location
            ? 0
            : Math.floor(percentReduction)
        const expectedEmissions =
          accountRegionMap.get(key)[0] === value.location
            ? actualEmissions.toFixed(5)
            : expectedEmissionsForBestLocation.toFixed(5)
        const bestLocation =
          actualEmissions <= expectedEmissions ? '-' : value.location
        array.push({
          id: key,
          region: accountRegionMap.get(key)[0],
          actualEmissions: actualEmissions.toFixed(5),
          bestLocation: bestLocation,
          expectedEmissions: expectedEmissions,
          reduction: `${reduction} %`,
        })
      }
    }
    return array
  }

  const renderTable = () => {
    return (
      <div style={{ height: 371, width: '100%' }}>
        <DataGrid
          rows={bestLocationTable(result)}
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
            Best Location to Shift your Deployment
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

export default RegionRecommendationCard
