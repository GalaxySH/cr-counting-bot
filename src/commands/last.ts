import xlg from '../xlogger';
//import fs from "fs";
import { sendError } from "../utils/messages";
//import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "last",
    description: "get the last person who counted",
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            const config = require("../config.json");
            // check for perms
            //if (!(await checkAccess(message))) return;
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Last Sender",
                    description: `${message.guild?.members.cache.get(config.lastUpdatedId)}`,
                    footer: {
                        text: `${config.currentNumber}`
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