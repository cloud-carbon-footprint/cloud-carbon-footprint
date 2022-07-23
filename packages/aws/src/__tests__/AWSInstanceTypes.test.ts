/*
 * © 2022 Thoughtworks, Inc.
 */

import { EC2_INSTANCE_TYPES } from '../lib/AWSInstanceTypes'

describe('', () => {
  function expectInstanceType(vCPUs: number, memory: number, scope3: number) {
    return {
      toBeGreaterThan: (v: number, m: number, s3: number) => {
        expect(vCPUs).toBeGreaterThanOrEqual(v)
        expect(memory).toBeGreaterThanOrEqual(m)
        expect(scope3).toBeGreaterThanOrEqual(s3)
      },
    }
  }

  it('verify ec2 types have increasing vCPUs, Memory and Scope 3', () => {
    // the purpose of this test is to catch problems of mistype or copy and paste
    let family: keyof typeof EC2_INSTANCE_TYPES
    for (family in EC2_INSTANCE_TYPES) {
      let [pre_vCPU, pre_Mem, pre_Scope3] = [0, 0, 0]
      for (const instanceType in EC2_INSTANCE_TYPES[family]) {
        const [cur_vCPU, cur_Mem, cur_Scope3] =
          EC2_INSTANCE_TYPES[family][instanceType]

        expectInstanceType(cur_vCPU, cur_Mem, cur_Scope3).toBeGreaterThan(
          pre_vCPU,
          pre_Mem,
          pre_Scope3,
        )

        pre_vCPU = cur_vCPU
        pre_Mem = cur_Mem
        pre_Scope3 = cur_Scope3
      }
    }
  })
})
