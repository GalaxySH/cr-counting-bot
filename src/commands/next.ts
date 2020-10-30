import xlg from '../xlogger';
//import fs from "fs";
import { sendError } from "../utils/messages";
//import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "next",
    aliases: ["hint"],
    description: "find the next number",
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            const config = require("../config.json");
            // check for perms
            //if (!(await checkAccess(message))) return;
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Last Sender",
                    description: `send \`${config.currentNumber + 1}\``,
                    footer: {
                        text: "or get yoinked"
                    }
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