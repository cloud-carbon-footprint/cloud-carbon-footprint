/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  COMPUTE_PROCESSOR_TYPES,
  broadwellSkylake,
  broadwelCascadeLake,
  skyLakeBroadwellHaswellAMDRome,
  skyLakeBroadwellHaswellSandyBridgeIvyBridge,
} from '@cloud-carbon-footprint/core'

export enum SHARED_CORE_PROCESSORS {
  E2_MICRO = 'e2-micro',
  E2_SMALL = 'e2-small',
  E2_MEDIUM = 'e2-medium',
  F1_MICRO = 'f1-micro',
  G1_SMALL = 'g1-small',
}

export const SHARED_CORE_PROCESSORS_BASELINE_UTILIZATION: {
  [key: string]: number
} = {
  [SHARED_CORE_PROCESSORS.E2_MICRO]: 25,
  [SHARED_CORE_PROCESSORS.E2_SMALL]: 50,
  [SHARED_CORE_PROCESSORS.E2_MEDIUM]: 100,
  [SHARED_CORE_PROCESSORS.F1_MICRO]: 10,
  [SHARED_CORE_PROCESSORS.G1_SMALL]: 25,
}

export const INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING: {
  [instanceType: string]: string[]
} = {
  e2: skyLakeBroadwellHaswellAMDRome,
  n2: [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE],
  n2d: [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN],
  t2d: [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN],
  n1: skyLakeBroadwellHaswellSandyBridgeIvyBridge,
  c2: [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE],
  c2d: [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN],
  m2: broadwelCascadeLake,
  m1: broadwellSkylake,
  a2: [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE],
  [SHARED_CORE_PROCESSORS.E2_MICRO]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  [SHARED_CORE_PROCESSORS.E2_SMALL]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  [SHARED_CORE_PROCESSORS.E2_MEDIUM]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  [SHARED_CORE_PROCESSORS.F1_MICRO]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
  [SHARED_CORE_PROCESSORS.G1_SMALL]: [COMPUTE_PROCESSOR_TYPES.UNKNOWN],
}
export const GPU_MACHINE_TYPES: string[] = [
  COMPUTE_PROCESSOR_TYPES.NVIDIA_T4,
  COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_K80,
  COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_V100,
  COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_A100,
  COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P4,
  COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P100,
]

