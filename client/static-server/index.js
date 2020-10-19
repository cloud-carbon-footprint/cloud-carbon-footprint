const { ExpressOIDC } = require('@okta/oidc-middleware')
const express = require('express')
const session = require('express-session')
require('dotenv').config()

const port = process.env.PORT || 8080
const app = express()

const oidc = new ExpressOIDC({
  appBaseUrl: process.env.HOST_URL,
  issuer: `${process.env.OKTA_ORG_URL}`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
  scope: 'openid profile',
})

app.use(
  session({
    secret: process.env.APP_SECRET,
    resave: true,
    saveUninitialized: false,
  }),
)

app.use(oidc.router)

app.use(oidc.ensureAuthenticated(), (req, res, next) => {
  next()
})

app.use(express.static('build'))

oidc.on('ready', () => {
  app.listen(port, () => console.log(`Cloud Carbon Footprint Server listening at http://localhost:${port}`))
})

oidc.on('error', (err) => {
  // An error occurred while setting up OIDC, during token revokation, or during post-logout handling
  console.log('An error occurred', err)
})

module.exports = app
