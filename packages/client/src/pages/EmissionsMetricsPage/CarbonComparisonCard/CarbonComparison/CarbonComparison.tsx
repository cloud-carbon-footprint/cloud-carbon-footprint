/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Link,
  Typography,
} from '@material-ui/core'
import { OpenInNew } from '@material-ui/icons'
import { ComparisonItem } from 'Types'
import useStyles from '../carbonComparisonStyles'

type CarbonComparisonProps = {
  formatNumber: (number: number, decimalPlaces?: number) => string
  totalMetricTons: number
  comparisons: { [name: string]: ComparisonItem }
  selection: string
  updateSelection: (selection: string) => void
  updateButtonColor: (selection: string) => 'default' | 'primary'
}

const CarbonComparison: FunctionComponent<CarbonComparisonProps> = ({
  formatNumber,
  totalMetricTons,
  comparisons,
  selection,
  updateSelection,
  updateButtonColor,
}): ReactElement => {
  const classes = useStyles()
  const currentSource = comparisons[selection].source

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
          {Object.keys(comparisons).map((comparisonOption: string) => (
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

export default CarbonComparison
