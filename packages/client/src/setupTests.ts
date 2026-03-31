/*
 * © 2021 Thoughtworks, Inc.
 */

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

// Suppress legacy React lifecycle warnings from older third-party dependencies in tests.
// This may also hide similar warnings from other class components.
jest.spyOn(global.console, 'warn').mockImplementation((message) => {
  if (
    !message.includes('componentWillReceiveProps') &&
    !message.includes('componentWillUpdate')
  ) {
    global.console.warn(message)
  }
})
