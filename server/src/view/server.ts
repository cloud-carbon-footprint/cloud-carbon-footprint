if (process.env.NODE_ENV === 'production') {
  require('module-alias/register')
}

import express from 'express'
import api from './api'
import auth from './auth'

const port = process.env.PORT || 4000
const httpApp = express()

if (process.env.NODE_ENV === 'production') {
  httpApp.use(auth)
}

httpApp.use('/api', api)

httpApp.listen(port, () => console.log(`Cloud Carbon Footprint Server listening at http://localhost:${port}`))
