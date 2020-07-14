import { input, InputQuestion, prompt } from 'typed-prompts'

export default async function (): Promise<string[]> {
  const questions: InputQuestion[] = [
    input('startDate', 'Please enter start date: '),
    input('endDate', 'Please enter end date: '),
  ]

  const rawInput = await prompt(questions)

  return [rawInput.startDate, rawInput.endDate]
}
