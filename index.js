const http = require('http')
const config = require('./utils/config')
const app = require('./app')
const logger = require('./utils/logger')

const server = http.createServer(app)
server.listen(config.PORT, () => {
  logger.info(`Express server running on port ${config.PORT}`)
})