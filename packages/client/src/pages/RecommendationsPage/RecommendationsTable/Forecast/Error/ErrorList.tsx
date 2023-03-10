import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'
import { Moment } from 'moment'
import { FunctionComponent } from 'react'
import { ForecastError as ErrorType } from '../Forecast'
import Error from './Error'
import useStyles from './errorStyles'

type ErrorListProps = {
  missingDates: Moment[]
}

const ErrorList: FunctionComponent<ErrorListProps> = ({ missingDates }) => {
  const classes = useStyles()

  return (
    <Accordion className={classes.accordionContainer}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Error errorType={ErrorType.MISSING_DAYS} hasContainer />
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <ul>
            {missingDates.map((date, i) => (
              <li key={i}>{date.format('LL').toString()}</li>
            ))}
          </ul>
        </Typography>
      </AccordionDetails>
    </Accordion>
  )
}

export default ErrorList
