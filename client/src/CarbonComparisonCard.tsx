import React, { FunctionComponent, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardContent, CardActions, Typography, Button } from '@material-ui/core'
import { DriveEta, LocalGasStation, Eco } from '@material-ui/icons'
import { sumCO2 } from './transformData'
import { EstimationResult } from './types'

type Selection = 'miles' | 'gas' | 'trees'
type ComparisionItem = {
  icon: React.ReactNode
  total: string
  textOne: string
  textTwo: string
}
type Comparision = {
  [gas: string]: ComparisionItem
  // [miles: string]: ComparisionItem
  // [trees: string]: ComparisionItem
}

const useStyles = makeStyles(({ palette }) => ({
  root: {
    width: '100%',
    height: '100%',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 0.125rem',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 16,
    color: palette.primary.contrastText,
  },
  posOne: {
    fontSize: 16,
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
    height: '60%',
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricOne: {
    color: palette.primary.contrastText,
    fontWeight: 'bold',
  },
  metricTwo: {
    color: palette.primary.main,
    fontWeight: 'bold',
    margin: '1.25rem 0',
  },
  icon: {
    height: 100,
    width: 100,
    color: palette.primary.main,
    padding: 20,
  },
}))

export const CarbonComparisonCard: FunctionComponent<CarbonComparisonCardProps> = ({ data }) => {
  const classes = useStyles()
  const [selection, setSelection] = useState('miles')
  const kgSum: number = sumCO2(data)

  const milesSum: any = (kgSum * 2.48138958).toPrecision(2)
  const gallonsSum: any = (kgSum * 0.1125239).toPrecision(2)
  const treesSum: any = (kgSum * 0.0165352).toPrecision(2)

  const comparisons: Comparision = {
    gas: {
      icon: <LocalGasStation className={classes.icon} data-testid="gasIcon" />,
      total: gallonsSum,
      textOne: 'CO2 emissions from',
      textTwo: 'gallons of gasoline consumed',
    },
    miles: {
      icon: <DriveEta className={classes.icon} data-testid="milesIcon" />,
      total: milesSum,
      textOne: 'greenhouse gas emissions from',
      textTwo: 'miles driven by an average passenger vehicle',
    },
    trees: {
      icon: <Eco className={classes.icon} data-testid="treesIcon" />,
      total: treesSum,
      textOne: 'carbon sequestered by',
      textTwo: 'tree seedlings grown for 10 years',
    },
  }

  const updateSelection = (selection: Selection) => {
    setSelection(selection)
  }

  const updateButtonColor = (buttonSelection: Selection) => {
    return buttonSelection === selection ? 'primary' : 'default'
  }

  return (
    <Card className={classes.root}>
      <CardContent className={classes.topContainer}>
        <Typography className={classes.title} gutterBottom>
          Your Cumulative Emissions are
        </Typography>
        <Typography className={classes.metricOne} variant="h4" component="h2">
          {kgSum.toPrecision(2)} kg CO2e
        </Typography>
        <Typography className={classes.posOne}>that is equivalent to</Typography>
      </CardContent>
      <CardContent className={classes.bottomContainer}>
        <Typography>{comparisons[selection].icon}</Typography>
        <CardContent>
          <Typography className={classes.posTwo} variant="h5" component="h2">
            {comparisons[selection].textOne}
          </Typography>
          <Typography className={classes.metricTwo} variant="h3" component="h2">
            {comparisons[selection].total}
          </Typography>
          <Typography className={classes.posTwo} variant="h5" component="h2">
            {comparisons[selection].textTwo}
          </Typography>
        </CardContent>
      </CardContent>
      <CardActions className={classes.buttonContainer}>
        <Button
          variant="contained"
          color={updateButtonColor('miles')}
          size="medium"
          onClick={() => updateSelection('miles')}
        >
          Miles
        </Button>
        <Button
          variant="contained"
          color={updateButtonColor('gas')}
          size="medium"
          onClick={() => updateSelection('gas')}
        >
          Gas
        </Button>
        <Button
          variant="contained"
          color={updateButtonColor('trees')}
          size="medium"
          onClick={() => updateSelection('trees')}
        >
          Trees
        </Button>
      </CardActions>
    </Card>
  )
}

type CarbonComparisonCardProps = {
  data: EstimationResult[]
}
