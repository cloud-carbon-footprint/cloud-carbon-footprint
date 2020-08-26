import {transformData } from './transformData'

describe('transformData', () => {
    it('returns the sum of co2e for all services', () => {
        const date1 = new Date("2020-07-10T00:00:00.000Z")
        const date2 = new Date("2020-07-11T00:00:00.000Z")

        const data = [
            {
                "timestamp": date1,
                "serviceEstimates": [
                    {
                        "timestamp": date1,
                        "serviceName": "ebs",
                        "wattHours": 12,
                        "co2e": 15,
                        "cost": 0
                    },
                    {
                        "timestamp": date1,
                        "serviceName": "ec2",
                        "wattHours": 4,
                        "co2e": 5,
                        "cost": 0
                    }
                ]
            },
            {
                "timestamp": date2,
                "serviceEstimates": [
                    {
                        "timestamp": date2,
                        "serviceName": "ebs",
                        "wattHours": 25,
                        "co2e": 3,
                        "cost": 0
                    },
                    {
                        "timestamp": date2,
                        "serviceName": "ec2",
                        "wattHours": 2,
                        "co2e": 7,
                        "cost": 0
                    }
                ]
            },
        ]
        const expected = [{ data: [{x: date1, y: 20}, {x: date2, y: 10}] }]
        expect(transformData(data)).toEqual(expected)
    })
})

