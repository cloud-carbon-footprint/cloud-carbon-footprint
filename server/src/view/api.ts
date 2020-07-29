import express from 'express'
import { App } from '@application/App'
import { RawRequest } from '@application/EstimationRequest'
import EmissionsByDayTable from '@view/EmissionsByDayTable'
import { AWS_REGIONS } from '@domain/constants'

const app = express()
const port = 4000

app.get('/api', (req: express.Request, res: express.Response) => {
  const estimationRequest: RawRequest = {
    startDate: '2020-07-10',
    endDate: '2020-07-21',
    region: AWS_REGIONS.US_EAST_1,
  }
  new App().getEstimate(estimationRequest).then((result) => {
    const { table } = EmissionsByDayTable(result)
    res.json(table)
  })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
