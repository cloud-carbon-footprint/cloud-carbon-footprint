/*
 * © 2023 Thoughtworks, Inc.
 */

import { ReplicationFactorsForService } from '@cloud-carbon-footprint/core'
import { ALI_CLOUD_CONSTANTS } from '../domain'

const { REPLICATION_FACTORS } = ALI_CLOUD_CONSTANTS

enum SERVICES {
  ECS = 'ecs',
}

export const ALI_REPLICATION_FACTORS_FOR_SERVICES: ReplicationFactorsForService =
  {
    [SERVICES.ECS]: (): number => {
      return REPLICATION_FACTORS.DEFAULT
    },
    DEFAULT() {
      return REPLICATION_FACTORS.DEFAULT
    },
  }
