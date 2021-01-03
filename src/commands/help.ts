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
            let hc = 0;
            const cmdMap: string[] = [];
            client.commands.forEach(c => {
                if (!c.hideInHelp) {
                    cmdMap.push(`🔹 \`${message.gprefix}${c.name} ${c.usage || "<>"}\`\n${c.description}`)
                } else {
                    hc++;
                }
            });
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "Server Commands",
                    description: `Use this command any time. Use the \`${message.gprefix}howto\` command to learn how to count.
<:join:795140993368195092> [Join the support server.](https://dsc.gg/ro)

**Commands:**
(${hc} hidden)
${cmdMap.join("\n")}

**Rules:**
• No one counts more than one number in a row.
• If the count is broken, one "save" will be removed from the guild's saves if it has any. Otherwise, the count will reset.`,
                    footer: {
                        text: `Send ${message.gprefix}howto for detailed instructions`
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