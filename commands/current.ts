import * as xlg from '../xlogger';
import fs from "fs";
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';

module.exports = {
    name: "current",
    aliases: ["count"],
    description: "get the current count",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            const config = require("../config.json");
            
            if (args.length === 1) {
                // check for perms
                if (!(await checkAccess(message))) return;
                if (/[^0-9]+/.test(args[0])) {
                    message.channel.send({
                        embed: {
                            color: process.env.FAIL_COLOR,
                            description: "that is not a valid number"
                        }
                    });
                    return false;
                }
                let ncount = parseInt(args[0], 10);
                config.currentNumber = ncount;
                fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
                    if (err) return console.log(err);
                });
                message.channel.send({
                    embed: {
                        color: process.env.NAVY_COLOR,
                        description: `count set to \`${ncount}\``
                    }
                });
                return;
            }
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Current",
                    description: `the count is \`${config.currentNumber}\`\nthe increment is \`${config.increment}\``
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            sendError(message.channel);
        }
    }
}