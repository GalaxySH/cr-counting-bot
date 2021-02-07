import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import { Command } from '../typings';
import { TextChannel } from 'discord.js';
import { stringToMember } from '../utils/parsers';

export const command: Command = {
    name: "me",
    description: "View information about yourself or another user",
    usage: "[member]",
    async execute(client, message, args) {
        try {
            if (!(message.channel instanceof TextChannel) || !message.guild) return;
            const target = (await stringToMember(message.guild, args.join(" "), true, true, true)) || message.member;
            if (!target) {// logically this will never be true
                sendError(message.channel, "No target found");
                return;
            }
            const player = await client.database?.getPlayerData(target.id);
            if (!player) {
                sendError(message.channel, "No player data found.\nMaybe you should count some.");
                return;
            }
            const tmute = await client.database?.getMute(message.guild.id, target.user.id);
            const mute = !tmute || !tmute.muteTime ? false : true;
            const gplayer = await client.database?.getGuildPlayer(message.guild.id, target.id);
            if (!gplayer) {
                sendError(message.channel, "No guild player data found.\nMaybe you should count some.");
                return;
            }

            // CHECK TO MAKE SURE THAT A CHANNEL IS SET, ABORT AND SET EMBED IF THERE ISN"T ONE

            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    author: {
                        name: target.user.tag,
                        iconURL: target.user.displayAvatarURL()
                    },
                    title: "User Profile",
                    description: `${target.nickname ? `(${target.nickname})\n` : ""}
**Total Counts:** ${player.counts}
**Total Counts Here:** ${gplayer.totalCounts}
**Highest Number Here:** ${gplayer.highestNumber}
**Errors Here:** ${gplayer.errors}
**Saves:** ${player.saves}/3
**Muted:** ${mute}
**Banned:** ${player.banned}`
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