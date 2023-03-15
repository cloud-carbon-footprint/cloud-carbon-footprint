/*
 * © 2023 Thoughtworks, Inc.
 */

import { COMPUTE_PROCESSOR_TYPES } from '@cloud-carbon-footprint/core'

export const INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING: {
  [series: string]: string[]
} = {
  'ecs.s6': [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE],
}
