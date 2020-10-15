import React from 'react'
import { create } from 'react-test-renderer'

import { DonutChartTabs } from './DonutChartTabs'
import { Tab } from '@material-ui/core'
import { ApexDonutChart } from './ApexDonutChart'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

jest.mock('../../themes')

describe('DonutChartTabs', () => {
  const date1 = new Date('2020-07-10T00:00:00.000Z')
  const date2 = new Date('2020-07-11T00:00:00.000Z')

  const dataWithHigherPrecision = [
    {
      timestamp: date1,
      serviceEstimates: [
        {
          timestamp: date1,
          serviceName: 'ebs',
          wattHours: 12.2342,
          co2e: 15.12341,
          cost: 5.82572,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
        {
          timestamp: date1,
          serviceName: 'ec2',
          wattHours: 4.745634,
          co2e: 5.234236,
          cost: 4.732,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
      ],
    },
    {
      timestamp: date2,
      serviceEstimates: [
        {
          timestamp: date2,
          serviceName: 'ebs',
          wattHours: 25.73446,
          co2e: 3.2600234,
          cost: 6.05931,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
        {
          timestamp: date2,
          serviceName: 'ec2',
          wattHours: 2.4523452,
          co2e: 7.7536,
          cost: 6.2323,
          region: 'us-east-1',
          usesAverageCPUConstant: true,
        },
      ],
    },
  ]

  it('renders donut chart with two tabs', () => {
    const testRenderer = create(<DonutChartTabs data={dataWithHigherPrecision} />)
    const testInstance = testRenderer.root
    const allTabInstancesList = testInstance.findAllByType(Tab)

    expect(allTabInstancesList).toHaveLength(2)

    allTabInstancesList.forEach((tab) => {
      expect(['Emissions By Region', 'Emissions By Service'].includes(tab.props.label)).toBe(true)
    })

    expect(testInstance.findAllByType(Tab))

    expect(testRenderer.toJSON()).toMatchSnapshot()
  })

  it('checks to see if donut chart exists upon loading', () => {
    const testRenderer = create(<DonutChartTabs data={dataWithHigherPrecision} />)
    const testInstance = testRenderer.root
    const isApexDonutChartRendered = testInstance.findAllByType(ApexDonutChart)

    expect(isApexDonutChartRendered).toHaveLength(1)
  })

  it('renders emission by region donut chart by default', () => {
    const testRenderer = create(<DonutChartTabs data={dataWithHigherPrecision} />)
    const testInstance = testRenderer.root
    const isApexDonutChartRendered = testInstance.findByType(ApexDonutChart)

    expect(isApexDonutChartRendered.props.dataType).toBe('region')
  })
  it('renders emission by service donut chart when service tab clicked', () => {
    Enzyme.configure({ adapter: new Adapter() })
    const wrapper = mount(<DonutChartTabs data={dataWithHigherPrecision} />)
    const tabsInstance = wrapper.find(Tab).at(1).simulate('click')
    wrapper.update()

    const isApexDonutChartRendered = wrapper.find(ApexDonutChart)
    expect(isApexDonutChartRendered.props().dataType).toBe('service')
  })
})
