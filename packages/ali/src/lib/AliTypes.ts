/*
 * © 2023 Thoughtworks, Inc.
 */

import { COMPUTE_PROCESSOR_TYPES } from '@cloud-carbon-footprint/core'

export const INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING: {
  [series: string]: string[]
} = {
  'ecs.s6': [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE],
}

export const GPU_VIRTUAL_MACHINE_TYPE_PROCESSOR_MAPPING: {
  [series: string]: string[]
} = {
  'ecs.sgn7i': [COMPUTE_PROCESSOR_TYPES.NVIDIA_A10G],
  'ecs.gn7r': [COMPUTE_PROCESSOR_TYPES.NVIDIA_A10G],
}
