import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';
import { stringToChannel } from "../utils/parsers";

module.exports = {
    name: "cmdchannel",
    description: "Set the channel that commands will be allowed in",
    usage: "[#channel | 'reset']",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            // check for perms
            if (!(await checkAccess(message))) return;
            if (!message.guild) return;
            if (args.length === 1 && args[0] === "reset") {
                // setting counting channel in database
                await client.database?.setCommandChannel(message.guild.id, "");
                message.channel.send({
                    embed: {
                        color: process.env.INFO_COLOR,
                        description: "The command channel setting has been reset, commands can be executed anywhere"
                    }
                });
                return true;
            } else {
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
                await client.database?.setCommandChannel(message.guild.id, targetChannel.id);
                message.channel.send({
                    embed: {
                        color: process.env.INFO_COLOR,
                        description: (targetChannel.id === message.channel.id) ? `The current channel has been set as the command channel` : `Command channel set to ${targetChannel}`
                    }
                });
            }
            return true;
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
            return false;
        }
    }
}