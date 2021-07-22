/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  create,
  ReactTestInstance,
  ReactTestRenderer,
} from 'react-test-renderer'
import { mockDataWithHigherPrecision } from 'utils/data'
import NoDataMessage from 'common/NoDataMessage'
import ApexLineChart from './ApexLineChart'
import EmissionsOverTimeCard from './EmissionsOverTimeCard'

jest.mock('apexcharts')
jest.mock('utils/themes')

describe('Emissions Over Time Card', () => {
  const styleClass = {}
  let testRenderer: ReactTestRenderer, testInstance: ReactTestInstance

  beforeEach(() => {
    testRenderer = create(
      <EmissionsOverTimeCard
        classes={styleClass}
        filteredData={mockDataWithHigherPrecision}
      />,
    )
    testInstance = testRenderer.root
  })

  afterEach(() => {
    testRenderer.unmount()
  })

  it('should render the apex line chart after loading', () => {
    const apexLineChart = testInstance.findAllByType(ApexLineChart)

    expect(apexLineChart).toHaveLength(1)
  })

  it('should pass data to the line chart to render co2e emissions', () => {
    const apexLineChart = testInstance.findByType(ApexLineChart)

    expect(apexLineChart.props.data).toBe(mockDataWithHigherPrecision)
  })

  it('should render no data message when there is no data to display', () => {
    testRenderer = create(
      <EmissionsOverTimeCard classes={styleClass} filteredData={[]} />,
    )

    const noDataMessage = testRenderer.root.findAllByType(NoDataMessage)

    expect(noDataMessage).toHaveLength(1)
  })
})
