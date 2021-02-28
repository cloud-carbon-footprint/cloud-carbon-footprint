/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import express from 'express'

import { Logger } from '@cloud-carbon-footprint/core'

const authLogger = new Logger('auth')

export default async function (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
  try {
    // https://github.com/okta/okta-oidc-js/tree/master/packages/jwt-verifier
    // const accessTokenString = req.get('Authorization')
    // const verifier = new OktaJwtVerifier({
    //   issuer: process.env.OKTA_ISSUER,
    //   clientId: process.env.OKTA_CLIENT_ID,
    // })
    // const accessToken = verifier.verifyAccessToken(accessTokenString, 'api://default')
    // res.locals.userInfo = accessToken.claims
    authLogger.info('Authentication successful')
    next()
  } catch (e) {
    authLogger.error(`Authentication failed. Error: ${e.message}`, e)
    res.status(401).send('Unauthorized')
  }
}
