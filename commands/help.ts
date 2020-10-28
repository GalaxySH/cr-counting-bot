import xlg from '../xlogger';
//import * as config from '../config.json';
import { CommandClient, ExtMessage } from '../typings';
const { sendError } = require("../utils/messages");

module.exports = {
    name: "help",
    description: "stop, get help",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            if (!client.commands) return;
            var cmdMap: string[] = [];
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
            sendError(message.channel);
        }
    }
}