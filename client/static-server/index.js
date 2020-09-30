const express = require('express')

const app = express()

app.use(express.static('build'))

const port = process.env.PORT || 8080

module.exports = app.listen(port, () => 'Serving static files')