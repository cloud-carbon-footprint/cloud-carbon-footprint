import moment from 'moment'

const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
}

const getRandomNumberInRange = (minValue, maxValue) => {
    return Math.max(Math.random() * maxValue, minValue + Math.random())
}

const generateEstimations = (today, monthsBack) => {
    const todayAsMoment = moment(today)

    const output = {
        footprint: []
    }

    for (let i = 0; i <= monthsBack; i++) {

        const timestamp = today.clone().utc().subtract(i, 'M').hours(0).minutes(0).seconds(0).millisecond(0)
        const footprintForMonth = {
            timestamp,
            serviceEstimates: [
                {
                    timestamp,
                    serviceName: "ebs",
                    wattHours: Math.random(),
                    co2e: 5,
                    cost: 0
                },
                {
                    timestamp,
                    serviceName: "s3",
                    wattHours: Math.random() / 1000,
                    co2e: 5,
                    cost: 0
                },
                {
                    timestamp,
                    serviceName: "ec2",
                    wattHours: getRandomNumberInRange(50, 75),
                    co2e:  getRandomInt(5),
                    cost: getRandomNumberInRange(1.5, 2)
                }
            ]
        }

        output.footprint.push(footprintForMonth)
    }

    return JSON.stringify(output)
}

export default generateEstimations
  