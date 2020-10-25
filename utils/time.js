const timeUnits = { second: 1000 };
timeUnits.minute = timeUnits.second * 60;
timeUnits.hour = timeUnits.minute * 60;
timeUnits.day = timeUnits.hour * 24;
timeUnits.normalMonth = timeUnits.day * 30;

/**
 * calculates and returns an object of time units that represent the distributed value of the provided duration
 * @param {number} msAlive duration in milliseconds
 * @param {boolean} leadingzero whether times should have leading zeroes
 */
function getFriendlyUptime(msAlive = 0, leadingzero = false) {
    msAlive = Math.abs(msAlive);
    let days = Math.floor(msAlive / timeUnits.day);
    let hours = Math.floor(msAlive / timeUnits.hour) % 24;
    let minutes = Math.floor(msAlive / timeUnits.minute) % 60;
    let seconds = Math.floor(msAlive / timeUnits.second) % 60;
    let milliseconds = msAlive % 1000;
    if (leadingzero) {
        if (days < 10) {
            days = "00" + days;
        } else if (days < 100) {
            days = "0" + days;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
    }
    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds
    };
}

/**
 * This function gets the rounded day difference between two timestamps using getDurationDiff.
 *
 * @export
 * @param {number} timestamp0 first timestamp
 * @param {number} timestamp1 second timestamp
 * @returns
 */
function getDayDiff(timestamp0, timestamp1) {
    return Math.round(getDurationDiff(timestamp0, timestamp1, timeUnits.day));
}

/**
 * This function returns how many times a specified duration fits into a time frame.
 *
 * @param {number} timestamp0 first timestamp
 * @param {number} timestamp1 second timestamp
 * @param {(number | timeUnits)} duration duration of time
 * @returns
 */
function getDurationDiff(timestamp0, timestamp1, duration) {
    return Math.abs(timestamp0 - timestamp1) / duration;
}

/**
 * converts string into milliseconds. Syntax:
 * - Ns = N seconds
 * - Nm = N minutes
 * - Nh = N hours
 * - Nd = N days
 *
 * @export
 * @param {string} text input text
 * @returns
 */
function stringToDuration(text) {
    let ms = 0;
    let seconds = /(\d+)s/.exec(text);
    if (seconds) ms += Number(seconds[1]) * timeUnits.second;
    let minutes = /(\d+)m/.exec(text);
    if (minutes) ms += Number(minutes[1]) * timeUnits.minute;
    let hours = /(\d+)h/.exec(text);
    if (hours) ms += Number(hours[1]) * timeUnits.hour;
    let days = /(\d+)d/.exec(text);
    if (days) ms += Number(days[1]) * timeUnits.day;

    return ms;
}

exports.timeUnits = timeUnits;
exports.getFriendlyUptime = getFriendlyUptime;
exports.getDayDiff = getDayDiff;
exports.getDurationDiff = getDurationDiff;
exports.stringToDuration = stringToDuration;
