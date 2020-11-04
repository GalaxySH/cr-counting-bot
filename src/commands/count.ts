import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "increment",
    aliases: ["count"],
    description: "set the count difference",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
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
                const increment = await client.database?.getIncrement(message.guild?.id);
                if (!increment) return;
                if (parseInt(args[0], 10) === increment.increment) {
                    message.channel.send({
                        embed: {
                            color: process.env.WARN_COLOR,
                            description: "that increment is already set"
                        }
                    });
                    return false;
                }
                const ninc = parseInt(args[0], 10);
                client.database?.setIncrement(message.guild?.id || "none", ninc);
                message.channel.send({
                    embed: {
                        color: process.env.NAVY_COLOR,
                        description: `increment set to \`${ninc}\``
                    }
                });
                return;
            }
            const ninc = Math.floor(Math.random() * 10);
            client.database?.setIncrement(message.guild?.id, ninc);
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