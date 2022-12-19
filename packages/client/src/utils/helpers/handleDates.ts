import moment, { unitOfTime } from 'moment'
import { ClientConfig } from 'src/Config'
import loadConfig from 'src/ConfigLoader'

interface dateProps {
  config?: ClientConfig
}
export const handleEmissionDateRange = ({
  config = loadConfig(),
}: dateProps) => {
  const dateRangeType: string = config.DATE_RANGE.TYPE
  const dateRangeValue: string = config.DATE_RANGE.VALUE

  let endDate: moment.Moment = moment
    .utc()
    .subtract(config.MINIMAL_DATE_AGE, 'days')
  if (config.END_DATE) {
    endDate = moment.utc(config.END_DATE)
  }

  let startDate: moment.Moment
  if (config.PREVIOUS_YEAR_OF_USAGE) {
    startDate = moment.utc(Date.UTC(endDate.year() - 1, 0, 1, 0, 0, 0, 0))
  } else if (config.START_DATE) {
    startDate = moment.utc(config.START_DATE)
  } else {
    startDate = moment
      .utc()
      .subtract(dateRangeValue, dateRangeType as unitOfTime.DurationConstructor)
  }
  const dates = {
    start: startDate,
    end: endDate,
  }
  return dates
}
