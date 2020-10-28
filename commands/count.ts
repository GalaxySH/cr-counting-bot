import xlg from '../xlogger';
import fs from "fs";
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "count",
    aliases: ["increment"],
    description: "set the count difference",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            const config = require("../config.json");
            // check for perms
            if (!(await checkAccess(message))) return;

            if (args.length > 0 && args.length < 2) {
                if (/[^0-9]+/.test(args[0])) {
                    message.channel.send({
                        embed: {
                            color: process.env.FAIL_COLOR,
                            description: "that is not a valid number"
                        }
                    });
                    return false;
                }
                if (parseInt(args[0], 10) === config.increment) {
                    message.channel.send({
                        embed: {
                            color: process.env.WARN_COLOR,
                            description: "that increment is already set"
                        }
                    });
                    return false;
                }
                let ninc = parseInt(args[0], 10);
                config.increment = ninc;
                fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
                    if (err) return console.log(err);
                });
                message.channel.send({
                    embed: {
                        color: process.env.NAVY_COLOR,
                        description: `increment set to \`${ninc}\``
                    }
                });
                return;
            }
            let ninc = Math.floor(Math.random() * 10);
            config.increment = ninc;
            fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
                if (err) return console.log(err);
            });
            message.channel.send({
                embed: {
                    color: process.env.NAVY_COLOR,
                    description: `increment set to \`${ninc}\``
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}