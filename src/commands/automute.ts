import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "automute",
    aliases: ["am"],
    usage: "<on/OFF>",
    args: true,
    description: "Turn the auto mute on or off",
    specialArgs: 1,
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            // check for perms
            if (!(await checkAccess(message))) return;
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