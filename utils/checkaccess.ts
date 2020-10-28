const xlg = require('../xlogger');
import { ExtMessage } from "../typings";

export = async (message: ExtMessage) => {
    if (!message.member) return;
    var config = require("../config.json");
    if (message.author.id !== config.ownerID && !message.member.permissions.has("ADMINISTRATOR")) {
        message.channel.send({
            embed: {
                color: process.env.FAIL_COLOR,
                description: `${message.member}, you do not have permission to use this command.`
            }
        }).catch(xlg.error);
        return false;
    }
    return true;
}