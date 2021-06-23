/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { ReactElement } from 'react'
import { Box, Grid, Card, makeStyles, Paper } from '@material-ui/core'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { ChartDataTypes } from 'Types'
import { ApexBarChart } from './ApexBarChart'
import SelectDropdown from '../../../common/SelectDropdown'

const useStyles = makeStyles(() => {
  return {
    root: {
      width: '100%',
      height: '100%',
      overflow: 'unset',
      minHeight: '755px',
    },
    topContainer: {
      boxShadow: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: '24px',
    },
    title: {
      margin: '0',
      fontSize: '24px',
      fontFamily: 'Helvetica, Arial, sans-serif',
      opacity: '1',
      fontWeight: 900,
      color: 'rgba(0, 0, 0, 0.87)',
      padding: '.2em',
    },
  }
})

const EmissionsBreakdownContainer = (props: {
  containerClass: string
  data: EstimationResult[]
}): ReactElement => {
  const classes = useStyles()
  const [chartType, setChartType] = React.useState(ChartDataTypes.REGION)

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setChartType(event.target.value as ChartDataTypes)
  }

  return (
    <Grid item className={props.containerClass}>
      <Card className={classes.root} id="emissionsBreakdownContainer">
        <Box padding={3}>
          <Paper className={classes.topContainer}>
            <p className={classes.title}>Emissions Breakdown</p>
            <SelectDropdown
              id="breakdown"
              value={chartType}
              dropdownOptions={Object.values(ChartDataTypes)}
              handleChange={handleChange}
            />
          </Paper>
          <ApexBarChart data={props.data} dataType={chartType} />
        </Box>
      </Card>
    </Grid>
  )
}

export default EmissionsBreakdownContainer
