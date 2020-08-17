import express from 'express'
import { App } from '@application/App'
import { RawRequest } from '@application/EstimationRequest'
import EmissionsByDayAndServiceTable from '@view/EmissionsByDayAndServiceTable'

const app = express()
const port = 4000

app.get('/api', (req: express.Request, res: express.Response) => {
  const estimationRequest: RawRequest = {
    startDate: '2020-07-10',
    endDate: '2020-08-10',
  }
  new App().getEstimate(estimationRequest).then((result) => {
    const { table } = EmissionsByDayAndServiceTable(result)
    res.json(table)
  })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
