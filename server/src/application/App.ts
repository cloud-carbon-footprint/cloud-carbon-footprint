import {EstimationRequest, RawRequest, validate} from '@application/EstimationRequest'
import {EstimationResult} from '@application/EstimationResult'
import FootprintEstimate from '@domain/FootprintEstimate'
import AWSServices from '@application/AWSServices'
import AWS from 'aws-sdk'
import {groupBy, reduceBy} from "ramda";

export class App {
    async getEstimate(rawRequest: RawRequest): Promise<EstimationResult[]> {
        const estimationRequest: EstimationRequest = validate(rawRequest)
        AWS.config.update({region: estimationRequest.region})

        const estimatesByService = await Promise.all(
            AWSServices().map((service) => {
                return service.getEstimates(estimationRequest.startDate, estimationRequest.endDate, estimationRequest.region)
            }),
        )

        const estimates: EstimationResult[] = estimatesByService.flatMap((estimates, i) => {
            const estimatesByDay = this.aggregateByDay(estimates)
            return estimatesByDay.map((estimate: FootprintEstimate) => {
                return {
                    timestamp: estimate.timestamp,
                    estimates: [
                        {
                            serviceName: AWSServices()[i].serviceName,
                            wattHours: estimate.wattHours,
                            co2e: estimate.co2e,
                        },
                    ],
                }
            })
        })

        const aggregateByTimestamp = new Map<number, EstimationResult>()
        estimates.forEach((estimate) => {
            const time = estimate.timestamp.getTime()
            if (!aggregateByTimestamp.has(time)) aggregateByTimestamp.set(time, estimate)
            else {
                const serviceEstimates = aggregateByTimestamp.get(time)
                serviceEstimates.estimates.push(...estimate.estimates)
            }
        })

        return Array.from(aggregateByTimestamp.values())
    }

    private aggregateByDay(estimates: FootprintEstimate[]) {

        const getDayOfEstimate = (estimate: FootprintEstimate) => estimate.timestamp.toISOString().substr(0, 10)

        const accumulatingFn = (acc: FootprintEstimate, value: FootprintEstimate) => {
            acc.timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
            acc.wattHours += value.wattHours
            acc.co2e += value.co2e
            return acc
        }


        const retval = reduceBy(accumulatingFn, {wattHours: 0, co2e: 0, timestamp: undefined}, getDayOfEstimate, estimates)

        return Object.values(retval)
    }
}
