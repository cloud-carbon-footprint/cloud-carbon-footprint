const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function main() {
    const awsEmissionFactorCsvUrl = 'https://raw.githubusercontent.com/cloud-carbon-footprint/cloud-carbon-coefficients/main/data/grid-emissions-factors-aws.csv';
    const azureEmissionFactorCsvUrl = 'https://raw.githubusercontent.com/cloud-carbon-footprint/cloud-carbon-coefficients/main/data/grid-emissions-factors-azure.csv';
    const gcpEmissionFactorCsvUrl = 'https://raw.githubusercontent.com/cloud-carbon-footprint/cloud-carbon-coefficients/main/data/grid-emissions-factors-gcp.csv';

    const awsEmission = await fetchEmissionData(awsEmissionFactorCsvUrl);
    const azureEmission = await fetchEmissionData(azureEmissionFactorCsvUrl);
    const gcpEmission = await fetchEmissionData(gcpEmissionFactorCsvUrl);

    const data = fs.readFileSync(
        path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
        'utf8',
    );
    const mockData = JSON.parse(data);
    const today = new Date();

    mockData.emissions.forEach((emission) => {
        const awsEmissionFactor = awsEmission.find(({ Region }) => emission.region === Region);
        const azureEmissionFactor = azureEmission.find(({ Region }) => emission.region === Region);
        const gcpEmissionFactor = gcpEmission.find(({ Region }) => emission.region === Region);
        if (awsEmissionFactor !== undefined) {
            emission.mtPerKwHour = awsEmissionFactor['CO2e (metric ton/kWh)'];
        }
        else if (azureEmissionFactor !== undefined) {
            emission.mtPerKwHour = azureEmissionFactor['CO2e (metric ton/kWh)'];
        }
        else if (gcpEmissionFactor !== undefined) {
            emission.mtPerKwHour = gcpEmissionFactor['CO2e (metric ton/kWh)'];
        }
    })

    mockData.footprint.forEach((footprint, index) => {
        footprint.timestamp = new Date(today.getFullYear(), today.getMonth() - 15 - index, today.getDate());
        footprint.serviceEstimates.forEach((serviceEstimate) => {
            const emissions = mockData.emissions.find(({ region }) => region === serviceEstimate.region);
            const co2e = emissions ? serviceEstimate.kilowattHours * emissions.mtPerKwHour : serviceEstimate.co2e;
            serviceEstimate.co2e = co2e;
        })
    })

    mockData.recommendations.forEach((recommendation) => {
        const emissions = mockData.emissions.find(({ region }) => region === recommendation.region);
        const co2eSavings = emissions ? recommendation.kilowattHourSavings * emissions.mtPerKwHour : recommendation.co2eSavings;
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

async function fetchEmissionData(url) {
    const response = await fetch(url);
    const text = await response.text();
    const csvData = text.split('\n').map(row => row.split(','));
    const headers = csvData[0];
    const jsonData = csvData.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });
    return jsonData;
}

main().catch((error) => {
    console.error(error.stack)
    process.exit(1)
});