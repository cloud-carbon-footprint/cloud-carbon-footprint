/*
 * © 2021 Thoughtworks, Inc.
 */

import { Typography } from '@material-ui/core'
import ForecastCard from '../ForecastCard/ForecastCard'
import useStyles from './forecastStyles'

const Forecast = () => {
  const classes = useStyles()
  return (
    <div>
      <Typography className={classes.title}>Forecast</Typography>

      <ForecastCard title={'Current'} co2eSavings={255} costSavings={16.255} />
    </div>
  )
}

export default Forecast
