import { EstimationResult, co2PerDay} from './types'

const transformData = (data:EstimationResult[]):ApexAxisChartSeries => {
    let returnData: co2PerDay[] = []

    data.forEach((EstimationResult) => {
        let co2eTotal = 0
        EstimationResult.serviceEstimates.forEach((serviceEstimate) => {
            co2eTotal += serviceEstimate.co2e
        })
        returnData.push({x: EstimationResult.timestamp, y: co2eTotal})
    })

    return [{data: returnData}]
}

export {
    transformData
}
