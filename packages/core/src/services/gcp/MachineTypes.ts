/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import {
  COMPUTE_PROCESSOR_TYPES,
  broadwellSkylake,
  broadwelCascadeLake,
  skyLakeBroadwellHaswellAMDRome,
  skyLakeBroadwellHaswellSandyBridgeIvyBridge,
} from '../../domain/ComputeProcessorTypes'

export const INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING: {
  [instanceType: string]: string[]
} = {
  e2: skyLakeBroadwellHaswellAMDRome,
  n2: [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE],
  n2d: [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN],
  n1: skyLakeBroadwellHaswellSandyBridgeIvyBridge,
  c2: [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE],
  m2: broadwelCascadeLake,
  m1: broadwellSkylake,
  a2: [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE],
  'e2-micro': [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  'e2-small': [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  'e2-medium': [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  'f1-micro': [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  'g1-small': [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
}
