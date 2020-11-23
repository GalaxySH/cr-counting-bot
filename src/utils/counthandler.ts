import { CommandClient, ExtMessage } from "../typings";
import xlg from "../xlogger";
//import { handleFoul } from "./foul";
//import fs from "fs";

export = async (client: CommandClient, message: ExtMessage): Promise<boolean> => {
    try {
        /*const countChannel = await client.database?.getChannel(message.guild?.id);
        if (!countChannel) return false;// IF A COUNT CHANNEL IS NOT FOUND*/
        if (message.channel.id !== message.countChannel) return false;

        //const chatting = await client.database?.getChatAllowed(message.guild?.id);
        //if (!chatting) return false;
        if (!parseInt(message.content, 10) || /[^0-9]+/.test(message.content)) {
            if (!message.gprefix || !client.commands) return false;
            if (message.content.toLowerCase().indexOf(message.gprefix) === 0) {
                const args = message.content.slice(message.gprefix.length).trim().split(/ +/g)
                const commandName = args.shift()?.toLowerCase()
                if (!commandName) return false;
                const command = client.commands.get(commandName) ||
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
                if (command) return false;
            }
            if (!message.chatting) message.delete();
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
            if (!await handleFoul(client, message, "wrong number")) xlg.log("failed to handle foul: number");
            return true;
        }

        const lastUpdater = await client.database?.getLastUpdater(message.guild?.id);
        if (!lastUpdater) return false;
        if (lastUpdater.lastUpdatedID === message.author.id) {
            if (!await handleFoul(client, message, "talking out of turn")) xlg.log("failed to handle foul: turn");
            return true;
        }
        await client.database?.setLastUpdater(message.guild?.id || "", message.author.id);// mark the sender as the last counter
        await client.database?.updateCount(message.guild?.id || "", cc + incre);
        //message.react("✔");
        message.react("☑️");
        return true;
    } catch (error) {
        xlg.log(error);
        return false;
    }
}

async function handleFoul(client: CommandClient, message: ExtMessage, reason: string): Promise<boolean> {
    if (!client || !message) return false;
    if (!reason) reason = "Foul";

    let guildSaves = await client.database?.getGuildSaves(message.guild?.id);
    if (guildSaves && guildSaves >= 1) {// || saves === 0
        guildSaves--;
        client.database?.updateSaves(message.guild?.id || "", guildSaves);
        message.react("🟧");
        message.channel.send(`${message.member} you screwed it, **but you were saved.**`, {
            embed: {
                color: process.env.INFO_COLOR,
                //author: {
                //    name: `${reason || message.author.tag}`,
                //    iconURL: message.author.avatarURL() || undefined
                //},
                title: `\\🟧 ${reason}`,
                description: `**One save has been docked**\nGuild Saves Remaining: **${guildSaves}**`,
                footer: {
                    text: "c?help"
                }
            }
        }).catch(xlg.error);
        return true;
    }

    message.react("❌");
    await client.database?.setLastUpdater(message.guild?.id || "", "");// reset lastUpdater for a new count (anyone can send)
    await client.database?.updateCount(message.guild?.id || "", 0);// reset the count
    await client.database?.incrementErrorCount(message.guild?.id || "");
    // fail role handling
    const failroleid = await client.database?.getFailRole(message.guild?.id || "");
    if (failroleid && failroleid.length > 0) {
        const failrole = message.guild?.roles.cache.get(failroleid);
        if (!failrole) {
            await client.database?.setFailRole(message.guild?.id || "", "");
        } else {
            message.member?.roles.add(failrole).catch(xlg.error);
        }
    }

    const increment = await client.database?.getIncrement(message.guild?.id);
    if (!increment) return false;
    const incre = increment.increment || 1;
    message.channel.send(`${message.member} you screwed it, **and you had no saves left.**`, {
        embed: {
            color: process.env.INFO_COLOR,
            title: `\`❌\` ${reason}`,
            description: `**reset to 0**\nthe next number is \`${incre}\``,
            footer: {
                text: "use c?curr next time, idiot"
            }
        }
    }).catch(xlg.error);
    return true;
}