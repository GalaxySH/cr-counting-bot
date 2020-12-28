import moment from "moment";
import { CommandClient, ExtMessage } from "../typings";
import xlg from "../xlogger";
//import { handleFoul } from "./foul";
//import fs from "fs";

export = async (client: CommandClient, message: ExtMessage): Promise<boolean> => {
    try {
        if (!message.guild || !client.database) return false;
        /*const countChannel = await client.database?.getChannel(message.guild?.id);
        if (!countChannel) return false;// IF A COUNT CHANNEL IS NOT FOUND*/
        if (message.channel.id !== message.countChannel) return false;

        if (!parseInt(message.content, 10) || /[^0-9]+/.test(message.content)) {
            return false;
        }

        const lastUpdater = await client.database.getLastUpdater(message.guild.id);
        if (lastUpdater && lastUpdater.lastUpdatedID === message.author.id) {
            if (!await handleFoul(client, message, "talking out of turn")) xlg.log("failed to handle foul: turn");
            return true;
        }
        
        const guesses = await client.database?.getCourtesyChances(message.guild?.id);
        if (!guesses) {
            message.guesses = 0;
        } else {
            message.guesses = guesses;
        }

        //const rmsgs = await message.channel.messages.fetch({ limit: 2 });
        let count = await client.database?.getCount(message.guild.id);
        if (!count || !count.count) count = { guildID: message.guild.id, count: 0 };
        const increment = await client.database?.getIncrement(message.guild?.id);
        if (!increment) return false;
        const cc = count.count || 0;
        const incre = increment.increment || 1;
        //if (parseInt(message.content, 10) !== parseInt((rmsgs.array())[1].content, 10) + 1) {
        if (parseInt(message.content, 10) !== cc + incre) {
            if (!await handleFoul(client, message, "wrong number", parseInt(message.content, 10) - (cc + incre))) xlg.log("failed to handle foul: number");
            return true;
        }

        // record role handling
        const recordRoleID = await client.database?.getRecordRole(message.guild?.id || "");
        if (recordRoleID && recordRoleID.length > 0) {// will check if a role needs to be given to the user who failed the count
            const s = await client.database.getStats(message.guild.id);
            if (s && s.recordNumber) {
                if (cc + incre > s.recordNumber) {
                    const recordRole = message.guild?.roles.cache.get(recordRoleID);
                    if (recordRole) {
                        message.member?.roles.add(recordRole).catch(xlg.error);
                        const rhid = await client.database.getRecordHolder(message.guild.id);
                        if (rhid && rhid !== message.author.id) {
                            const rh = message.guild.members.cache.get(rhid);
                            if (rh/* && rh.roles.cache.has(recordRoleID)*/) {
                                rh.roles.remove(recordRole);
                            }
                        }
                        await client.database.setRecordHolder(message.guild.id, message.author.id);
                    } else {
                        await client.database?.setRecordRole(message.guild?.id || "", "");
                    }
                }
            }
        }

        await client.database?.setLastUpdater(message.guild.id, message.author.id);// mark the sender as the last counter
        await client.database?.updateCount(message.guild.id, cc + incre, message.id);
        await client.database?.setDelReminderShown(message.guild.id, false);// resets the status to no for whether the reminder for being delete-tricked had been sent
        if (message.guesses !== 2) {
            await client.database?.setCourtesyChances(message.guild.id, 2);// resets the chances given for the players to guess the number if they get it wrong under circums.
        }
        if (cc + incre === 69) {
            await client.database?.incrementPogStat(message.guild.id);
            message.channel.send("nice");
        }
        await client.database?.incrementGuildPlayerStats(message.guild?.id || "", message.author.id, false, cc + incre);

        //message.react("✔");
        message.react("☑️");
        return true;
    } catch (error) {
        xlg.log(error);
        return false;
    }
}

