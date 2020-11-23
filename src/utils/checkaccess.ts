import xlg from '../xlogger';
import { ExtMessage, CheckAccessOptions } from "../typings";

export = async (message: ExtMessage, options?: CheckAccessOptions): Promise<boolean> => {
    if (!message.member) return false;
    if (options) {
        if (options.ownerOnly && message.author.id !== process.env.OWNERID) {
            if (!message.chatting) message.delete();
            await message.channel.send({
                embed: {
                    color: process.env.FAIL_COLOR,
                    description: `${message.member}, you do not have permission (botmaster) to use this command.`
                }
            }).catch(xlg.error);
            return false;
        }
        if (options.adminOnly && !message.member.permissions.has("ADMINISTRATOR")) {
            if (!message.chatting) message.delete();
            await message.channel.send({
                embed: {
                    color: process.env.FAIL_COLOR,
                    description: `${message.member}, you do not have permission (admin) to use this command.`
                }
            }).catch(xlg.error);
            return false;
        }
    }
    if (message.author.id !== process.env.OWNERID && !message.member.permissions.has("ADMINISTRATOR")) {
        if (!message.chatting) message.delete();
        await message.channel.send({
            embed: {
                color: process.env.FAIL_COLOR,
                description: `${message.member}, you do not have the permissions to use this command.`
            }
        }).catch(xlg.error);
        return false;
    }
    return true;
}