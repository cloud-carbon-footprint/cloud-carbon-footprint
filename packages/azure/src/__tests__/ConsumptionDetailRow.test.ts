/*
 * © 2021 ThoughtWorks, Inc.
 */

import ConsumptionDetailRow from '../lib/ConsumptionDetailRow'
import { mockConsumptionManagementResponseOne } from './fixtures/consumptionManagement.fixtures'

describe('ConsumptionDetailRow', () => {
  it('should return 1 vcpu as default when intance family is unkwon', () => {
    const computeComsumtionDetails = mockConsumptionManagementResponseOne[0]
    computeComsumtionDetails.meterDetails.meterName = 'test-meter-name'

    //when
    const result = new ConsumptionDetailRow(computeComsumtionDetails).getVCpus()

    //then
    expect(result).toEqual(1)
  })
})
