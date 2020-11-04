import xlg from '../xlogger';
//import fs from "fs";
import { sendError } from "../utils/messages";
//import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { TextChannel } from 'discord.js';

module.exports = {
    name: "last",
    description: "get the last person who counted",
    async execute(client: CommandClient, message: ExtMessage) {
        try {
            let count = await client.database?.getCount(message.guild?.id);
            if (!count || !count.count) count = { count: 0 };
            const cc = count.count || 0;
            const lastUpdater = await client.database?.getLastUpdater(message.guild?.id);
            if (!lastUpdater) return false;
            // check for perms
            //if (!(await checkAccess(message))) return;
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    author: {
                        name: "〈〈〈〈〈〈"
                    },
                    title: "Last",
                    description: `${message.guild?.members.cache.get(lastUpdater?.lastUpdatedID || "")}\n(with ${ cc })`
                }
            });
            return;
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}