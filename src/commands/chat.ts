import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "chat",
    aliases: ["chatallowed"],
    usage: "<true/false(default)>",
    args: true,
    description: "set whether chatting is allowed in the channel",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            // check for perms
            if (!(await checkAccess(message))) return;
            if (!message.guild) return;
            if (args[0] !== "true" && args[0] !== "false") {
                message.channel.send({
                    embed: {
                        color: process.env.FAIL_COLOR,
                        title: "Error",
                        description: "`true` or `false` required"
                    }
                });
                return false;
            }
            const state = (args[0] === "true");
            await client.database?.setChatAllowed(message.guild.id, state);// set desired chatAllowed state
            const countChannel = await client.database?.getChannel(message.guild?.id);// get counting channel id
            if (!countChannel) return false;// IF A COUNT CHANNEL IS NOT FOUND
            message.channel.send({
                embed: {
                    color: process.env.NAVY_COLOR,
                    description: `**${state ? "allowed" : "disallowed"}** chatting in ${message.guild.channels.cache.get(countChannel.countChannel || "")}`
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