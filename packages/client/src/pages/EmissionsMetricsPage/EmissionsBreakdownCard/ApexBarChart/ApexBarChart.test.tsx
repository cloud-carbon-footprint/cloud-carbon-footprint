/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import Chart from 'react-apexcharts'
import moment from 'moment'
import {
  EstimationResult,
  EmissionRatioResult,
} from '@cloud-carbon-footprint/common'
import { fakeEmissionFactors } from 'utils/data'
import { sumCO2ByServiceOrRegion } from 'utils/helpers'
import { PageEntry } from 'Types'
import ApexBarChart from './ApexBarChart'
import Pagination, { Page } from '../Pagination'
import { createCustomBarColors } from './helpers'

jest.mock('apexcharts')

describe('ApexBarChart', () => {
  let fixture: ReactTestRenderer
  let barChartData: { string: [string, number] }
  const data: EstimationResult[] = [
    {
      timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
      serviceEstimates: [
        {
          cloudProvider: 'AWS',
          accountId: 'some account id',
          accountName: 'some account',
          serviceName: 'ebs',
          kilowattHours: 0,
          co2e: 3000.014,
          cost: 0,
          region: 'us-west-1',
        },
        {
          cloudProvider: 'AWS',
          accountId: 'some account id',
          accountName: 'some account',
          serviceName: 's3',
          kilowattHours: 0,
          co2e: 1000.014,
          cost: 0,
          region: 'us-west-2',
        },
        {
          cloudProvider: 'AWS',
          accountId: 'some account id',
          accountName: 'some account',
          serviceName: 'ec2',
          kilowattHours: 0,
          co2e: 2000.014,
          cost: 0,
          region: 'us-west-3',
        },
        {
          cloudProvider: 'AWS',
          accountId: 'some account id',
          accountName: 'some account',
          serviceName: 'eks',
          kilowattHours: 0,
          co2e: 0.000014,
          cost: 0,
          region: 'us-west-4',
        },
      ],
    },
  ]
  beforeEach(() => {
    barChartData = sumCO2ByServiceOrRegion(
      data as EstimationResult[],
      'service',
    )
    fixture = create(
      <ApexBarChart
        data={barChartData}
        dataType="service"
        emissionsData={fakeEmissionFactors}
      />,
    )
  })

  afterEach(() => {
    fixture.unmount()
  })

  it('renders with correct configuration', () => {
    expect(fixture.toJSON()).toMatchSnapshot()
  })

  it('should format tool tip values with proper data instead of scaled down data', () => {
    const handlePage: (page: Page<PageEntry>) => void =
      fixture.root.findByType(Pagination).props?.handlePage
    // make pagination send first page
    act(() => {
      handlePage({
        data: [
          { x: ['ebs', '(AWS)'], y: 100 },
          { x: ['ec2', '(AWS)'], y: 67.00015384528277 },
          { x: ['s3', '(AWS)'], y: 34.00030769056555 },
          { x: ['eks', '(AWS)'], y: 1 },
        ],
        page: 0,
      })
    })

    const yFormatter =
      fixture.root.findByType(Chart).props?.options?.tooltip?.y?.formatter
    expect(yFormatter).toBeDefined()
    expect(yFormatter(null, { dataPointIndex: 1 })).toEqual(
      '2000.014 metric tons',
    )
  })

  it('should format data label values with proper data instead of scaled down data', () => {
    const handlePage: (page: Page<PageEntry>) => void =
      fixture.root.findByType(Pagination).props?.handlePage
    // make pagination send first page
    act(() => {
      handlePage({
        data: [
          { x: ['ebs', '(AWS)'], y: 100 },
          { x: ['ec2', '(AWS)'], y: 67.00015384528277 },
          { x: ['s3', '(AWS)'], y: 34.00030769056555 },
          { x: ['eks', '(AWS)'], y: 1 },
        ],
        page: 0,
      })
    })

    const dataLabelFormatter =
      fixture.root.findByType(Chart).props?.options?.dataLabels?.formatter
    expect(dataLabelFormatter).toBeDefined()
    expect(dataLabelFormatter(null, { dataPointIndex: 1 })).toEqual('33.33 %')
  })

  it('should format data label values that are less than 0.01', () => {
    const handlePage: (page: Page<PageEntry>) => void =
      fixture.root.findByType(Pagination).props?.handlePage
    // make pagination send first page
    act(() => {
      handlePage({
        data: [
          { x: ['ebs', '(AWS)'], y: 100 },
          { x: ['ec2', '(AWS)'], y: 67.00015384528277 },
          { x: ['s3', '(AWS)'], y: 34.00030769056555 },
          { x: ['eks', '(AWS)'], y: 1 },
        ],
        page: 0,
      })
    })

    const dataLabelFormatter =
      fixture.root.findByType(Chart).props?.options?.dataLabels?.formatter
    expect(dataLabelFormatter).toBeDefined()
    expect(dataLabelFormatter(null, { dataPointIndex: 3 })).toEqual('< 0.01 %')
  })

  it('should filter, sort, order, and scale down data before passing it to Pagination component', function () {
    const paginationComponent = fixture.root.findByType(Pagination)
    const sortedData = [
      { x: ['ebs', '(AWS)'], y: 100 },
      { x: ['ec2', '(AWS)'], y: 67.00015384528277 },
      { x: ['s3', '(AWS)'], y: 34.00030769056555 },
      { x: ['eks', '(AWS)'], y: 1 },
    ]

    expect(paginationComponent.props.data).toEqual(sortedData)
  })

  it('should set colors to each bar based on region emissions', () => {
    barChartData = sumCO2ByServiceOrRegion(data as EstimationResult[], 'region')
    fixture = create(
      <ApexBarChart
        data={barChartData}
        dataType="region"
        emissionsData={fakeEmissionFactors}
      />,
    )
    expect(fixture.toJSON()).toMatchSnapshot()
    const paginationComponent = fixture.root.findByType(Pagination)
    const sortedData = [
      { x: ['us-west-1', '(AWS)'], y: 100 },
      { x: ['us-west-3', '(AWS)'], y: 67.00015384528277 },
      { x: ['us-west-2', '(AWS)'], y: 34.00030769056555 },
      { x: ['us-west-4', '(AWS)'], y: 1 },
    ]

    const customColors = ['#790000', '#D99200', '#DF5200', '#00791E']

    expect(paginationComponent.props.data).toEqual(sortedData)

    const optionColors = fixture.root.findByType(Chart).props?.options?.colors
    expect(optionColors).toBeDefined()
    expect(optionColors).toEqual(customColors)
  })

  it('should create custom colors array', () => {
    const firstPagedata = [
      { x: ['us-west-1', '(AWS)'], y: 100 },
      { x: ['us-west-3', '(AWS)'], y: 67.00015384528277 },
      { x: ['us-west-2', '(AWS)'], y: 34.00030769056555 },
      { x: ['us-west-4', '(AWS)'], y: 1 },
      { x: ['us-east-1', '(AWS)'], y: 2 },
    ]
    const pageData: Page<PageEntry> = { data: firstPagedata, page: 0 }
    const mainTheme = '#2C82BE'

    const emissionsData: EmissionRatioResult[] = fakeEmissionFactors
    const colors = ['#790000', '#D99200', '#DF5200', '#00791E', '#73B500']
    const defaultColors = [
      '#2C82BE',
      '#2C82BE',
      '#2C82BE',
      '#2C82BE',
      '#2C82BE',
    ]

    const customColors = createCustomBarColors(
      pageData,
      emissionsData,
      mainTheme,
    )

    expect(customColors).toEqual(colors)

    const mainColors = createCustomBarColors(pageData, [], mainTheme)

    expect(mainColors).toEqual(defaultColors)
  })
})
