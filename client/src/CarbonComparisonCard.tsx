import React, { FunctionComponent, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardContent, CardActions, Typography, Button } from '@material-ui/core'
import { DriveEta, LocalGasStation, Eco } from '@material-ui/icons'
import { sumCO2 } from './transformData'
import { EstimationResult } from './types'

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  posOne: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  posTwo: {
    maxWidth: 250,
  },
  topContainer: {
    backgroundColor: '#2C82BE',
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
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  metricTwo: {
    color: '#2C82BE',
    fontWeight: 'bold',
    margin: '20px 0',
  },
  icon: {
    height: 100,
    width: 100,
    color: '#2C82BE',
    padding: 20,
  },
  defaultButton: {
    color: '#000000',
    backgroundColor: '#E0E0E0',
    '&:hover': {
      backgroundColor: '##D5D5D5',
    },
  },
  activeButton: {
    color: '#FFFFFF',
    backgroundColor: '#2C82BE',
    '&:hover': {
    backgroundColor: '#2f75a8',
    },
  },
})

export const CarbonComparisonCard: FunctionComponent<CarbonComparisonCardProps> = ({ data }) => {
  const classes = useStyles()
  const [selection, setSelection] = useState('miles')
  const kgSum: number = sumCO2(data)

  const milesSum: any = (kgSum * 2.48138958).toPrecision(2)
  const gallonsSum: any = (kgSum * .1125239).toPrecision(2)
  const treesSum: any = (kgSum * .0165352).toPrecision(2)


  const comparisons: any = {
    gas: {
          icon: <LocalGasStation className={classes.icon} data-testid='gasIcon' />,
          total: gallonsSum,
          textOne: 'CO2 emissions from',
          textTwo: 'gallons of gasoline consumed',
    },
    miles: {
        icon: <DriveEta className={classes.icon} data-testid='milesIcon' />,
        total: milesSum,
        textOne: 'greenhouse gas emissions from',
        textTwo: 'miles driven by an average passenger vehicle',
    },
    trees: {
        icon: <Eco className={classes.icon}  data-testid='treesIcon' />,
        total: treesSum,
        textOne: 'carbon sequestered by',
        textTwo: 'tree seedlings grown for 10 years',
    },
  }

  const updateSelection = (selection: string) => {
    setSelection(selection)
  }

  let gasButtonClass: any = classes.defaultButton
  let treesButtonClass: any = classes.defaultButton
  let milesButtonClass: any = classes.activeButton

  if (selection === 'gas') {
    gasButtonClass = classes.activeButton
    treesButtonClass = classes.defaultButton
    milesButtonClass = classes.defaultButton
  } else if (selection === 'miles') {
    gasButtonClass = classes.defaultButton
    treesButtonClass = classes.defaultButton
    milesButtonClass = classes.activeButton
  } else if (selection === 'trees') {
    gasButtonClass = classes.defaultButton
    treesButtonClass = classes.activeButton
    milesButtonClass = classes.defaultButton
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
            <Typography className={classes.posOne}>
                that is equivalent to
            </Typography>
        </CardContent>
        <CardContent className={classes.bottomContainer}>
            <Typography>
                {comparisons[selection].icon}
            </Typography>
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
            <Button variant="contained" className={milesButtonClass} size="medium" onClick={() => updateSelection('miles')}>Miles</Button>
            <Button variant="contained" className={gasButtonClass} size="medium" onClick={() => updateSelection('gas')}>Gas</Button>
            <Button variant="contained" className={treesButtonClass} size="medium" onClick={() => updateSelection('trees')}>Trees</Button>
        </CardActions>
    </Card>
  )
}

type CarbonComparisonCardProps = {
    data: EstimationResult[]
}