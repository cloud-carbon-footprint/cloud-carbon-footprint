/*
 * © 2021 Thoughtworks, Inc.
 */

import { LegacyUsageDetail } from '@azure/arm-consumption/esm/models'

import ConsumptionDetailRow from '../lib/ConsumptionDetailRow'

describe('ConsumptionDetailRow', () => {
  it('should return 1 vCpu as default when instance family is unknown', () => {
    //given
    const computeConsumptionDetails: LegacyUsageDetail = {
      kind: null,
      meterDetails: {
        meterName: 'test-usageType',
      },
    }

    //when
    const result = new ConsumptionDetailRow(
      computeConsumptionDetails,
    ).getVCpus()

    //then
    expect(result).toEqual(1)
  })
})
