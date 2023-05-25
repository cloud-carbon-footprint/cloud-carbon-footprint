import { Express, Request, Response } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
// import {version} from '../package.json'
import { Logger } from '@cloud-carbon-footprint/common'
const serverLogger = new Logger('server')

const version = '1.6.0'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CCF API Docs',
      version,
    },
  },
  apis: ['./src/api.ts', '../common/src/*.ts'],
}

const swaggerSpec = swaggerJsdoc(options)

function swaggerDocs(app: Express, port: number) {
  // Swagger page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  // Docs in JSON format
  app.get('/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  serverLogger.info(`Docs available at http://localhost:${port}/docs`)
}

export default swaggerDocs
