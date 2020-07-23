import express from 'express'
import { App } from '@application/App'
import { RawRequest } from '@application/EstimationRequest'

const app = express()
const port = 4000

app.get('/api', (req: express.Request, res: express.Response) => {
  const estimationRequest: RawRequest = { startDate: '2020-07-10', endDate: '2020-07-21', region: 'us-east-1' }
  const resultP = new App().getEstimate(estimationRequest)
  resultP.then((result) => {
    res.json(result)
  })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
