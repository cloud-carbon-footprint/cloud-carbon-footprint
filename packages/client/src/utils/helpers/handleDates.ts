import moment, { Moment, unitOfTime } from 'moment'
import { GroupBy } from '@cloud-carbon-footprint/common'
import { ClientConfig } from 'src/Config'
import loadConfig from 'src/ConfigLoader'
import { ForecastDetails } from '../../pages/RecommendationsPage/RecommendationsTable/Forecast/Forecast'

interface dateProps {
  config?: ClientConfig
}

const groupByAmount = {
  day: 30,
  week: 4,
  month: 1,
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

  return {
    start: startDate,
    end: endDate,
  }
}

export const checkFootprintDates = ({
  footprint,
  groupBy = 'day' as GroupBy,
}): ForecastDetails => {
  const lastThirtyDays = [...new Array(groupByAmount[groupBy])].map((i, n) =>
    moment
      .utc()
      .startOf(groupBy as moment.unitOfTime.StartOf)
      .subtract(n, `${groupBy}s` as unitOfTime.DurationConstructor),
  )

  const footprintDates = []
  footprint?.data?.map((data) => {
    footprintDates.push(
      moment.utc(data.timestamp).startOf(groupBy as moment.unitOfTime.StartOf),
    )
  })

  const missingDates: Moment[] = lastThirtyDays.filter((a) => {
    const index = footprintDates.findIndex((date: string) =>
      moment.utc(date).isSame(a),
    )
    return index < 0
  })

  return {
    missingDates,
    groupBy,
  }
}

export const checkIfAllDatesExistForForecast = ({ missingDates, groupBy }) => {
  return groupByAmount[groupBy] == missingDates.length
}
