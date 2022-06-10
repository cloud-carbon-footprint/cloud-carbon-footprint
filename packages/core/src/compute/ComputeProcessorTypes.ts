/*
 * © 2021 Thoughtworks, Inc.
 */

export enum Processor {
  CPU,
  GPU,
  Unknown,
}

type ComputeProcessor = {
  name: string // Name of the chip
  type: Processor // Processor type: CPU or GPU
  min_watts_avg?: number // Minimum watts (average)
  min_watts_on_prem?: number // Minimum watts (on prem)
  max_watts_avg?: number // Maximum watts (average)
  max_watts_on_prem?: number // Maximum watts (on prem)
  gb_chip_avg?: number // GB per chip (average)
  gb_on_prem?: number // GB installed (on prem)
}

export type ComputeProcessorType =
  | 'CASCADE_LAKE'
  | 'SKYLAKE'
  | 'BROADWELL'
  | 'HASWELL'
  | 'ICELAKE'
  | 'COFFEE_LAKE'
  | 'SANDY_BRIDGE'
  | 'IVY_BRIDGE'
  | 'AMD_EPYC_1ST_GEN'
  | 'AMD_EPYC_2ND_GEN'
  | 'AMD_EPYC_3RD_GEN'
  | 'NVIDIA_K520'
  | 'NVIDIA_A10G'
  | 'NVIDIA_T4'
  | 'NVIDIA_TESLA_M60'
  | 'NVIDIA_TESLA_K80'
  | 'NVIDIA_TESLA_V100'
  | 'NVIDIA_TESLA_A100'
  | 'NVIDIA_TESLA_P4'
  | 'NVIDIA_TESLA_P40'
  | 'NVIDIA_TESLA_P100'
  | 'AMD_RADEON_PRO_V520'
  | 'XILINX_ALVEO_U250'
  | 'AWS_GRAVITON'
  | 'AWS_GRAVITON_2'
  | 'UNKNOWN'

export const COMPUTE_PROCESSOR_TYPES: Record<
  ComputeProcessorType,
  ComputeProcessor
> = {
  // CPUs
  CASCADE_LAKE: {
    name: 'Cascade Lake',
    type: Processor.CPU,
    min_watts_avg: 0.64,
    min_watts_on_prem: 120,
    max_watts_avg: 3.97,
    max_watts_on_prem: 919,
    gb_chip_avg: 98.12,
    gb_on_prem: 797.971831,
  },
  SKYLAKE: {
    name: 'Skylake',
    type: Processor.CPU,
    min_watts_avg: 0.65,
    min_watts_on_prem: 88.9,
    max_watts_avg: 4.26,
    max_watts_on_prem: 733,
    gb_chip_avg: 81.32,
    gb_on_prem: 745.1358025,
  },
  BROADWELL: {
    name: 'Broadwell',
    type: Processor.CPU,
    min_watts_avg: 0.71,
    min_watts_on_prem: 46.6,
    max_watts_avg: 3.69,
    max_watts_on_prem: 272,
    gb_chip_avg: 69.65,
    gb_on_prem: 764.2352941,
  },
  HASWELL: {
    name: 'Haswell',
    type: Processor.CPU,
    min_watts_avg: 1,
    min_watts_on_prem: 46.9,
    max_watts_avg: 4.74,
    max_watts_on_prem: 272,
    gb_chip_avg: 27.71,
  },
  ICELAKE: {
    // We do not have values for this chip type
    name: 'Ice Lake',
    type: Processor.CPU,
  },
  COFFEE_LAKE: {
    name: 'Coffee Lake',
    type: Processor.CPU,
    min_watts_avg: 1.14,
    min_watts_on_prem: 15.9,
    max_watts_avg: 5.42,
    max_watts_on_prem: 71.7,
    gb_chip_avg: 19.56,
    gb_on_prem: 19.55555556,
  },
  SANDY_BRIDGE: {
    name: 'Sandy Bridge',
    type: Processor.CPU,
    min_watts_avg: 2.17,
    min_watts_on_prem: 57.5,
    max_watts_avg: 8.58,
    max_watts_on_prem: 257,
    gb_chip_avg: 16.7,
    gb_on_prem: 65.952,
  },
  IVY_BRIDGE: {
    name: 'Ivy Bridge',
    type: Processor.CPU,
    min_watts_avg: 3.04,
    min_watts_on_prem: 41.5,
    max_watts_avg: 8.25,
    max_watts_on_prem: 89.6,
    gb_chip_avg: 9.67,
    gb_on_prem: 45.33333333,
  },
  AMD_EPYC_1ST_GEN: {
    name: 'AMD EPYC 1st Gen',
    type: Processor.CPU,
    min_watts_avg: 0.82,
    min_watts_on_prem: 91.6,
    max_watts_avg: 2.55,
    max_watts_on_prem: 295.5,
    gb_chip_avg: 89.6,
    gb_on_prem: 166.4,
  },
  AMD_EPYC_2ND_GEN: {
    name: 'AMD EPYC 2nd Gen',
    type: Processor.CPU,
    min_watts_avg: 0.47,
    min_watts_on_prem: 83.4,
    max_watts_avg: 1.69,
    max_watts_on_prem: 394.5,
    gb_chip_avg: 129.78,
    gb_on_prem: 300.4444444,
  },
  AMD_EPYC_3RD_GEN: {
    name: 'AMD EPYC 3rd Gen',
    type: Processor.CPU,
    min_watts_avg: 0.45,
    max_watts_avg: 2.02,
    gb_chip_avg: 128.0,
  },
  AWS_GRAVITON: {
    // Same as AMD_EPYC_2ND_GEN
    name: 'AWS Graviton',
    type: Processor.CPU,
    min_watts_avg: 0.47,
    max_watts_avg: 1.69,
    gb_chip_avg: 129.78,
  },
  AWS_GRAVITON_2: {
    // Same as AMD_EPYC_2ND_GEN
    name: 'AWS Graviton2',
    type: Processor.CPU,
    min_watts_avg: 0.47,
    max_watts_avg: 1.69,
    gb_chip_avg: 129.78,
  },
  // GPUs
  NVIDIA_K520: {
    name: 'Nvidia K520',
    type: Processor.GPU,
    min_watts_avg: 26,
    max_watts_avg: 229,
  },
  NVIDIA_A10G: {
    name: 'Nvidia A10G',
    type: Processor.GPU,
    min_watts_avg: 18,
    max_watts_avg: 153,
  },
  NVIDIA_T4: {
    name: 'Nvidia T4',
    type: Processor.GPU,
    min_watts_avg: 8,
    max_watts_avg: 71,
  },
  NVIDIA_TESLA_M60: {
    name: 'Nvidia Tesla M60',
    type: Processor.GPU,
    min_watts_avg: 35,
    max_watts_avg: 306,
  },
  NVIDIA_TESLA_K80: {
    name: 'Nvidia Tesla K80',
    type: Processor.GPU,
    min_watts_avg: 35,
    max_watts_avg: 306,
  },
  NVIDIA_TESLA_V100: {
    name: 'Nvidia Tesla V100',
    type: Processor.GPU,
    min_watts_avg: 35,
    max_watts_avg: 306,
  },
  NVIDIA_TESLA_A100: {
    name: 'Nvidia Tesla A100',
    type: Processor.GPU,
    min_watts_avg: 46,
    max_watts_avg: 407,
  },
  NVIDIA_TESLA_P4: {
    name: 'Nvidia Tesla P4',
    type: Processor.GPU,
    min_watts_avg: 9,
    max_watts_avg: 76.5,
  },
  NVIDIA_TESLA_P40: {
    name: 'Nvidia Tesla P40',
    type: Processor.GPU,
    min_watts_avg: 30,
    max_watts_avg: 255,
  },
  NVIDIA_TESLA_P100: {
    name: 'Nvidia Tesla P100',
    type: Processor.GPU,
    min_watts_avg: 36,
    max_watts_avg: 306,
  },
  AMD_RADEON_PRO_V520: {
    name: 'AMD Radeon Pro V520',
    type: Processor.GPU,
    min_watts_avg: 26,
    max_watts_avg: 229,
  },
  XILINX_ALVEO_U250: {
    name: 'Xilinx Alveo U250',
    type: Processor.GPU,
    min_watts_avg: 27,
    max_watts_avg: 229.5,
  },
  UNKNOWN: {
    name: 'Unknown',
    type: Processor.Unknown,
  },
}

