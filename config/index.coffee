path = require 'path'

name = 'multilatex'
app = '/opt/' + name

module.exports = do ->
  config =
    cookieSecret: 'default secret'
    mongoUrl: 'mongodb://localhost:27017/' + name
    mongoDbName: name
    port: process.env.PORT || 3000
    username: name
    dirs:
      app: app
      store: app + '/store'
      heads: app + '/heads'
      tmp: app + '/tmp'
      upload: app + '/upload'
    debug: true
    avatarSize: 253
    logger: ':date :remote-addr :method :url :status :response-time'
    fileLimit: 1024 * 1024
    thumbSize: 360

  try
    secretConfig = require path.resolve __dirname + '/secret'
    secretConfig config
  catch
    console.warn 'You should use a secret.'

  config
