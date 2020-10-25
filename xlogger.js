const moment = require('moment'); // require
var now = moment().format();
module.exports = {
    log(e) {
        if (e) {
            return console.log(`[${now}]`, e.stack || e);
        }
    },
    error(e) {
        if (e) {
            return console.error(`[${now}]`, e.stack || e);
        }
    }
}
