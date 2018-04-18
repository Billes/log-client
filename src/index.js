// @flow
const request = require('request-promise')

type Severity = 'CRITICAL' | 'ERROR' | 'DEBUG' | 'INFO' | 'WARNING'
type Response = { success: boolean, message?: string }
type Options = { host?: string, token?: string }

const Log = function (): mixed {
  const opts = {}

  return {
    bootstrap: (system: string, options: Options ): void => {
      if(opts.system !== undefined)
        throw new Error('Logger is already bootstrapped')
      else if(typeof system !== 'string')
        throw new Error('System must be a string')

      opts.system = system
      opts.host = options.host
      opts.token = options.token
    },

    critical: function(tags: Array<string>, message: string, data: ?mixed): Promise<Response> {
      return this._LOG('CRITICAL', tags, message, data)
    },

    error: function(tags: Array<string>, message: string, data: ?mixed): Promise<Response> {
      return this._LOG('ERROR', tags, message, data)
    },

    debug: function(tags: Array<string>, message: string, data: ?mixed): Promise<Response> {
      return this._LOG('DEBUG', tags, message, data)
    },

    info: function(tags: Array<string>, message: string, data: ?mixed): Promise<Response> {
      return this._LOG('INFO', tags, message, data)
    },

    warning: function(tags: Array<string>, message: string, data: ?mixed): Promise<Response> {
      return this._LOG('WARNING', tags, message, data)
    },

    _LOG: function (severity: Severity, tags: Array<string>, message: string, data: ?mixed): Promise<Response> {
      if(opts.system === undefined) throw new Error('You need to run bootstrap function first')
      if(opts.host)
        return this._POST(severity, [opts.system, ...tags], message, data)

      return this._WRITE_LOCAL_LOG(severity, [opts.system, ...tags], message)
    },

    _POST: function (severity: Severity, tags: Array<string>, message: string, data: mixed): Promise<Response> {
      return request({
        method: 'POST',
        uri: opts.host,
        body: { severity, tags, message, data, 'billes-log-token': opts.token },
        json: true
      })
    },

    _WRITE_LOCAL_LOG: function (severity: Severity, tags: Array<string>, message: string): Promise<Response> {
      const date = new Date()
      const readableDate = `${date.toISOString().substr(0, 10)} ${date.toTimeString().substr(0, 8)}`
      console.log(
        `${readableDate} ${severity} - [${
        Array.isArray(tags) ? tags.join(', ') : tags
      }] - ${message}`
      )

      return Promise.resolve({ success: true })
    }
  }
}

Log.prototype.Log = Log

module.exports = Log()
