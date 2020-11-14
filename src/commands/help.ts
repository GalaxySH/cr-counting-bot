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
                if (!c.showInHelp) {
                    cmdMap.push(`🔹 \`${message.gprefix}${c.name}\`\n${c.description}`)
                }
            });
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Server Commands",
                    description: `Use this command any time. Use the \`${message.gprefix}howto\` command to learn how to count.\n\n__**Commands**__\n${cmdMap.join("\n")}`,
                    footer: {
                        text: `Send ${message.gprefix}howto for instructions`
                    }
                }
            });
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}