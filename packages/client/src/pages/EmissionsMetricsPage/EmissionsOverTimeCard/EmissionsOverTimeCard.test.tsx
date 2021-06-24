/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  create,
  ReactTestInstance,
  ReactTestRenderer,
} from 'react-test-renderer'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import NoDataMessage from 'common/NoDataMessage'
import ApexLineChart from './ApexLineChart'
import EmissionsOverTimeCard from './EmissionsOverTimeCard'

jest.mock('apexcharts')
jest.mock('utils/themes')

describe('Emissions Over Time Card', () => {
  const date1 = new Date('2020-07-10T00:00:00.000Z')
  const styleClass = {}
  let testRenderer: ReactTestRenderer, testInstance: ReactTestInstance

  const dataWithHigherPrecision: EstimationResult[] = [
    {
      timestamp: date1,
      serviceEstimates: [
        {
          cloudProvider: 'aws',
          accountId: 'testacctid',
          accountName: 'testacct',
          serviceName: 'ebs',
          kilowattHours: 12.2342,
          co2e: 15.12341,
          cost: 5.82572,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: 'testacctid',
          accountName: 'testacct',
          serviceName: 'ec2',
          kilowattHours: 4.745634,
          co2e: 5.234236,
          cost: 4.732,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
      ],
    },
  ]

  beforeEach(() => {
    testRenderer = create(
      <EmissionsOverTimeCard
        classes={styleClass}
        filteredData={dataWithHigherPrecision}
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

    expect(apexLineChart.props.data).toBe(dataWithHigherPrecision)
  })

  it('should render no data message when there is no data to display', () => {
    testRenderer = create(
      <EmissionsOverTimeCard classes={styleClass} filteredData={[]} />,
    )

    const noDataMessage = testRenderer.root.findAllByType(NoDataMessage)

    expect(noDataMessage).toHaveLength(1)
  })
})
