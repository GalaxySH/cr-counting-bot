import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { Command } from '../typings';
import { TextChannel } from 'discord.js';
import { durationToString, stringToMember } from '../utils/parsers';
import { stringToDuration } from '../utils/time';
import moment from 'moment';

export const command: Command = {
    name: "mute",
    aliases: ["mute"],
    description: "Adjust the length of an existing mute or create a new one",
    usage: "<@member> [length]",
    //specialArgs: 2,
    args: true,
    async execute(client, message, args) {
        if (!(message.channel instanceof TextChannel)) return;
        try {
            // check for perms
            if (!(await checkAccess(message, { adminOnly: true }))) return;
            if (!message.guild || message.channel.type !== "text") return;
            const ccid = await client.database.getChannel(message.guild.id);
            if (!ccid) {
                sendError(message.channel, `The counting channel has not been set. Please set it in order for me to mute this person.`);
                return;
            }
            const chan = message.guild.channels.cache.get(ccid);
            if (!chan || !chan.id) {
                sendError(message.channel, "The counting channel does not seem to exist");
                return;
            }

            const target = await stringToMember(message.guild, args[0], false, false, false);
            if (!target || !target.guild) {
                sendError(message.channel, "Could not find user. You must specify a user mention or ID.");
                return;
            }

            await chan.updateOverwrite(target, { "SEND_MESSAGES": false }, `${message.author.tag} manually setting mute of ${target.user.tag}`);

            //let mendm = "";// Taken from GreenMesa
            let time = 0;
            let dur = "";

            if (args[1]) {
                time = stringToDuration(args[1]);
            }

            if (time) {
                dur = durationToString(time);
                //mendm = ` for ${dur}.`;
            }

            const aimDate = moment(new Date()).add(time, "milliseconds").toDate();

            const mu = await client.database.getMute(message.guild.id, target.id);
            if (mu) {
                if (!time && client.sendInfo) {
                    //client.sendWarn(message.channel, `${target} is already muted, and you did not adjust the length.`);
                    await client.database.setMemberMute(message.guild.id, target.id, moment(new Date()).add(5, "years").toDate())
                    client.sendInfo(message.channel, `Adjusted the mute of ${target} (${target.id}) to **5 years**.`);
                } else if (client.sendInfo) {
                    await client.database.setMemberMute(message.guild.id, target.id, aimDate);
                    client.sendInfo(message.channel, `Adjusted the mute of ${target} (${target.id}) to ${dur}.`);
                }
            } else {
                if (!time) {
                    await client.database.setMemberMute(message.guild.id, target.id, moment(new Date()).add(5, "years").toDate())
                    if (client.sendInfo) {
                        client.sendInfo(message.channel, `Muted ${target} (${target.id}) for **5 years**.`);
                    }
                } else {
                    await client.database.setMemberMute(message.guild.id, target.id, aimDate);
                    if (client.sendInfo) {
                        client.sendInfo(message.channel, `Muted ${target} (${target.id}) for ${dur}.`);
                    }
                }
            }

            return;
        } catch (error) {
            xlg.error(error);
            sendError(message.channel, "There was an error, I may not have management permissions.");
            return false;
        }
    }
}