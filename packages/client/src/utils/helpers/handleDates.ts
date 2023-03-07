import moment, { Moment, unitOfTime } from 'moment'
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
  quarter: 1,
  year: 1,
}

export const getEmissionDateRange = ({ config = loadConfig() }: dateProps) => {
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

export const checkFootprintDates = (data, groupBy = 'day'): ForecastDetails => {
  const lastMonth = [...new Array(groupByAmount[groupBy])].map((i, n) =>
    moment
      .utc()
      .startOf(groupBy as moment.unitOfTime.StartOf)
      .subtract(n, `${groupBy}s` as unitOfTime.DurationConstructor),
  )

  const footprintDates = []
  data?.map((data) => {
    footprintDates.push(
      moment.utc(data.timestamp).startOf(groupBy as moment.unitOfTime.StartOf),
    )
  })

  const missingDates: Moment[] = lastMonth.filter((a) => {
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

export const checkIfAllDatesExistForForecast = ({ missingDates, groupBy }) =>
  groupByAmount[groupBy] == missingDates.length

export const sliceFootprintDataByLastMonth = (data, groupBy = 'day') => {
  return data?.slice(data.length - groupByAmount[groupBy])
}
