/*
 * © 2021 Thoughtworks, Inc.
 */

import { LookupTableInput } from '@cloud-carbon-footprint/common'

export const lookupTableInputData: LookupTableInput[] = [
  {
    serviceName: 'Compute Engine',
    region: 'us-east4',
    usageType: 'N1 Predefined Instance Core running in Virginia',
    usageUnit: 'seconds',
    machineType: 'n1-standard-4',
  },
  {
    serviceName: 'Compute Engine',
    region: 'europe-west1',
    usageType: 'Storage PD Capacity',
    usageUnit: 'byte-seconds',
    machineType: '',
  },
  {
    serviceName: 'Compute Engine',
    region: 'europe-west1',
    usageType: 'Network Internet Egress from EMEA to Americas',
    usageUnit: 'bytes',
    machineType: '',
  },
  {
    serviceName: 'Compute Engine',
    region: 'us-central1',
    usageType: 'SSD backed PD Capacity',
    usageUnit: 'byte-seconds',
    machineType: '',
  },
  {
    serviceName: 'App Engine',
    region: 'us-east4',
    usageType: 'Backend Instances',
    usageUnit: 'seconds',
    machineType: '',
  },
  {
    serviceName: 'Compute Engine',
    region: 'us-east4',
    usageType: 'Network Inter Region Ingress from Netherlands to Americas',
    usageUnit: 'bytes',
    machineType: '',
  },
]
