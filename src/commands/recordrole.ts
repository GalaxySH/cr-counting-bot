import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';
import { stringToRole } from "../utils/parsers";

module.exports = {
    name: "recordrole",
    aliases: ["rr"],
    usage: "<#role | none>",
    args: true,
    specialArgs: 1,
    description: "Set the role given to record breakers",
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            // check for perms
            if (!(await checkAccess(message, { adminOnly: true }))) return;
            if (!message.guild) return;
            
            const a = args.join(" ");
            if (a === "none") {
                await client.database?.setRecordRole(message.guild.id, "");// set the recordrole to "" to mean "none" (resetting)
                message.channel.send({
                    embed: {
                        color: process.env.NAVY_COLOR,
                        description: `Reset The Fail Role`
                    }
                });
                return;
            }

            const target = stringToRole(message.guild, a);// getting role from args
            if (!target || typeof target === "string") {
                if (!(message.channel instanceof TextChannel)) return false;
                sendError(message.channel, "A valid role is required", true);
                return false;
            }

            await client.database?.setRecordRole(message.guild.id, target.id);// set the id of the recordrole for the guild in the db
            message.channel.send({
                embed: {
                    color: process.env.NAVY_COLOR,
                    description: `The Record Role has been set to ${target}.\nPeople deemed new record breakers will receive this role, it will be removed from old record breakers.`
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