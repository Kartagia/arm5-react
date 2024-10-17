

/**
 * The server file running the setup.
 */

import express from "express";
import 'dotenv/config';

/**
 * 
 * @template [EXCEPTION=SyntaxError] The exception thrown on failure.
 * @param {*} s The tested value.
 * @param {object} options The options of the check.
 * @param {boolean} [options.positive=false] Does the test require the value is positive. 
 * @param {boolean} [options.zero=false] Does the test require the value is zero. 
 * @param {boolean} [options.negative=false] Does the test require the value is negative.
 * @param {bigint|number|null} [options.min=null] The minimum value accepted. If absent or null, no minimum
 * is required. 
 * @param {bigint|number|null} [options.max=null] The maximum value accepted. If absent or null, no maximum
 * is required. 
 * @returns {bigint|number} THe integer value derived from s.
 * @throws {EXCEPTION} The exception thrown, if the value is not an integer.
 */
function checkInteger(s, options={}) {
    const defaultMessage = "Not an integer";
    const createException = options.createException ?? ((message, cause=undefined) => (new SyntaxError(message, cause)));
    const validator = (/** @type {number|bigint} */ value) => {
        return ((!options.positive || value > 0)  && (!options.zero || value === 0) && (!options.negative || value < 0) &&
            (options.min == null || options.min <= value) && (options.max == null || value < options.max) 
        );
    };
    switch (typeof s) {
        case "string":
            if (/^[+-]?\d+$/.test(s)) {
                var value; 
                if (s.length < Number.toString(Number.MAX_SAFE_INTEGER).length) {
                    // Normal number is enough.
                    value = Number.parseInt(s);
                } else {
                    // We need bigint.
                    value = BigInt(s);
                }
                console.debug(`Validating [${value}]`);
                if (validator(value)) {
                    return value;
                }
            }
            break;
        case "bigint":
            if (validator(s)) {
                return s;
            }
            break;
        case "number":
            if (Number.isSafeInteger(s) && validator(s)) {
                return s;
            }
        default:
    }
    throw createException(options.message ?? defaultMessage);
}

// The list of ports tested to get the server port. 
const portList = (process.env.PORT ?? process.env.ALTERNATE_PORTS)?.split(/\s+/).map( s => checkInteger(s, {message: `Invalid port number ${s}`, positive: true})) ?? [3000, 5001, 5002, 5006, 5007, 5008, 5009];

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
        dotfiles: "ignore", fallthrough: true, extensions: ['html', 'js', 'jsx', 'mjs', 'cjs'],
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