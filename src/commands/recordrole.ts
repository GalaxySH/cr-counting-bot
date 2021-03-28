import xlg from '../xlogger';
import { sendError, sendInfo, sendWarn } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { Command } from '../typings';
import { stringToRole } from "../utils/parsers";

export const command: Command = {
    name: "recordrole",
    aliases: ["rr"],
    usage: "<#role | none>",
    // args: true,
    // specialArgs: 1,
    description: "Set the role given to record breakers",
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message, { adminOnly: true }))) return;
            if (!message.guild) return;

            if (!args.length) {
                const recordRoleID = await client.database.getRecordRole(message.guild.id);
                if (recordRoleID && recordRoleID.length === 18) {
                    const recordRole = message.guild.roles.cache.get(recordRoleID);
                    if (recordRole) {
                        sendInfo(message.channel, `The current record role is ${recordRole}`);
                        return;
                    }
                }
                sendWarn(message.channel, `No record role is set`);
                return;
            }
            
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
                sendError(message.channel, "A valid role is required", true);
                return false;
            }

            await client.database.setRecordRole(message.guild.id, target.id);// set the id of the recordrole for the guild in the db
            message.channel.send({
                embed: {
                    color: process.env.NAVY_COLOR,
                    description: `The Record Role has been set to ${target}.\nPeople deemed new record breakers will receive this role, it will be removed from old record breakers.`
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            sendError(message.channel);
            return false;
        }
    }
}