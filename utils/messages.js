"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = void 0;
function sendError(channel) {
    return channel.send({
        embed: {
            color: 16711680,
            description: "Something went wrong. ¯\\_(ツ)_/¯"
        }
    }).catch(console.error);
}
exports.sendError = sendError;
