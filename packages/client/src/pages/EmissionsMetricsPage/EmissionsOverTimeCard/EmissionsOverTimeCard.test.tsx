/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  create,
  ReactTestInstance,
  ReactTestRenderer,
} from 'react-test-renderer'

import { EstimationResult } from '@cloud-carbon-footprint/common'

import ApexLineChart from './ApexLineChart'
import EmissionsOverTimeCard from './EmissionsOverTimeCard'

jest.mock('apexcharts')
jest.mock('../../../utils/themes')

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

  it('checks to see if line chart exists upon loading', () => {
    const isApexLineChartRendered = testInstance.findAllByType(ApexLineChart)

    expect(isApexLineChartRendered).toHaveLength(1)
  })
  it('should render co2e emissions line chart by default', () => {
    const isApexLineChartRendered = testInstance.findByType(ApexLineChart)

    expect(isApexLineChartRendered.props.data).toBe(dataWithHigherPrecision)
  })
})
