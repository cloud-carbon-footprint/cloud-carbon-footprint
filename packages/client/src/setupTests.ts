/*
 * © 2021 Thoughtworks, Inc.
 */

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

// suppress warning that comes from react-dates which the library maintainers cannot / will not fix
// this may hide warnings that are caused by other class-based components
// https://github.com/airbnb/react-dates/issues/1748
jest.spyOn(global.console, 'warn').mockImplementation((message) => {
  if (
    !message.includes('componentWillReceiveProps') &&
    !message.includes('componentWillUpdate')
  ) {
    global.console.warn(message)
  }
})

// Mock react-apexcharts globally to avoid relying on ApexCharts internals in tests.
// This keeps the component API surface (props) available for assertions while
// preventing runtime errors from the underlying charting library.
jest.mock('react-apexcharts', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockApexChart(_: any) {
    return null
  }
})
