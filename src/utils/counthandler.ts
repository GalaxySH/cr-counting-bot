import { CommandClient, ExtMessage } from "../typings";
import xlg from "../xlogger";
//import fs from "fs";

export = async (client: CommandClient, message: ExtMessage): Promise<boolean> => {
    try {
        const countChannel = await client.database?.getChannel(message.guild?.id);
        if (!countChannel) return false;// IF A COUNT CHANNEL IS NOT FOUND
        if (message.channel.id !== countChannel?.countChannel) return false;
    
        const chatting = await client.database?.getChatAllowed(message.guild?.id);
        if (!chatting) return false;
        if (!parseInt(message.content, 10) || /[^0-9]+/.test(message.content)) {
            if (!message.gprefix || !client.commands) return false;
            const args = message.content.slice(message.gprefix.length).trim().split(/ +/g)
            const commandName = args.shift()?.toLowerCase()
            if (!commandName) return false;
            const command = client.commands.get(commandName) ||
                client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
            if (command) return false;
            if (!chatting?.chatAllowed) message.delete();
            return true;
        }
        //const rmsgs = await message.channel.messages.fetch({ limit: 2 });
        let count = await client.database?.getCount(message.guild?.id);
        if (!count || !count.count) count = { count: 0 };
        const increment = await client.database?.getIncrement(message.guild?.id);
        if (!increment) return false;
        const cc = count.count || 0;
        const incre = increment.increment || 1;
        //if (parseInt(message.content, 10) !== parseInt((rmsgs.array())[1].content, 10) + 1) {
        if (parseInt(message.content, 10) !== cc + incre) {
            message.react("❌");
            await client.database?.setLastUpdater(message.guild?.id || "", "");// reset lastUpdater for a new count (anyone can send)
            await client.database?.updateCount(message.guild?.id || "", 0);// reset the count
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "❌ wrong number",
                    description: `***count reset to 0***\nthe increment is ${incre}`,
                    footer: {
                        text: "idiot"
                    }
                }
            })
            return true;
        }
    
        const lastUpdater = await client.database?.getLastUpdater(message.guild?.id);
        if (!lastUpdater) return false;
        if (lastUpdater.lastUpdatedID === message.author.id) {
            message.react("❌");
            await client.database?.setLastUpdater(message.guild?.id || "", "");// reset lastUpdater for a new count (anyone can send)
            await client.database?.updateCount(message.guild?.id || "", 0);// reset the count
            message.channel.send({
                embed: {
                    color: process.env.INFO_COLOR,
                    title: "❌ talking out of turn",
                    description: `***count reset to 0***\nthe increment is ${incre}`,
                    footer: {
                        text: "idiot"
                    }
                }
            })
            return true;
        }
        await client.database?.setLastUpdater(message.guild?.id || "", message.author.id);// mark the sender as the last counter
        await client.database?.updateCount(message.guild?.id || "", cc + incre);
        //message.react("✔");
        message.react("☑️");
        return true;

        // ADD SOMETHING THAT CHECKS AND SETS THE INCREMENT IF ONE DOESN"T EXIST YET

    } catch (error) {
        xlg.log(error);
        return false;
    }
}