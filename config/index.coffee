path = require 'path'

name = 'multilatex'
workDirs = '/opt/multilatex-work-dirs'

module.exports = do ->
  config =
    cookieSecret: 'default secret'
    mongoUrl: 'mongodb://localhost:27017/' + name
    mongoDbName: name
    port: process.env.PORT || 3000
    username: name
    dirs:
      app: '/opt/' + name
      store: workDirs + '/store'
      heads: workDirs + '/heads'
      tmp: workDirs + '/tmp'
      upload: workDirs + '/upload'
    debug: true
    avatarSize: 253
    logger: ':date :remote-addr :method :url :status :response-time'
    fileLimit: 1024 * 1024
    thumbSize: 360
    devServer: '10.10.10.11'
    #devServer: '5.101.103.84'

  try
    secretConfig = require path.resolve __dirname + '/secret'
    secretConfig config
  catch
    console.warn 'You should use a secret.'

  config
