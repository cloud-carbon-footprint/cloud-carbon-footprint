import React from 'react'
import { create } from 'react-test-renderer'

import { DonutChartTabs } from './DonutChartTabs'
import { Tab, Tabs } from '@material-ui/core'
import { ApexDonutChart } from './ApexDonutChart'
import { render } from '@testing-library/react'

jest.mock('../../themes')

describe('DonutChartTabs', () => {
  it('renders donut chart with two tabs', () => {
    const testRenderer = create(<DonutChartTabs data="" />)
    const testInstance = testRenderer.root
    const allTabInstancesList = testInstance.findAllByType(Tab)

    expect(allTabInstancesList).toHaveLength(2)

    allTabInstancesList.forEach((tab) => {
      expect(['Emissions By Region', 'Emissions By Service'].includes(tab.props.label)).toBe(true)
    })

    expect(testInstance.findAllByType(Tab))

    expect(testRenderer.toJSON()).toMatchSnapshot()
  })

  it('renders donut chart and shows emissions by region chart by default', () => {
    const testRenderer = create(<DonutChartTabs data="" />)
    const testInstance = testRenderer.root
    const isApexDonutChartRendered = testInstance.findAllByType(ApexDonutChart)

    expect(isApexDonutChartRendered).toHaveLength(0)
  })
})
