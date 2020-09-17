if (process.env.NODE_ENV === 'production') {
  require('module-alias/register')
}

const port = 4000
import httpApp from '@view/api'

httpApp.listen(port, () => console.log(`Cloud Carbon Footprint Server listening at http://localhost:${port}`))
