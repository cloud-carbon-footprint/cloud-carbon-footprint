const fs = require('fs')
const path = require('path')
//CO2e -> kilowattHours * emissions[region];
function updateData() {
    const data = fs.readFileSync(
        path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
        'utf8',
    );
    const mockData = JSON.parse(data);

    mockData.footprint.forEach(({ serviceEstimates }) => {
        serviceEstimates.forEach((data) => {
            let emissions = mockData.emissions.find(({ region }) => region === data.region);
            let co2e = data.kilowattHours * emissions.mtPerKwHour;
            console.log(data.co2e, " -> ", co2e);
        })
    })
}

updateData();