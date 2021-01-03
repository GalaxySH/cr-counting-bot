import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';
import moment from 'moment';
import { getFriendlyUptime } from '../utils/time';
import { stringToMember } from '../utils/parsers';

module.exports = {
    name: "mutestatus",
    aliases: ["ms"],
    description: "Get information about a current mute",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        if (!(message.channel instanceof TextChannel) || !message.guild) return;
        try {
            const target = (await stringToMember(message.guild, args.join(" "), true, true, true)) || message.member;
            if (!target) {// logically this will never be true
                sendError(message.channel, "Invalid target");
                return;
            }
            const mute = await client.database?.getMute(message.guild.id, target.user.id);
            if (!mute || !mute.muteTime) {
                sendError(message.channel, `${target} is not muted (by me)`);
                return;
            }
            if (!target) {
                sendError(message.channel, "Invalid member to look up");
                return;
            }
            const mtdur = moment.duration(moment().diff(moment(mute.muteTime)));
            const fd = getFriendlyUptime(mtdur.asMilliseconds());//unused for now
            if (!mtdur || !fd) return;

            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    description: `**Mute Info For:**
${target}

**Mute Time Remaining:**
${fd.hours + (fd.days * 24)} hrs, ${fd.minutes} min, ${fd.seconds} sec`
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            sendError(message.channel);
        }
    }
}