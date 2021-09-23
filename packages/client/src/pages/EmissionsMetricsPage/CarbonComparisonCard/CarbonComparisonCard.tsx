/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, useState } from 'react'
import { FlightTakeoff, PhonelinkRing, Eco } from '@material-ui/icons'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { sumEstimate } from 'utils/helpers'
import NoDataMessage from 'common/NoDataMessage'
import DashboardCard from 'layout/DashboardCard'
import { Source, ComparisonItem } from 'Types'
import CarbonComparison from './CarbonComparison'
import useStyles from './carbonComparisonStyles'

type Selection = 'flights' | 'phones' | 'trees'

type Comparisons = {
  [name: string]: ComparisonItem
  flights: ComparisonItem
  phones: ComparisonItem
  trees: ComparisonItem
}

type CarbonComparisonCardProps = {
  data: EstimationResult[]
}

const CarbonComparisonCard: FunctionComponent<CarbonComparisonCardProps> = ({
  data,
}) => {
  const [selection, setSelection] = useState('flights')
  const classes = useStyles()

  const toFlights = (co2mt: number): number => co2mt * 1.2345679 // direct one way flight from NYC to London per metric ton per CO2
  const toPhones = (co2mt: number): number => co2mt * 121643 // phones charged per metric ton of CO2
  const toTrees = (co2mt: number): number => co2mt * 16.5337915448

  const formatNumber = (number: number, decimalPlaces = 0) => {
    if (number >= 1000000000) return `${(number / 1000000000).toFixed(1)}+ B`

    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}+ M`

    return number >= 1
      ? number.toLocaleString(undefined, {
          maximumFractionDigits: decimalPlaces,
        })
      : Number(number.toExponential(decimalPlaces)).toString()
  }

  const totalMetricTons = sumEstimate(data, 'co2e')
  const totalFlights = toFlights(totalMetricTons)
  const totalPhones = toPhones(totalMetricTons)
  const totalTrees = toTrees(totalMetricTons)

  const sources: { [name: string]: Source } = {
    epa: {
      href: 'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator',
      title: 'EPA Equivalencies Calculator',
    },
    flightCalculator: {
      href: 'https://calculator.carbonfootprint.com/calculator.aspx?tab=3',
      title: 'Flight Carbon Footprint Calculator',
    },
  }

  const comparisons: Comparisons = {
    flights: {
      icon: (
        <FlightTakeoff className={classes.icon} data-testid="flightsIcon" />
      ),
      total: totalFlights,
      textOne: 'CO2e emissions from',
      textTwo: 'direct one way flights from NYC to London',
      source: sources.flightCalculator,
    },
    phones: {
      icon: <PhonelinkRing className={classes.icon} data-testid="phonesIcon" />,
      total: totalPhones,
      textOne: 'CO2e emissions from',
      textTwo: 'smartphones charged',
      source: sources.epa,
    },
    trees: {
      icon: <Eco className={classes.icon} data-testid="treesIcon" />,
      total: totalTrees,
      textOne: 'carbon sequestered by',
      textTwo: 'tree seedlings grown for 10 years',
      source: sources.epa,
    },
  }

  const updateSelection = (selection: Selection) => {
    setSelection(selection)
  }

  const updateButtonColor = (buttonSelection: Selection) =>
    buttonSelection === selection ? 'primary' : 'default'

  if (totalMetricTons) {
    return (
      <DashboardCard isHalf noPadding testId="carbonComparison">
        <CarbonComparison
          formatNumber={formatNumber}
          totalMetricTons={totalMetricTons}
          comparisons={comparisons}
          selection={selection}
          updateSelection={updateSelection}
          updateButtonColor={updateButtonColor}
        />
      </DashboardCard>
    )
  }

  return <NoDataMessage isHalf boldTitle="Emissions Comparison" />
}

export default CarbonComparisonCard
