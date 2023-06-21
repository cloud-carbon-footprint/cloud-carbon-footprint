/*
 * © 2021 Thoughtworks, Inc.
 */

import request from 'supertest'
import express from 'express'

import authMiddleware from '../utils/auth'

describe('authMiddleware', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(authMiddleware)
    app.get('/test', (_req, res) => {
      res.send('Hello World!')
    })
  })

  it('should call next if authentication is successful', async () => {
    const response = await request(app).get('/test')
    expect(response.status).toBe(200)
    expect(response.text).toBe('Hello World!')
  })
})
