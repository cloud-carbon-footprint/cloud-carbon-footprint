/*
 * © 2021 Thoughtworks, Inc.
 */

import process from "process"
import commander from 'commander'
import CliPrompts from "../CliPrompts"
import { App, CreateValidFootprintRequest } from "@cloud-carbon-footprint/app"
import { EstimationResult } from "@cloud-carbon-footprint/common"

export default async function seedCacheFile(
    argv: string[] = process.argv,
): Promise<void> {
    const program = new commander.Command()
    program.storeOptionsAsProperties(false)

    program
        .option('-s, --startDate <string>', 'Start date in ISO format')
        .option('-e, --endDate <string>', 'End date in ISO format')
        .option(
            '-g, --groupBy <string>',
            'Group results by day, week, month, quarter, or year. Default is day.',
        )

    program.parse(argv)

    let startDate, endDate
    let groupBy: string

    if (program.opts().interactive) {
        ;[startDate, endDate, groupBy] = await CliPrompts()
    } else {
        const programOptions = program.opts()
        startDate = programOptions.startDate
        endDate = programOptions.endDate
        groupBy = programOptions.groupBy
    }

    const estimationRequest = CreateValidFootprintRequest({
        startDate,
        endDate,
        groupBy
    })

    await new App()
        .getCostAndEstimates(estimationRequest)
        .then((estimations: EstimationResult[]) => {
            if (estimations) {
                console.log('success')
            }
        })

}