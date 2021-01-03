import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';
import { stringToRole } from "../utils/parsers";

module.exports = {
    name: "failrole",
    aliases: ["fr"],
    usage: "<role (any form) | 'none'>",
    args: true,
    specialArgs: 1,
    description: "Set the role to give someone when they reset the count",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            // check for perms
            if (!(await checkAccess(message, { adminOnly: true }))) return;
            if (!message.guild) return;

            if (args.join(" ") === "none") {
                await client.database?.setFailRole(message.guild.id, "");// set the failrole to "" to mean "none" (resetting)
                message.channel.send({
                    embed: {
                        color: process.env.NAVY_COLOR,
                        description: `The Fail Role has been reset.`
                    }
                });
                return;
            }

            const target = stringToRole(message.guild, args.join(" "));// getting role from args
            if (!target || typeof target === "string") {
                if (!(message.channel instanceof TextChannel)) return false;
                sendError(message.channel, "A valid role is required", true);
                return false;
            }

            await client.database?.setFailRole(message.guild.id, target.id);// set the id of the failrole for the guild in the db
            message.channel.send({
                embed: {
                    color: process.env.NAVY_COLOR,
                    description: `The Fail Role has been set to ${target}.\nPeople who miscount and reset the score will receive this role.`
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