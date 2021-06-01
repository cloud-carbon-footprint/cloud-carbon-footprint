/*
 * © 2021 ThoughtWorks, Inc.
 */

export default abstract class BillingDataRow {
  public serviceName: string
  public accountName: string
  public usageAmount: number
  public usageType: string
  public usageUnit: string
  public cost: number
  public region: string
  public cloudProvider: string
  public timestamp: Date
  public vCpus: number
  public vCpuHours: number
  public machineType: string
  public seriesName: string

  protected constructor(init: Partial<BillingDataRow>) {
    Object.assign(this, init)
  }
}