export const MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING: {
  [instanceFamily: string]: { [instanceSize: string]: number[] } // [vcpus, scope3 emissions (mt CO2e)]
} = {
  'e2-standard': {
    'e2-standard-2': [2, 1.2303],
    'e2-standard-4': [4, 1.2303],
    'e2-standard-8': [8, 1.2303],
    'e2-standard-16': [16, 1.2303],
    'e2-standard-32': [32, 1.2303],
  },
  'e2-highmem': {
    'e2-highmem-2': [2, 1.2303],
    'e2-highmem-4': [4, 1.2303],
    'e2-highmem-8': [8, 1.2303],
    'e2-highmem-16': [16, 1.2303],
  },
  'e2-highcpu': {
    'e2-highcpu-2': [2, 1.0972],
    'e2-highcpu-4': [4, 1.0972],
    'e2-highcpu-8': [8, 1.0972],
    'e2-highcpu-16': [16, 1.0972],
    'e2-highcpu-32': [32, 1.0972],
  },
  'n2-standard': {
    'n2-standard-2': [2, 1.8879],
    'n2-standard-4': [4, 1.8879],
    'n2-standard-8': [8, 1.8879],
    'n2-standard-16': [16, 1.8879],
    'n2-standard-32': [32, 1.8879],
    'n2-standard-48': [48, 1.8879],
    'n2-standard-64': [64, 1.8879],
    'n2-standard-80': [80, 1.8879],
    'n2-standard-96': [96, 1.8879],
    'n2-standard-128': [128, 1.8879],
  },
  'n2-highmem': {
    'n2-highmem-2': [2, 2.3761],
    'n2-highmem-4': [4, 2.3761],
    'n2-highmem-8': [8, 2.3761],
    'n2-highmem-16': [16, 2.3761],
    'n2-highmem-32': [32, 2.3761],
    'n2-highmem-48': [48, 2.3761],
    'n2-highmem-64': [64, 2.3761],
    'n2-highmem-80': [80, 2.3761],
    'n2-highmem-96': [96, 2.3761],
    'n2-highmem-128': [128, 2.3761],
  },
  'n2-highcpu': {
    'n2-highcpu-2': [2, 1.311],
    'n2-highcpu-4': [4, 1.311],
    'n2-highcpu-8': [8, 1.311],
    'n2-highcpu-16': [16, 1.311],
    'n2-highcpu-32': [32, 1.311],
    'n2-highcpu-48': [48, 1.311],
    'n2-highcpu-64': [64, 1.311],
    'n2-highcpu-80': [80, 1.311],
    'n2-highcpu-96': [96, 1.311],
  },
  'n2d-standard': {
    'n2d-standard-2': [2, 2.3205],
    'n2d-standard-4': [4, 2.3205],
    'n2d-standard-8': [8, 2.3205],
    'n2d-standard-16': [16, 2.3205],
    'n2d-standard-32': [32, 2.3205],
    'n2d-standard-48': [48, 2.3205],
    'n2d-standard-64': [64, 2.3205],
    'n2d-standard-80': [80, 2.3205],
    'n2d-standard-96': [96, 2.3205],
    'n2d-standard-128': [128, 2.3205],
    'n2d-standard-224': [224, 2.3205],
  },
  'n2d-highmem': {
    'n2d-highmem-2': [2, 2.1429],
    'n2d-highmem-4': [4, 2.1429],
    'n2d-highmem-8': [8, 2.1429],
    'n2d-highmem-16': [16, 2.1429],
    'n2d-highmem-32': [32, 2.1429],
    'n2d-highmem-48': [48, 2.1429],
    'n2d-highmem-64': [64, 2.1429],
    'n2d-highmem-80': [80, 2.1429],
    'n2d-highmem-96': [96, 2.1429],
  },
  'n2d-highcpu': {
    'n2d-highcpu-2': [2, 1.3885],
    'n2d-highcpu-4': [4, 1.3885],
    'n2d-highcpu-8': [8, 1.3885],
    'n2d-highcpu-16': [16, 1.3885],
    'n2d-highcpu-32': [32, 1.3885],
    'n2d-highcpu-48': [48, 1.3885],
    'n2d-highcpu-64': [64, 1.3885],
    'n2d-highcpu-80': [80, 1.3885],
    'n2d-highcpu-96': [96, 1.3885],
    'n2d-highcpu-128': [128, 1.3885],
    'n2d-highcpu-224': [224, 1.3885],
  },
  't2d-standard': {
    't2d-standard-1': [1, 1.3107],
    't2d-standard-2': [2, 1.3107],
    't2d-standard-4': [4, 1.3107],
    't2d-standard-8': [8, 1.3107],
    't2d-standard-16': [16, 1.3107],
    't2d-standard-32': [32, 1.3107],
    't2d-standard-48': [48, 1.3107],
    't2d-standard-60': [60, 1.3107],
  },
  'n1-standard': {
    'n1-standard-1': [1, 1.6771],
    'n1-standard-2': [2, 1.6771],
    'n1-standard-4': [4, 1.6771],
    'n1-standard-8': [8, 1.6771],
    'n1-standard-16': [16, 1.6771],
    'n1-standard-32': [32, 1.6771],
    'n1-standard-64': [64, 1.6771],
    'n1-standard-96': [96, 1.6771],
  },
  'n1-highmem': {
    'n1-highmem-2': [2, 2.0432],
    'n1-highmem-4': [4, 2.0432],
    'n1-highmem-8': [8, 2.0432],
    'n1-highmem-16': [16, 2.0432],
    'n1-highmem-32': [32, 2.0432],
    'n1-highmem-64': [64, 2.0432],
    'n1-highmem-96': [96, 2.0432],
  },
  'n1-highcpu': {
    'n1-highcpu-2': [2, 1.2976],
    'n1-highcpu-4': [4, 1.2976],
    'n1-highcpu-8': [8, 1.2976],
    'n1-highcpu-16': [16, 1.2976],
    'n1-highcpu-32': [32, 1.2976],
    'n1-highcpu-64': [64, 1.2976],
    'n1-highcpu-96': [96, 1.2976],
  },
  'c2-standard': {
    'c2-standard-4': [4, 1.5107],
    'c2-standard-8': [8, 1.5107],
    'c2-standard-16': [16, 1.5107],
    'c2-standard-30': [30, 1.5107],
    'c2-standard-60': [60, 1.5107],
  },
  'c2d-standard': {
    'c2d-standard-2': [2, 1.6991],
    'c2d-standard-4': [4, 1.6991],
    'c2d-standard-8': [8, 1.6991],
    'c2d-standard-16': [16, 1.6991],
    'c2d-standard-32': [32, 1.6991],
    'c2d-standard-56': [56, 1.6991],
    'c2d-standard-112': [112, 1.6991],
  },
  'm1-ultramem': {
    'm1-ultramem-40': [40, 1.1],
    'm1-ultramem-80': [80, 1.1],
    'm1-ultramem-160': [160, 1.1],
  },
  'm1-megamem': {
    'm1-megamem-96': [96, 1.2],
  },
  'm2-ultramem': {
    'm2-ultramem-208': [208, 1.1],
    'm2-ultramem-416': [416, 1.1],
  },
  'm2-megamem': {
    'm2-megamem-416': [416, 1.1],
  },
  'a2-highgpu': {
    'a2-highgpu-1g': [12, 5.464],
    'a2-highgpu-2g': [24, 5.464],
    'a2-highgpu-4g': [48, 5.464],
    'a2-highgpu-8g': [96, 5.464],
  },
  'a2-megagpu': {
    'a2-megagpu-16g': [96, 5.464],
  },
}

export const MACHINE_FAMILY_SHARED_CORE_TO_MACHINE_TYPE_MAPPING: {
  [instanceFamily: string]: { [instanceSize: string]: number[] } // [vcpus, scope3 emissions]
} = {
  e2: {
    'e2-micro': [2, 1.2303],
    'e2-small': [2, 1.2303],
    'e2-medium': [2, 1.2303],
    'e2-standard-32': [32, 1.2303], // Used as a proxy for a full server in the machine family
  },
}

export const N1_SHARED_CORE_MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING: {
  [instanceSize: string]: number[] // [vcpus, scope3 emissions]
} = {
  'f1-micro': [1, 1.5771],
  'g1-small': [1, 1.5771],
  'n1-standard-96': [96, 1.6771], // Used as a proxy for a full server in the machine family
}
