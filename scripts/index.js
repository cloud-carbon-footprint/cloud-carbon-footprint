const fs = require('fs')
const path = require('path')
//CO2e -> kilowattHours * emissions[region];
function updateCO2eData() {
    const data = fs.readFileSync(
        path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
        'utf8',
    );
    const mockData = JSON.parse(data);

    mockData.footprint.forEach(({ serviceEstimates }) => {
        serviceEstimates.forEach((data) => {
            let emissions = mockData.emissions.find(({ region }) => region === data.region);
            let co2e = data.kilowattHours * emissions.mtPerKwHour;
            data.co2e = co2e;
            // console.log(data, " -> ", co2e);
        })
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
    console.log(mockData);
}

updateCO2eData();