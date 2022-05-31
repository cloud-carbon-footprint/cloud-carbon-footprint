/*
 * © 2021 Thoughtworks, Inc.
 */

export default abstract class OnPremiseBillingDataRow {
  public memory: number
  public cpuDescription: string
  public machineType: string
  public machineName: string
  public processorFamilies: string[]
  public region: string
  public cpuUtilization: number
  public powerUsageEffectiveness: number
  public upTime: { [key: string]: number }
  public startTime: Date
  public endTime: Date
  public dailyUptime: number
  public dailyKilowattHours: number
  public dailyCo2e: number
  public weeklyUptime: number
  public weeklyKilowattHours: number
  public weeklyCo2e: number
  public monthlyUptime: number
  public monthlyKilowattHours: number
  public monthlyCo2e: number
  public annualUptime: number
  public annualKilowattHours: number
  public annualCo2e: number

  protected constructor(init: Partial<OnPremiseBillingDataRow>) {
    Object.assign(this, init)
  }
}
