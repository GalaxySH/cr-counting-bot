import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';
//import { stringToChannel } from '../utils/parsers';

module.exports = {
    name: "cleanmutes",
    aliases: ["cm"],
    specialArgs: 0,
    description: "Clear all existing mutes from the counting channel",
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            // check for perms
            if (!(await checkAccess(message))) return;
            if (!message.guild || message.channel.type !== "text") return;
            const ccid = await client.database?.getChannel(message.guild.id);
            if (!ccid || !ccid.countChannel) return;
            const chan = message.guild.channels.cache.get(ccid.countChannel);
            if (!chan || !chan.id) return;

            chan.permissionOverwrites.filter(x => x.type === "member").forEach(o => {
                o.update({
                    "SEND_MESSAGES": null
                }, "clearing all mutes by moderator action");
            });
            await client.database?.clearMemberMutes(message.guild.id);

            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    description: `All Mutes Cleared`
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