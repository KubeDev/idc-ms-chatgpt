const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const { autometrics, init } = require("@autometrics/autometrics");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");

const exporter = new PrometheusExporter();
init({ exporter });

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname } = parsedUrl
      await autometrics({functionName: pathname}, async () => {
        await handle(req, res, parsedUrl)  
      })();
      //await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})