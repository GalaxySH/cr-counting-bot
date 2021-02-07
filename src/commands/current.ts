import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { Command } from '../typings';
import { TextChannel } from 'discord.js';

export const command: Command = {
    name: "current",
    aliases: ["count", "curr", "c"],
    description: "Get the current count",
    async execute(client, message, args) {
        if (!(message.channel instanceof TextChannel)) return;
        try {
            if (args.length > 0) {
                // check for perms
                if (!(await checkAccess(message, { ownerOnly: true }))) return;
                if (/[^0-9]+/.test(args.join(" "))) {
                    sendError(message.channel, "That is not a valid number");
                    return false;
                }
                const ncount = parseInt(args.join(" "), 10);
                await client.database?.updateCount(message.guild?.id || "", ncount);
                message.channel.send(`Count set to \`${ncount}\``);
                return;
            }
            // get the current count from database
            let count = await client.database?.getCount(message.guild?.id);
            if (!count || !count.count) count = { count: 0 };
            const increment = await client.database?.getIncrement(message.guild?.id);
            if (!increment) return;
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    description: `Count: \`${count.count || 0}\`\nIncrement: \`${increment.increment || 1}\``
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            sendError(message.channel);
        }
    }
}