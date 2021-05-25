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
import { sumCO2 } from './transformData'
import { EstimationResult } from '../models/types'
import NoDataPage from './NoDataPage'

type Selection = 'flights' | 'phones' | 'trees'

type ComparisonItem = {
  icon: React.ReactNode
  total: number
  textOne: string
  textTwo: string
}

type Comparison = {
  [char: string]: ComparisonItem
  flights: ComparisonItem
  phones: ComparisonItem
  trees: ComparisonItem
}

type SourceItem = {
  href: string
  title: string
}

type Source = {
  [char: string]: SourceItem
  flights: SourceItem
  epa: SourceItem
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

export const toMiles = (co2mt: number): number => co2mt * 2481.3918390475
export const toGas = (co2mt: number): number => co2mt * 112.5247230304
export const toTrees = (co2mt: number): number => co2mt * 16.5337915448

export const CarbonComparisonCard: FunctionComponent<CarbonComparisonCardProps> =
  ({ data }) => {
    const classes = useStyles()
    const [selection, setSelection] = useState('flights')
    const mtSum: number = sumCO2(data)

    const milesSum = toMiles(mtSum)
    const gasSum = toGas(mtSum)
    const treesSum = toTrees(mtSum)

    const formatNumber = (number: number, decimalPlaces = 0) =>
      number.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces })

    const comparisons: Comparison = {
      flights: {
        icon: (
          <FlightTakeoff className={classes.icon} data-testid="flightsIcon" />
        ),
        total: milesSum,
        textOne: 'greenhouse gas emissions from',
        textTwo: 'miles driven on average',
      },
      phones: {
        icon: (
          <PhonelinkRing className={classes.icon} data-testid="phonesIcon" />
        ),
        total: gasSum,
        textOne: 'CO2 emissions from',
        textTwo: 'gallons of gasoline consumed',
      },
      trees: {
        icon: <Eco className={classes.icon} data-testid="treesIcon" />,
        total: treesSum,
        textOne: 'carbon sequestered by',
        textTwo: 'tree seedlings grown for 10 years',
      },
    }

    const sources: Source = {
      flights: {
        href: 'https://calculator.carbonfootprint.com/calculator.aspx?tab=3',
        title: 'Flight Carbon Footprint Calculator',
      },
      epa: {
        href: 'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator',
        title: 'EPA Equivalencies Calculator',
      },
    }

    const updateSelection = (selection: Selection) => {
      setSelection(selection)
    }

    const updateButtonColor = (buttonSelection: Selection) => {
      return buttonSelection === selection ? 'primary' : 'default'
    }

    const currentSource = sources[selection] || sources.epa

    return (
      <Card className={classes.root} id="carbonComparisonCard">
        {mtSum ? (
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
                {formatNumber(mtSum, 1)} metric tons CO2e
              </Typography>
              <Typography className={classes.posOne}>
                that is equivalent to
              </Typography>
            </CardContent>
            <CardContent className={classes.bottomContainer}>
              <CardContent>{comparisons[selection].icon}</CardContent>
              <CardContent>
                <Typography
                  className={classes.posTwo}
                  variant="h5"
                  component="p"
                >
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
                <Typography
                  className={classes.posTwo}
                  variant="h5"
                  component="p"
                >
                  {comparisons[selection].textTwo}
                </Typography>
              </CardContent>
            </CardContent>
            <CardActions className={classes.buttonContainer}>
              <Button
                id="flights"
                variant="contained"
                color={updateButtonColor('flights')}
                size="medium"
                onClick={() => updateSelection('flights')}
              >
                Flights
              </Button>
              <Button
                id="phones"
                variant="contained"
                color={updateButtonColor('phones')}
                size="medium"
                onClick={() => updateSelection('phones')}
              >
                Phones
              </Button>
              <Button
                id="trees"
                variant="contained"
                color={updateButtonColor('trees')}
                size="medium"
                onClick={() => updateSelection('trees')}
              >
                Trees
              </Button>
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
                <OpenInNew
                  fontSize={'small'}
                  className={classes.openIcon}
                ></OpenInNew>
              </Link>
            </Typography>
          </div>
        ) : (
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
              <NoDataPage isTop={false} />
            </div>
          </div>
        )}
      </Card>
    )
  }

type CarbonComparisonCardProps = {
  data: EstimationResult[]
}
