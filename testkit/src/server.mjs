
import path from "path";
import express from "express";
import { log, error } from "console";

const host = {
    port: 3000,
    hostname: "localhost",
    /**
     * The host port candidates.
     * @type {number[]}
     */
    ports: [0]
};

if (process.env.PORT) {
    host.port = Number(process.env.PORT);
    if (Number.isNaN(host.port)) {
        error(`Invalid environment: PORT is not a number`);
    } else {
        log(`Setting port from environment to ${host.port}`);
    }
}
if (process.env.HOSTNAME) {
    host.hostname = process.env.HOSTNAME;
    log(`Setting hostname from enviroment to ${host.hostname}`);
}


/**
 * The test server using express.
 */
const app = express();
const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['html', 'htm', 'css', 'js', 'mjs'],
    index: false,
    rediret: false,
    setHeaders (res, path, stat) {
        res.set('x-timestamp', Date.now())
    }
};
app.use(express.static("..", options));

const server = app.listen(host.port, host.hostname);
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        if (host.ports.length > 0 && (host.portIndex == null || host.portIndex < host.ports.length-1)) {
            error('Address in use, retrying on next port candidate...');
            host.portIndex = (hostPortIndex == null ? 0 : host.portIndex+1);
            server.close();
            server.listen(host.ports[host.portIndex], host.hostname);
        } else {
            error('Address in use. Exiting...');
        }
    }
});
server.on('connect', () => {
    log(`Server running on ${server.address.hostname || server.address.address} port ${server.address.port}`);
})