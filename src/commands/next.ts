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
            let count = await client.database?.getCount(message.guild?.id);
            if (!count || !count.count) count = { count: 0 };
            const cc = count.count || 0;
            const increment = await client.database?.getIncrement(message.guild?.id);
            if (!increment) return;
            const incre = increment.increment || 1;
            // check for perms
            //if (!(await checkAccess(message))) return;

            // CHECK TO MAKE SURE THAT A CHANNEL IS SET, ABORT AND SET EMBED IF THERE ISN"T ONE
            
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    author: {
                        name: "〉〉〉〉〉〉"
                    },
                    title: "Next",
                    description: `send \`${cc + incre}\``,
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