/*
 * © 2021 ThoughtWorks, Inc.
 */

import { create } from 'react-test-renderer'

import React from 'react'
import { CustomTooltip } from './CustomTooltip'

describe('Custom Tooltip', () => {
  const cloudEstimatesPerDay = [
    {
      x: new Date('2020-12-01'),
      y: 10,
      usesAverageCPUConstant: true,
      kilowattHours: 100,
      cost: 5,
    },
    {
      x: new Date('2020-12-02'),
      y: 20,
      usesAverageCPUConstant: true,
      kilowattHours: 200,
      cost: 10,
    },
  ]

  const dataPointIndex = 1

  it('renders data in tooltip', () => {
    const tooltip = create(
      <CustomTooltip
        data={cloudEstimatesPerDay}
        dataPointIndex={dataPointIndex}
      />,
    )
    expect(tooltip.toJSON()).toMatchSnapshot()
  })
})
