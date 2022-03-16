/*
 * © 2021 Thoughtworks, Inc.
 */

export enum AWS_RECOMMENDATIONS_SERVICES {
  ComputeOptimizer = 'ComputeOptimizer',
  RightSizing = 'RightSizing',
  All = 'All',
}

export const AWS_DEFAULT_RECOMMENDATIONS_SERVICE =
  AWS_RECOMMENDATIONS_SERVICES.RightSizing
