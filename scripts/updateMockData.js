const fs = require('fs')
const path = require('path')

async function main() {
    const data = fs.readFileSync(
        path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
        'utf8',
    );
    const mockData = JSON.parse(data);
    const today = new Date();

    mockData.footprint.forEach((footprint, index) => {
        footprint.timestamp = new Date(today.getFullYear(), today.getMonth() - 15 - index, today.getDate());
        footprint.serviceEstimates.forEach((serviceEstimate) => {
            const emissions = mockData.emissions.find(({ region }) => region === serviceEstimate.region);
            const co2e = serviceEstimate.kilowattHours * emissions.mtPerKwHour;
            serviceEstimate.co2e = co2e;
        })
    })

    mockData.recommendations.forEach((recommendation) => {
        const emissions = mockData.emissions.find(({ region }) => region === recommendation.region);
        const co2eSavings = recommendation.kilowattHourSavings * emissions.mtPerKwHour;
        recommendation.co2eSavings = co2eSavings;
    })

    fs.writeFileSync(
        path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
        JSON.stringify(mockData),
        (err) => {
            if (err) {
                console.error(err)
            }
        },
    )
}

main().catch((error) => {
    console.error(error.stack)
    process.exit(1)
});