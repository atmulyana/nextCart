const {createServer: httpsServer} = require("https");
const {createServer: httpServer} = require("http");
const {parse} = require("url");
const next = require("next");
const {readFileSync} = require('node:fs');
const cfg = require('./src/config/usable-on-client.json');
const baseUrl = new URL(cfg.baseUrl);
baseUrl.protocol = 'https:';
const DEFAULT_PORT = 443;

const port = parseInt(baseUrl.port, 10) || DEFAULT_PORT;
const dev = process.env.NODE_ENV != "production";
const app = next({dev, dir: __dirname});
const handle = app.getRequestHandler();

const options = {
    key: readFileSync(`${__dirname}/certificates/localhost.key`),
    cert: readFileSync(`${__dirname}/certificates/localhost.crt`),
};

function isFromMobile(headers) {
    return headers['x-requested-with'] == 'expressCartMobile';
}

app.prepare().then(() => {
    httpsServer(options, (req, res) => {
        const fromMobile = isFromMobile(req.headers);
        const url = new URL(`https://${req.headers.host || baseUrl.host}${req.url}`)
        if (!fromMobile && url.host != baseUrl.host || url.pathname == '/' && baseUrl.pathname != '/') {
            if (!fromMobile) url.host = baseUrl.host;
            url.pathname = baseUrl.pathname;
            res.writeHead(308, {
                Location: url.href,
            }).end();
        }
        else {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        }
    })
    .listen(port)
    .once('error', function(err) {
        if (err.code == 'EACCES') {
            console.error('\x1b[31mCannot start HTTPS server\x1b[0m')
            console.error(`\x1b[31m >>> Port ${port} may be in use <<< \x1b[0m`);
        }
    })
    .once('listening', function() {
        console.log(
            `\x1b[32m\u2714\x1b[0m  Server listening at https://${baseUrl.host} as ${
                dev ? "development" : process.env.NODE_ENV
            }`,
        );
    });

    process.env.BASE_URL = baseUrl.toString();
});

if (port == DEFAULT_PORT) {
    httpServer((req, res) => {
        //Automatically redirects from http to https
        res.writeHead(308, {
            Location: `https://${isFromMobile(req.headers) ? req.headers.host : baseUrl.host}${req.url}`,
        }).end();
    })
    .listen(80)
    .once('error', function(err) {
        if (err.code == 'EACCES')
            console.error('\x1b[31m >>> Port 80 may be in use <<< \x1b[0m');
    });
}