export const cascadeLakeSkylake = [
  COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.name,
  COMPUTE_PROCESSOR_TYPES.SKYLAKE.name,
]

export const broadwellHaswell = [
  COMPUTE_PROCESSOR_TYPES.HASWELL.name,
  COMPUTE_PROCESSOR_TYPES.BROADWELL.name,
]

export const broadwellSkylake = [
  COMPUTE_PROCESSOR_TYPES.BROADWELL.name,
  COMPUTE_PROCESSOR_TYPES.SKYLAKE.name,
]

export const broadwelCascadeLake = [
  COMPUTE_PROCESSOR_TYPES.BROADWELL.name,
  COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.name,
]

export const cascadeLakeSkylakeBroadwellHaswell = [
  COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.name,
  COMPUTE_PROCESSOR_TYPES.SKYLAKE.name,
  COMPUTE_PROCESSOR_TYPES.BROADWELL.name,
  COMPUTE_PROCESSOR_TYPES.HASWELL.name,
]

export const cascadeLakeSkylakeBroadwell = [
  COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.name,
  COMPUTE_PROCESSOR_TYPES.SKYLAKE.name,
  COMPUTE_PROCESSOR_TYPES.BROADWELL.name,
]

export const cascadeLakeHaswell = [
  COMPUTE_PROCESSOR_TYPES.HASWELL.name,
  COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.name,
]

export const skyLakeBroadwellHaswellAMDRome = [
  COMPUTE_PROCESSOR_TYPES.SKYLAKE.name,
  COMPUTE_PROCESSOR_TYPES.BROADWELL.name,
  COMPUTE_PROCESSOR_TYPES.HASWELL.name,
  COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN.name,
]

export const skyLakeBroadwellHaswellSandyBridgeIvyBridge = [
  COMPUTE_PROCESSOR_TYPES.SKYLAKE.name,
  COMPUTE_PROCESSOR_TYPES.BROADWELL.name,
  COMPUTE_PROCESSOR_TYPES.HASWELL.name,
  COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE.name,
  COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE.name,
]
