import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { Command } from '../typings';
import { TextChannel } from 'discord.js';
import { stringToMember } from '../utils/parsers';
//import { stringToChannel } from '../utils/parsers';

export const command: Command = {
    name: "cleanmutes",
    aliases: ["cm", "clearmutes"],
    description: "Clear all existing mutes from the counting channel",
    usage: "[user id to unmute]",
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message, { adminOnly: true }))) return;
            if (!message.guild || message.channel.type !== "text") return;
            const ccid = await client.database?.getChannel(message.guild.id);
            if (!ccid || !ccid.countChannel) return;
            const chan = message.guild.channels.cache.get(ccid.countChannel);
            if (!chan || !chan.id) {
                sendError(message.channel, "The counting channel does not seem to exist");
                return;
            }
            
            if (args.length) {
                const target = await stringToMember(message.guild, args[0], false, false, false);
                if (!target || !target.guild) {
                    sendError(message.channel, "Could not find user. You must specify a user mention or ID.");
                    return;
                }

                await client.database?.unsetMemberMute(message.guild.id, target.id);
                const o = chan.permissionOverwrites.find(x => x.type === "member" && x.id === target.id);
                if (o && !o.allow.has("SEND_MESSAGES")) {
                    await o.delete(`manually unmuting ${target.user.tag}`);
                }

                message.channel.send(`:white_check_mark: Unmuted ${target.user.tag}`)
                return;
            }

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