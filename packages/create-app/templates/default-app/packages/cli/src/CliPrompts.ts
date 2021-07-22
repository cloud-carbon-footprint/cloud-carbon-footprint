/*
 * © 2021 Thoughtworks, Inc.
 */

import { input, InputQuestion, prompt } from 'typed-prompts'

export default async function (): Promise<string[]> {
  const questions: InputQuestion[] = [
    input('startDate', 'Please enter start date: '),
    input('endDate', 'Please enter end date: '),
    input('region', 'Please enter AWS region (default is all regions): '),
    input(
      'groupBy',
      'Please enter how to group results by [day|service|dayAndService] (default is dayAndService): ',
    ),
    input(
      'format',
      'Please enter the desired format for the data [table|csv] (default is table): ',
    ),
  ]

  const rawInput = await prompt(questions)

  return [
    rawInput.startDate,
    rawInput.endDate,
    rawInput.region,
    rawInput.groupBy,
    rawInput.format,
  ]
}
