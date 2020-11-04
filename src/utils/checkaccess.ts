import xlg from '../xlogger';
import { ExtMessage } from "../typings";

export = async (message: ExtMessage): Promise<boolean> => {
    if (!message.member) return false;
    if (message.author.id !== process.env.OWNERID && !message.member.permissions.has("ADMINISTRATOR")) {
        await message.channel.send({
            embed: {
                color: process.env.FAIL_COLOR,
                description: `${message.member}, you do not have permission (admin) to use this command.`
            }
        }).catch(xlg.error);
        return false;
    }
    return true;
}