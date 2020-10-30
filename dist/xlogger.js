"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const moment_1 = __importDefault(require("moment")); // require
var now = moment_1.default().format();
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
};
