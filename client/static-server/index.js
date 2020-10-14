const { ExpressOIDC } = require('@okta/oidc-middleware')
const express = require('express')
require('dotenv').config()

const app = express()

app.use(express.static('build'))

app.use(
  require('express-session')({
    secret: process.env.APP_SECRET,
    resave: true,
    saveUninitialized: false,
  }),
)

const oidc = new ExpressOIDC({
  appBaseUrl: process.env.HOST_URL,
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  redirect_uri: `${process.env.HOST_URL}/callback`,
  scope: 'openid profile',
  routes: {
    loginCallback: {
      path: '/callback',
    },
  },
})

app.use(oidc.router)
// https://developer.okta.com/docs/guides/sign-into-web-app/nodeexpress/require-authentication/
// app.all('*', oidc.ensureAuthenticated());

const port = process.env.PORT || 8080

oidc.on('ready', () => {
  app.listen(port, () => console.log(`Cloud Carbon Footprint Server listening at http://localhost:${port}`))
})
oidc.on('error', () => {
  // An error occurred while setting up OIDC, during token revokation, or during post-logout handling
})

module.exports = app
