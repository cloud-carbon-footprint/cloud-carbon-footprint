/*
 * © 2021 Thoughtworks, Inc.
 */

export default abstract class OnPremiseBillingDataRow {
  public memory: number
  public machineType: string
  public processorFamilies: string[]
  public usageHours: number
  public region: string
  public cpuUtilization: number
  public powerUsageEffectiveness: number
  public kilowattHours?: number
  public co2e?: number

  protected constructor(init: Partial<OnPremiseBillingDataRow>) {
    Object.assign(this, init)
  }
}
