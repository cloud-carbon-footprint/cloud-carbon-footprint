import UsageData from '@domain/UsageData'

export default interface ComputeUsage extends UsageData {
  cpuUtilizationAverage: number
  numberOfvCpus: number
}
