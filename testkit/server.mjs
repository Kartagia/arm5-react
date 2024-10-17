

/**
 * The server file running the setup.
 */

import express from "express";
import 'dotenv/config';


// The list of ports tested to get the server port. 
const portList = [3000, 5001, 5002, 5006, 5007, 5008, 5009];

/**
 * Get next port to try after a port failed.
 * @param {number} port The current port not available.
 * @returns {number|undefined} The next port to try.
 */
function getNextPort(port) {
    const index = portList.indexOf(port);
    if (index >= 0 && index < portList.length) {
        return portList[index+1];
    } else {
        return undefined;
    }
}

////////////////////////////////////////////////////////
// Express app.
////////////////////////////////////////////////////////

const app = express();

app.use(
    express.static("public", {
        dotfiles: "ignore", fallthrough: true, extensions: ['html', 'js', 'jsx'],
        setHeaders: function (res, path, stat) {
            res.set('x-timestamp', Date.now());
        }
    })
);

var port = process.env.PORT;
var hostname = process.env.HOSTNAME ?? "localhost";
const server = app.listen(port, hostname, () => {
    console.log(`Testkit listening on port ${server.address().port}`);
});
server.on('error', (e) => {
    console.error(`Address port ${port} in use, retrying...`);
    setTimeout(() => {
        () => {
            server.close();
            // Fetching next port. 
            if ( ( port = getNextPort(port))) {
                server.listen(port, host);
            }
        }
    }, 1000);
});