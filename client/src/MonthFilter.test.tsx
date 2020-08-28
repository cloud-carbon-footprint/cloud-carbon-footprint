import React, { Dispatch, SetStateAction } from 'react'
import { render, fireEvent } from '@testing-library/react'
import MonthFilter from './MonthFilter'
import generateEstimations from './data/generateEstimations'
import { EstimationResult } from './types'
import moment from 'moment'

describe('MonthFilter', () => {
  let data: EstimationResult[]
  let mockSetDataInTimeframe: jest.Mocked<Dispatch<SetStateAction<EstimationResult[]>>>

  beforeEach(() => {
    data = generateEstimations(moment.utc(), 14)
    mockSetDataInTimeframe = jest.fn()
  })

  test('initial timeframe should filter up to 12 months prior', () => {
    render(<MonthFilter dataFromRemoteService={data} setDataInTimeframe={mockSetDataInTimeframe} />)

    expect(mockSetDataInTimeframe).toHaveBeenCalledWith(data.slice(0, 13))
  })

  test('clicking 1M button should filter up to 1 month prior', () => {
    const { getByText } = render(
      <MonthFilter dataFromRemoteService={data} setDataInTimeframe={mockSetDataInTimeframe} />,
    )

    fireEvent.click(getByText('1M'))

    expect(mockSetDataInTimeframe).toHaveBeenCalledWith(data.slice(0, 2))
  })

  test('clicking 3M button should filter up to 3 months prior', () => {
    const { getByText } = render(
      <MonthFilter dataFromRemoteService={data} setDataInTimeframe={mockSetDataInTimeframe} />,
    )

    fireEvent.click(getByText('3M'))

    expect(mockSetDataInTimeframe).toHaveBeenCalledWith(data.slice(0, 4))
  })

  test('clicking 6M button should filter up to 3 months prior', () => {
    const { getByText } = render(
      <MonthFilter dataFromRemoteService={data} setDataInTimeframe={mockSetDataInTimeframe} />,
    )

    fireEvent.click(getByText('6M'))

    expect(mockSetDataInTimeframe).toHaveBeenCalledWith(data.slice(0, 7))
  })

  test('clicking 12M button should filter up to 12 months prior', () => {
    const { getByText } = render(
      <MonthFilter dataFromRemoteService={data} setDataInTimeframe={mockSetDataInTimeframe} />,
    )

    // click away from initial state
    fireEvent.click(getByText('1M'))

    // click to filter up to 12M prior
    fireEvent.click(getByText('12M'))

    expect(mockSetDataInTimeframe).toHaveBeenCalledWith(data.slice(0, 13))
  })
})
