import IUsageData from '@domain/IUsageData'

export default interface ComputeUsage extends IUsageData {
  cpuUtilizationAverage: number
  numberOfvCpus: number
}
