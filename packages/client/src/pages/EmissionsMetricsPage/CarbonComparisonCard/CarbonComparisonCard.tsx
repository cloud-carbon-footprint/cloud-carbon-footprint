/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { FunctionComponent, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Link,
} from '@material-ui/core'
import {
  FlightTakeoff,
  PhonelinkRing,
  Eco,
  OpenInNew,
} from '@material-ui/icons'
import { sumCO2 } from '../../../utils/helpers'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import NoDataMessage from '../../../common/NoDataMessage'

type Selection = 'flights' | 'phones' | 'trees'

type SourceItem = {
  href: string
  title: string
}

type ComparisonItem = {
  icon: React.ReactNode
  total: number
  textOne: string
  textTwo: string
  source: SourceItem
}

type Comparison = {
  [char: string]: ComparisonItem
  flights: ComparisonItem
  phones: ComparisonItem
  trees: ComparisonItem
}

const useStyles = makeStyles(({ palette, spacing, typography }) => {
  return {
    root: {
      width: '100%',
      height: '100%',
      minHeight: '755px',
    },
    title: {
      color: palette.primary.contrastText,
    },
    posOne: {
      color: palette.primary.contrastText,
    },
    posTwo: {
      maxWidth: 250,
    },
    topContainer: {
      backgroundColor: palette.primary.main,
      textAlign: 'center',
    },
    bottomContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '55%',
      paddingTop: '10%',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    metricOne: {
      color: palette.primary.contrastText,
      fontWeight: typography.fontWeightBold,
    },
    metricTwo: {
      color: palette.primary.light,
      fontWeight: typography.fontWeightBold,
    },
    icon: {
      height: 240,
      width: 200,
      color: palette.primary.light,
    },
    source: {
      padding: spacing(2),
      display: 'flex',
      justifyContent: 'center',
    },
    sourceLink: {
      padding: spacing(0, 1),
      display: 'inline-flex',
      alignItems: 'center',
      color: palette.extLink,
    },
    openIcon: {
      marginLeft: '8px',
    },
    noData: {
      marginTop: '75px',
    },
  }
})

export const toFlights = (co2mt: number): number => co2mt * 1.2345679 // direct one way flight from NYC to London per metric ton per CO2
export const toPhones = (co2mt: number): number => co2mt * 121643 // phones charged per metric ton of CO2
export const toTrees = (co2mt: number): number => co2mt * 16.5337915448

type CarbonComparisonCardProps = {
  data: EstimationResult[]
}

const CarbonComparisonCard: FunctionComponent<CarbonComparisonCardProps> = ({
  data,
}) => {
  const classes = useStyles()
  const [selection, setSelection] = useState('flights')
  const totalMetricTons: number = sumCO2(data)

  const totalFlights = toFlights(totalMetricTons)
  const totalPhones = toPhones(totalMetricTons)
  const totalTrees = toTrees(totalMetricTons)

  const formatNumber = (number: number, decimalPlaces = 0) => {
    if (number >= 1000000000) return `${(number / 1000000000).toFixed(1)}+ B`

    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}+ M`

    return number.toLocaleString(undefined, {
      maximumFractionDigits: decimalPlaces,
    })
  }

  const epaSource = {
    href: 'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator',
    title: 'EPA Equivalencies Calculator',
  }

  const comparisons: Comparison = {
    flights: {
      icon: (
        <FlightTakeoff className={classes.icon} data-testid="flightsIcon" />
      ),
      total: totalFlights,
      textOne: 'CO2e emissions from',
      textTwo: 'direct one way flights from NYC to London',
      source: {
        href: 'https://calculator.carbonfootprint.com/calculator.aspx?tab=3',
        title: 'Flight Carbon Footprint Calculator',
      },
    },
    phones: {
      icon: <PhonelinkRing className={classes.icon} data-testid="phonesIcon" />,
      total: totalPhones,
      textOne: 'CO2e emissions from',
      textTwo: 'smartphones charged',
      source: epaSource,
    },
    trees: {
      icon: <Eco className={classes.icon} data-testid="treesIcon" />,
      total: totalTrees,
      textOne: 'carbon sequestered by',
      textTwo: 'tree seedlings grown for 10 years',
      source: epaSource,
    },
  }

  const updateSelection = (selection: Selection) => {
    setSelection(selection)
  }

  const updateButtonColor = (buttonSelection: Selection) => {
    return buttonSelection === selection ? 'primary' : 'default'
  }

  const currentSource = comparisons[selection].source

  if (totalMetricTons) {
    return (
      <Card className={classes.root} id="carbonComparisonCard">
        <div>
          <CardContent className={classes.topContainer}>
            <Typography className={classes.title} gutterBottom>
              Your cumulative emissions are
            </Typography>
            <Typography
              className={classes.metricOne}
              id="metric-one"
              variant="h4"
              component="p"
              data-testid="co2"
            >
              {formatNumber(totalMetricTons, 1)} metric tons CO2e
            </Typography>
            <Typography className={classes.posOne}>
              that is equivalent to
            </Typography>
          </CardContent>
          <CardContent className={classes.bottomContainer}>
            <CardContent>{comparisons[selection].icon}</CardContent>
            <CardContent>
              <Typography className={classes.posTwo} variant="h5" component="p">
                {comparisons[selection].textOne}
              </Typography>
              <Typography
                className={classes.metricTwo}
                variant="h3"
                component="p"
                data-testid="comparison"
              >
                {formatNumber(comparisons[selection].total)}
              </Typography>
              <Typography className={classes.posTwo} variant="h5" component="p">
                {comparisons[selection].textTwo}
              </Typography>
            </CardContent>
          </CardContent>
          <CardActions className={classes.buttonContainer}>
            {Object.keys(comparisons).map((comparisonOption: Selection) => (
              <Button
                key={comparisonOption}
                id={comparisonOption}
                variant="contained"
                color={updateButtonColor(comparisonOption)}
                size="medium"
                onClick={() => updateSelection(comparisonOption)}
              >
                {comparisonOption}
              </Button>
            ))}
          </CardActions>
          <Typography className={classes.source} data-testid="epa-source">
            Source:{' '}
            <Link
              href={currentSource.href}
              target="_blank"
              rel="noopener"
              className={classes.sourceLink}
            >
              {currentSource.title}{' '}
              <OpenInNew fontSize={'small'} className={classes.openIcon} />
            </Link>
          </Typography>
        </div>
      </Card>
    )
  }

  return (
    <Card className={classes.root} id="carbonComparisonCard">
      <div>
        <CardContent className={classes.topContainer}>
          <Typography
            className={classes.metricOne}
            variant="h4"
            component="p"
            data-testid="co2"
          >
            Emissions comparison
          </Typography>
        </CardContent>
        <div className={classes.noData}>
          <NoDataMessage isTop={false} />
        </div>
      </div>
    </Card>
  )
}

export default CarbonComparisonCard
