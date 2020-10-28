import moment from 'moment'; // require
var now = moment().format();
module.exports = {
    log(e: any) {
        if (e) {
            return console.log(`[${now}]`, e.stack || e);
        }
    },
    error(e: any) {
        if (e) {
            return console.error(`[${now}]`, e.stack || e);
        }
    }
}
