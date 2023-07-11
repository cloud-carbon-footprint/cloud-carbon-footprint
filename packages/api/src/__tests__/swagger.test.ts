/*
 * © 2021 Thoughtworks, Inc.
 */

import { Logger } from '@cloud-carbon-footprint/common'
import request from 'supertest'
import express from 'express'
import swaggerDocs from '../utils/swagger'

describe('swaggerDocs', () => {
  const server = express()
  const port = 3000

  beforeAll(() => {
    swaggerDocs(server, port)
  })

  it('should return the Swagger UI page', async () => {
    const res = await request(server).get(encodeURI('/docs')).redirects(1)
    expect(res.status).toEqual(200)
    expect(res.text).toContain('Swagger UI')
  })

  it('should return the Swagger JSON file', async () => {
    const res = await request(server).get('/docs.json')
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('openapi')
    expect(res.body.openapi).toEqual('3.0.0')
    expect(res.body).toHaveProperty('info')
    expect(res.body.info).toHaveProperty('title')
    expect(res.body.info.title).toEqual('CCF API Docs')
    expect(res.body.info).toHaveProperty('version')
    expect(res.body.info.version).toEqual('1.6.0')
  })

  it('should log the availability of the docs', () => {
    const spy = jest.spyOn(Logger.prototype, 'info')
    swaggerDocs(server, port)
    expect(spy).toHaveBeenCalledWith(
      `Documentation available at http://localhost:${port}/docs`,
    )
  })
})
