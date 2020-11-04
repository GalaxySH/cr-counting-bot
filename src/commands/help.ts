import xlg from '../xlogger';
//import * as config from '../config.json';
import { CommandClient, ExtMessage } from '../typings';
import { sendError } from "../utils/messages";
import { TextChannel } from 'discord.js';

module.exports = {
    name: "help",
    description: "stop, get help",
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            if (!client.commands) return;
            const cmdMap: string[] = [];
            client.commands.forEach(c => {
                cmdMap.push(`🔹 \`${process.env.PREFIX}${c.name}\`\n${c.description}`)
            })
            message.channel.send({
                embed: {
                    color: process.env.NAVY_COLOR,
                    title: "Server Commands",
                    description: cmdMap.join("\n")
                }
            }).catch(xlg.error);
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}