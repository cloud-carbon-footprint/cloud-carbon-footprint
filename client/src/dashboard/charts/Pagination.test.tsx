/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { create } from 'react-test-renderer'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import React from 'react'
import Pagination from './Pagination'

describe('Pagination', () => {
  const handlePage = jest.fn()

  const data = [
    { x: 'ebs', y: 3015.014 },
    { x: 'ec2', y: 2521.406 },
    { x: 's3', y: 1718.017 },
    { x: 'lambda', y: 3015.014 },
    { x: 'rds', y: 2521.406 },
    { x: 'msk', y: 1718.017 },
    { x: 'mq', y: 3015.014 },
    { x: 'redshift', y: 2521.406 },
    { x: 'glue', y: 1718.017 },
  ]

  const page1 = [
    { x: 'ebs', y: 3015.014 },
    { x: 'ec2', y: 2521.406 },
    { x: 's3', y: 1718.017 },
  ]

  const page2 = [
    { x: 'lambda', y: 3015.014 },
    { x: 'rds', y: 2521.406 },
    { x: 'msk', y: 1718.017 },
  ]

  const page3 = [
    { x: 'mq', y: 3015.014 },
    { x: 'redshift', y: 2521.406 },
    { x: 'glue', y: 1718.017 },
  ]

  beforeEach(() => {
    handlePage.mockClear()
  })

  it('should render empty div when pagination data is an empty array', () => {
    const { getByLabelText } = render(<Pagination data={[]} handlePage={handlePage} pageSize={3} />)
    const noPaginationDataDiv = getByLabelText('no-pagination-data')

    expect(handlePage).toHaveBeenCalledWith([])
    expect(noPaginationDataDiv).toBeDefined()
  })

  it('renders Pagination with correct configuration', () => {
    const wrapper = create(<Pagination data={data} handlePage={handlePage} pageSize={3} />)
    expect(wrapper.toJSON()).toMatchSnapshot()
  })

  it('first page of data should be returned on mount', () => {
    create(<Pagination data={data} handlePage={handlePage} pageSize={3} />)
    expect(handlePage).toHaveBeenLastCalledWith(page1)
  })

  it('previous button should be disabled on first page', () => {
    const { getByLabelText } = render(<Pagination data={data} handlePage={handlePage} pageSize={3} />)
    const prevButton = getByLabelText('chevron-left')

    act(() => {
      fireEvent.click(prevButton)
    })

    expect(prevButton).toBeDisabled()
    expect(handlePage).toHaveBeenCalledTimes(1)
  })

  it('should be able to go to next page', () => {
    const { getByLabelText } = render(<Pagination data={data} handlePage={handlePage} pageSize={3} />)
    const nextButton = getByLabelText('chevron-right')

    expect(handlePage).toHaveBeenLastCalledWith(page1)

    act(() => {
      fireEvent.click(nextButton)
    })

    expect(handlePage).toHaveBeenCalledTimes(2)
    expect(handlePage).toHaveBeenLastCalledWith(page2)
  })

  it('once on the last page, next button should be disabled', () => {
    const { getByLabelText } = render(<Pagination data={data} handlePage={handlePage} pageSize={3} />)
    const nextButton = getByLabelText('chevron-right')

    expect(handlePage).toHaveBeenLastCalledWith(page1)
    act(() => {
      fireEvent.click(nextButton)
    })
    expect(handlePage).toHaveBeenCalledTimes(2)
    expect(handlePage).toHaveBeenLastCalledWith(page2)

    act(() => {
      fireEvent.click(nextButton)
    })
    expect(handlePage).toHaveBeenCalledTimes(3)
    expect(handlePage).toHaveBeenLastCalledWith(page3)

    act(() => {
      fireEvent.click(nextButton)
    })
    expect(nextButton).toBeDisabled()
    expect(handlePage).toHaveBeenCalledTimes(3)
  })
})
