import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "cleanmutes",
    aliases: ["cm"],
    specialArgs: 0,
    description: "clear all muting permissions from the counting channel",
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            // check for perms
            if (!(await checkAccess(message))) return;
            if (!message.guild || message.channel.type !== "text") return;

            message.channel.permissionOverwrites.forEach(o => {
                o.update({
                    "SEND_MESSAGES": null
                }, "clearing all mutes by moderator action");
            });
            await client.database?.clearMemberMutes(message.guild.id);

            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    description: `all mutes cleared`
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