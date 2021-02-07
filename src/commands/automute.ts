import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { Command } from '../typings';
import { TextChannel } from 'discord.js';

export const command: Command = {
    name: "automute",
    aliases: ["am"],
    usage: "<on/OFF>",
    args: true,
    description: "Turn the auto mute on or off",
    specialArgs: 1,
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message, { adminOnly: true }))) return;
            if (!message.guild) return;
            const a = args.join(" ").toLowerCase();
            if (a !== "on" && a !== "off") {
                message.channel.send({
                    embed: {
                        color: process.env.FAIL_COLOR,
                        title: "Error",
                        description: "`on` or `off` required"
                    }
                });
                return false;
            }
            const state = (a === "on");
            await client.database?.setAutoMuting(message.guild.id, state);// set desired autoMuting state
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    description: `Auto Muting **${state ? "enabled" : "disabled"}**`
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