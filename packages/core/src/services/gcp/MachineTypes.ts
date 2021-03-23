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

export enum SHARED_CORE_PROCESSORS {
  E2_MICRO = 'e2-micro',
  E2_SMALL = 'e2-small',
  E2_MEDIUM = 'e2-medium',
  F1_MICRO = 'f1-micro',
  G1_SMALL = 'g1-small',
}

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
  [SHARED_CORE_PROCESSORS.E2_MICRO]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  [SHARED_CORE_PROCESSORS.E2_SMALL]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  [SHARED_CORE_PROCESSORS.E2_MEDIUM]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  [SHARED_CORE_PROCESSORS.F1_MICRO]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  [SHARED_CORE_PROCESSORS.G1_SMALL]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
}
