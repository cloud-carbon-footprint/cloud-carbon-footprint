/*
 * © 2021 Thoughtworks, Inc.
 */

import { useRemoteQueueService } from './utils/hooks'
import config from './ConfigLoader'
import moment, { unitOfTime } from 'moment'
import { ReactElement } from 'react'

const QueueTest = (): ReactElement => {
  // Setup Queue Hook
  const dateRangeType: string = config().DATE_RANGE.TYPE
  const dateRangeValue: string = config().DATE_RANGE.VALUE
  const endDate: moment.Moment = moment.utc()

  let startDate: moment.Moment
  if (config().PREVIOUS_YEAR_OF_USAGE) {
    startDate = moment.utc(Date.UTC(endDate.year() - 1, 0, 1, 0, 0, 0, 0))
  } else {
    startDate = moment
      .utc()
      .subtract(dateRangeValue, dateRangeType as unitOfTime.DurationConstructor)
  }
  const { data, loading } = useRemoteQueueService([], startDate, endDate)

  if (loading.queue) {
    return <h1>Loading</h1>
  }

  return <h1>{data === [] ? 'Yes' : 'No'}</h1>
}

export default QueueTest