async function handleFoul(client: CommandClient, message: ExtMessage, reason?: string, offBy?: number): Promise<boolean> {
    if (!client || !message) return false;
    if (!reason) reason = "Foul";

    const lastMessageID = await client.database?.getLastMessageID(message.guild?.id);
    if (lastMessageID && reason === "wrong number") {// will go here if someone messes up and the last message id has been logged and not reset
        const lastMessage = message.channel.messages.cache.get(lastMessageID);
        if (!lastMessage) {// if the message for the last count in the counting channel couldn't be found
        if (message.guesses) {// if the guild has guesses for the number left, continue letting them guess
            message.react("🟣");
                const delReminder = await client.database?.getDelReminderSent(message.guild?.id);
                if (!delReminder) {// if the message about being tricked hasn't been sent yet
                    message.channel.send(`${message.member} you were tricked.`, {
                        embed: {
                            color: process.env.INFO_COLOR,
                            title: `\`🟣\` Previous Count Deleted`,
                            description: `**The message that had the most recent count was deleted.**\nThe server can use **two** redemption guesses.`,
                            footer: {
                                text: "c?help"
                            }
                        }
                    }).catch(xlg.error);
                    client.database?.setDelReminderShown(message.guild?.id || "", true);
                    return true;
                } else {
                    client.database?.setCourtesyChances(message.guild?.id || "", message.guesses - 1);
                    return true;
                }
            }
        }
    }

    const player = await client.database?.getPlayerData(message.author.id);
    let guildSaves = await client.database?.getGuildSaves(message.guild?.id);
    if (player && player.saves >= 1) {// if the user has individual saves left, stop
        player.saves--;
        client.database?.updatePlayerSaves(message.author.id, player.saves);
        message.react("🟠");
        message.channel.send(`${message.member} you screwed it, **but you were saved.**`, {
            embed: {
                color: process.env.INFO_COLOR,
                title: `\`🟠\` ${reason}`,
                description: `**Docked one of your saves**\nPersonal Saves: **${player.saves}** -1\nGuild Saves: **${guildSaves || 0}**`,
                footer: {
                    text: "c?help"
                }
            }
        }).catch(xlg.error);
        return true;
    }

    if (guildSaves && guildSaves >= 1) {// if the guild has saves left, stop
        guildSaves--;
        client.database?.updateSaves(message.guild?.id || "", guildSaves);
        message.react("🟠");
        message.channel.send(`${message.member} you screwed it, **but you were saved.**`, {
            embed: {
                color: process.env.INFO_COLOR,
                //author: {
                //    name: `${reason || message.author.tag}`,
                //    iconURL: message.author.avatarURL() || undefined
                //},
                title: `\`🟠\` ${reason}`,
                description: `**You had to use a guild save**\nPersonal Saves: **${player ? player.saves : 0}**\nGuild Saves: **${guildSaves || 0}** -1`,
                footer: {
                    text: "c?help"
                }
            }
        }).catch(xlg.error);
        return true;
    }
    // if all checks have failed and the numbers should be reset and the data logged
    message.react("❌");
    await client.database?.setLastUpdater(message.guild?.id || "", "");// reset lastUpdater for a new count (anyone can send)
    await client.database?.updateCount(message.guild?.id || "", 0);// reset the count
    await client.database?.incrementErrorCount(message.guild?.id || "");// adds to the total count of errors for the guild
    await client.database?.setDelReminderShown(message.guild?.id || "", false);// resets the status to no for whether the reminder for being delete-tricked had been sent
    await client.database?.incrementGuildPlayerStats(message.guild?.id || "", message.author.id, true);
    if (message.guesses !== 2) {
        await client.database?.setCourtesyChances(message.guild?.id || "", 2);// resets the chances given for the players to guess the number if they get it wrong under circums.
    }

    // fail role handling
    const failroleid = await client.database?.getFailRole(message.guild?.id || "");
    if (failroleid && failroleid.length > 0) {// will check if a role needs to be given to the user who failed the count
        const failrole = message.guild?.roles.cache.get(failroleid);
        if (!failrole) {
            await client.database?.setFailRole(message.guild?.id || "", "");
        } else {
            message.member?.roles.add(failrole).catch(xlg.error);
        }
    }
    // auto mute handling
    await handleMute(client, message, offBy);

    const increment = await client.database?.getIncrement(message.guild?.id);
    if (!increment) return false;
    const incre = increment.increment || 1;
    message.channel.send(`${message.member} you screwed it, **and you had no saves left.**`, {// gives the actual fail message
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

async function handleMute(client: CommandClient, message: ExtMessage, offBy?: number): Promise<void> {
    if (!message.guild || message.channel.type !== "text" || !message.member) return;
    const ams = await client.database?.getAutoMuteSetting(message.guild?.id);
    if (!ams) return;

    message.channel.updateOverwrite(message.member, {
        "SEND_MESSAGES": false
    }, `muting ${message.author.tag} for failing the count`);

    let muteLength = parseInt(process.env.DEF_MUTE_LENGTH || "10");
    if (offBy && Math.abs(offBy) > 5) {
        muteLength = (Math.abs(offBy) + 5) * 2;
    }
    const aimDate = moment(new Date()).add(muteLength, "m").toDate();

    client.database?.setMemberMute(message.guild?.id, message.author.id, aimDate);
}

// function userStatter(status: boolean, memberid: string, guildid: string, count?: number) {}
