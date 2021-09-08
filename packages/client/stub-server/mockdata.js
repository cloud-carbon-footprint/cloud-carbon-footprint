/*
 * © 2021 Thoughtworks, Inc.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const emissions = require('./emissions')
const footprint = require('./footprint')
const recommendations = require('./recommendations')

module.exports = function () {
  return {
    emissions,
    footprint,
    recommendations,
  }
}
