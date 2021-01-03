import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';
import { stringToChannel } from "../utils/parsers";

module.exports = {
    name: "channel",
    aliases: ["countchannel"],
    description: "set the counting channel to the current channel",
    usage: "[#channel]",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            // check for perms
            if (!(await checkAccess(message))) return;
            if (!message.guild) return;
            const targetChannel = stringToChannel(message.guild, args.join(" ")) || message.channel;
            if (!targetChannel) {
                message.channel.send({
                    embed: {
                        color: process.env.FAIL_COLOR,
                        title: "Error",
                        description: "Invalid Channel"
                    }
                });
                return false;
            }
            // setting counting channel in database
            await client.database?.setChannel(message.guild.id, targetChannel.id);
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    description: (targetChannel.id === message.channel.id) ? `The current channel has been set as the counting channel` : `counting channel set to ${targetChannel}`
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