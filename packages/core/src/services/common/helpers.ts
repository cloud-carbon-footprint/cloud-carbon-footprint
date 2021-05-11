/*
 * © 2021 ThoughtWorks, Inc.
 */

export const getPhysicalChips = (
  largestInstanceTypevCpus: number,
  instanceFamily?: string,
): number => {
  // we roughly equivalate one physical chip to be at most 96 vCpus
  // to calculate, we take the vCpus of the largest instance type and divide by 96
  // there are special cases for instance families m5zn and z1d where they are always 2
  if (['m5zn', 'z1d'].includes(instanceFamily)) {
    return 2
  }
  return Math.ceil(largestInstanceTypevCpus / 96)
}

export const calculateGigabyteHours = (
  largestInstanceTypevCpus: number,
  largestInstanceTypeMemory: number,
  processorMemory: number,
  instanceTypeMemory: number,
  usageAmount: number,
  instanceFamily?: string,
): number => {
  const physicalChips = getPhysicalChips(
    largestInstanceTypevCpus,
    instanceFamily,
  )
  const instanceMemory = largestInstanceTypeMemory / physicalChips
  let gigabyteHours
  // once we calculate the memory from aws instance type data and cross reference it with the
  // memory we calculate from the microarchitecture (SPECPower Data) associated with the instance type,
  // we find the difference and calculate memory usage based on the additional gigabytes
  if (instanceMemory - processorMemory > 0) {
    // first we subract the memory calculated from the microarchitecture
    // from the memory calculated from the instance type data
    const largestInstanceGigabyteDelta = instanceMemory - processorMemory

    // we consider the largest instance type in the family to be a rough equivalent to a full processor
    // we identify the ratio of the memory of the current instance type
    // to the largest instance type in the family (ie. 48 gb / 12 gb = 4 gb)
    const instanceMemoryRatio = largestInstanceTypeMemory / instanceTypeMemory

    // gigabytes per hour are then calculated by the taking the additional gb of memory from the delta
    // and dividing it by the vcpu ratio, then multiping the usage amount in hours
    gigabyteHours =
      (largestInstanceGigabyteDelta / instanceMemoryRatio) * usageAmount
  }
  return gigabyteHours
}
