/*
 * © 2021 ThoughtWorks, Inc.
 */
export function setupSpy(
  spyMethod: any,
  targetFunction: string,
  returnValue: any,
): void {
  const targetFunctionSpy = jest.spyOn(spyMethod, targetFunction)
  ;(targetFunctionSpy as jest.Mock).mockResolvedValue(returnValue)
}
