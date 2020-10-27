import * as xlg from '../xlogger';
import * as config from '../config.json';
import { CommandClient, ExtMessage } from '../typings';
const { sendError } = require("../utils/messages");

module.exports = {
    name: "help",
    description: "stop, get help",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            var cmdMap = [];
            client.commands.forEach(c => {
                cmdMap.push(`🔹 \`${config.prefix}${c.name}\`\n${c.description}`)
            })
            message.channel.send({
                embed: {
                    color: config.navy_color,
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