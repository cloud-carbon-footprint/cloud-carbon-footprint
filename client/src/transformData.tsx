import { EstimationResult, co2PerDay } from './types'

const transformData = (data:EstimationResult[]):{}[] => {
    let co2DailyTotals: co2PerDay[] = []

    data.forEach((EstimationResult) => {
        let co2eTotal = 0
        EstimationResult.serviceEstimates.forEach((serviceEstimate) => {
            co2eTotal += serviceEstimate.co2e
        })
        co2DailyTotals.push({x: EstimationResult.timestamp, y: co2eTotal})
    })
    return co2DailyTotals
}

export { transformData }
