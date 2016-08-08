const debug = require('debug')('five')

module.exports = function handleRequest (req, res, routeList, routers) {
  let _count = 0
  let _len = routeList.length
  const mw = routeList[_count]
  setImmediate(() => mw(req, res, next))
  debug(`Method: ${req.method} URL: ${req.url} Route stack: ${_count}/${_len}`)

  function next (err) {
    ++_count
    debug(`Method: ${req.method} URL: ${req.url} Route stack: ${_count}/${_len}`)
    if (err) {
      return res.err(500)
    }

    if (_count < _len) {
      const mw = routeList[_count]
      return setImmediate(() => mw(req, res, next))
    } else if (routers) {
      try {
        const method = req.method.toLowerCase()
        const url = req.url.split('?')[0]
        const router = routers.get(method)
        router(url, req, res, next)
      } catch (err) {
        debug('Route list exhausted, no matching route')
        return res.err(404)
      }
    } else {
      if (!res.finished) {
        res.end()
      }
    }
  }
}
