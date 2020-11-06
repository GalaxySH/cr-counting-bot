/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment'; // require
const now = moment().format();
export = {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    log(e: any): void {
        if (e) {
            return console.log(`[${now}]`, e.stack || e);
        }
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    error(e: any): void {
        if (e) {
            return console.error(`[${now}]`, e.stack || e);
        }
    }
}
