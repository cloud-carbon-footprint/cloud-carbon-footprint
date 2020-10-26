/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import express from 'express'

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
    console.log('Auth successful')
    next()
  } catch (e) {
    res.status(401).send('Unauthorized')
  }
}
