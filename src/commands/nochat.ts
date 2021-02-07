import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { Command, CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

export const command: Command = {
    name: "nochat",
    usage: "<true/FALSE>",
    args: true,
    description: "Set whether chatting is allowed in the channel",
    specialArgs: 1,
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            // check for perms
            if (!(await checkAccess(message))) return;
            if (!message.guild) return;
            if (args.join(" ") !== "true" && args.join(" ") !== "false") {
                message.channel.send({
                    embed: {
                        color: process.env.FAIL_COLOR,
                        title: "Error",
                        description: "`true` or `false` required"
                    }
                });
                return false;
            }
            const state = (args[0] !== "true");
            await client.database?.setChatAllowed(message.guild.id, state);// set desired chatAllowed state
            const countChannel = await client.database?.getChannel(message.guild?.id);// get counting channel id
            if (!countChannel) return false;// IF A COUNT CHANNEL IS NOT FOUND
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    description: `**${state ? "Allowed" : "Disallowed"}** Chatting In ${message.guild.channels.cache.get(countChannel.countChannel || "")}`
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
            return false;
        }
    }
}