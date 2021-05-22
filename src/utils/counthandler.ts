import moment from "moment";
import { CommandClient, CountTiming, ExtMessage } from "../typings";
import xlg from "../xlogger";
import { getFriendlyUptime } from "./time";

const countTimings: Array<CountTiming> = [];

function checkNum(c: string): boolean {
    return /^([+-]?(?=\.\d|\d)(?:\d+)(?:\.?\d*))(?:[eE]([+-]?\d+))?$/.test(c);
}

export = async (client: CommandClient, message: ExtMessage): Promise<boolean> => {
    try {
        if (!message.guild) return false;
        
        if (message.channel.id !== message.countChannel) return false;

        if (!checkNum(message.content)) {
            return false;
        }
        const num = parseInt(message.content, 10);
        if (isNaN(num)) {
            return false;
        }

        const mute = await client.database?.getMute(message.guild.id, message.author.id);
        if (mute) {
            try {
                await message.react("🔇");
            } catch (error) {
                //
            }
            return false;
        }

        const count = await client.database.getCount(message.guild.id);
        const lastUpdater = await client.database.getLastUpdater(message.guild.id);
        if (lastUpdater === message.author.id) {
            if (!await handleFoul(client, message, lastUpdater, "talking out of turn", undefined, count)) xlg.log("failed to handle foul: turn");
            return true;
        }

        const guesses = await client.database?.getCourtesyChances(message.guild?.id);
        if (!guesses) {
            message.guesses = 0;
        } else {
            message.guesses = guesses;
        }

        //const rmsgs = await message.channel.messages.fetch({ limit: 2 });
        const increment = await client.database?.getIncrement(message.guild?.id);
        if (!increment) return false;
        const incre = increment || 1;
        if (num !== count + incre) {
            //const num = parseInt(message.content, 10);// would recommend BigInt, but I am ignoring all BigInt numbers
            /*if (num > Number.MAX_SAFE_INTEGER) {
                num = Number.MAX_SAFE_INTEGER;
            }*/
            if (!await handleFoul(client, message, lastUpdater, "wrong number", num - (count + incre), (count + incre))) xlg.log("failed to handle foul: number");
            return true;
        }

        await client.database?.updateCount(message.guild.id, count + incre, message.id);// updating the count, this should take place before a bunch more db queries have to be processed

        // handling count timing
        const timing = countTimings.find(t => t.guildID === message.guild?.id);
        if (!timing) {
            countTimings.push({
                guildID: message.guild.id,
                threshold: 200,
                time: message.createdAt
            });
        } else {
            timing.time = message.createdAt;
        }

        // handling personal saves
        const p2 = await client.database.getPlayerData(message.author.id);
        if (p2) {
            const p2c = p2.correctAccumulation;
            if (p2c && p2c + 1 >= 25) {
                if (p2.saves < 3) {
                    client.database.updatePlayerSaves(message.author.id, p2.saves + 1);
                }
                client.database.setPlayerCorrect(message.author.id, 0);
            } else {
                client.database.setPlayerCorrect(message.author.id, 0, true);
            }
        }

        await client.database?.setLastUpdater(message.guild.id, message.author.id);// mark the sender as the last counter
        // THE COUNT UPDATE HAD BEEN HERE, I REMOVED IT BECAUSE I REALIZED THE DATABASE NEEDED TO BE UPDATED IMMEDIATELY AFTER CHECKING
        client.database?.setDelReminderShown(message.guild.id, false);// resets the status to no for whether the reminder for being delete-tricked had been sent
        if (message.guesses !== 2) {
            client.database?.setCourtesyChances(message.guild.id, 2);// resets the chances given for the players to guess the number if they get it wrong under circums.
        }
        if (count + incre === 69) {
            client.database?.incrementPogStat(message.guild.id);
            message.channel.send("nice");
        }
        client.database?.incrementGuildPlayerStats(message.guild?.id || "", message.author.id, false, count + incre);

        try {
            message.react("☑️");// ✔
        } catch (error) {
            message.channel.send("\\✔")
        }
        return true;
    } catch (error) {
        xlg.log(error);
        return false;
    }
}

async function handleFoul(client: CommandClient, message: ExtMessage, lastUpdater: string, reason?: string, offBy?: number, curr = 0): Promise<boolean> {
    try {
        if (!client || !message || !message.guild) return false;
        if (!reason) reason = "Foul";

        const timing = countTimings.find(t => t.guildID === message.guild?.id);
        if (timing) {
            const duration = moment.duration(moment(message.createdAt).diff(moment(timing.time)));
            const ms = duration.asMilliseconds();

            if (ms < timing.threshold) {
                try {
                    await message.react("🟠");
                } catch (error) {
                    //
                }
                await message.channel.send(`${message.member} you were beaten`, {
                    embed: {
                        color: process.env.INFO_COLOR,
                        title: `\`🟠\``,
                        description: `You tried to count at the same time as *someone* else\nNumber was received within **${timing.threshold}ms** threshold`
                    }
                });
                return true;
            }
        }

        const fps = await client.database?.getFoulPrevention(message.guild?.id);
        if (fps) {
            const lastMessageID = await client.database.getLastMessageID(message.guild?.id);
            if (lastMessageID && reason === "wrong number") {// will go here if someone messes up and the last message id has been logged and not reset
                const lastMessage = message.channel.messages.cache.get(lastMessageID);
                if (!lastMessage && message.guesses) {// if the message for the last count in the counting channel couldn't be found
                    // if the guild has guesses for the number left, continue letting them guess
                    try {
                        await message.react("🟣");
                    } catch (error) {
                        //
                    }
                    const delReminder = await client.database.getDelReminderSent(message.guild?.id);
                    if (!delReminder) {// if the message about being tricked hasn't been sent yet
                        await message.channel.send(`${message.member} you were tricked`, {
                            embed: {
                                color: process.env.INFO_COLOR,
                                title: `\`🟣\` Previous Count Deleted`,
                                description: `**The message that had the most recent count was deleted**\nThe server has **two** chances at redemption`
                            }
                        });
                        client.database.setDelReminderShown(message.guild?.id || "", true);
                        return true;
                    } else {
                        client.database.setCourtesyChances(message.guild?.id || "", message.guesses - 1);
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
            try {
                await message.react("🟠");
            } catch (error) {
                //
            }
            await message.channel.send(`${message.member} you miscounted **and were saved**`, {
                embed: {
                    color: process.env.INFO_COLOR,
                    title: `\`🟠\` ${reason}`,
                    description: `**Docked one of your personal saves**\nPersonal Saves: **${player.saves}** -1\nGuild Saves: **${guildSaves || 0}**`,
                    footer: {
                        text: "c?help"
                    }
                }
            });
            return true;
        }

        if (guildSaves && guildSaves >= 1) {// if the guild has saves left, stop
            guildSaves--;
            client.database?.updateSaves(message.guild?.id || "", guildSaves);
            try {
                await message.react("🟠");
            } catch (error) {
                //
            }
            await message.channel.send(`${message.member} you miscounted **and were saved**`, {
                embed: {
                    color: process.env.INFO_COLOR,
                    title: `\`🟠\` ${reason}`,
                    description: `**You had to use a guild save**\nPersonal Saves: **${player ? player.saves : 0}**\nGuild Saves: **${guildSaves || 0}** -1`,
                    footer: {
                        text: "c?help"
                    }
                }
            });
            return true;
        }

        // If all checks have failed, the numbers should be reset and the data logged
        try {
            await message.react("❌");
        } catch (error) {
            //
        }
        await client.database.setLastUpdater(message.guild?.id || "", "");// reset lastUpdater for a new count (anyone can send)
        await client.database.updateCount(message.guild?.id || "", 0);// reset the count
        await client.database.setDelReminderShown(message.guild?.id || "", false);// resets the status to no for whether the reminder for being delete-tricked had been sent
        client.database.incrementErrorCount(message.guild?.id || "");// adds to the total count of errors for the guild
        client.database.incrementGuildPlayerStats(message.guild?.id || "", message.author.id, true);
        await client.database.setPlayerCorrect(message.author.id, 0);// reset the number of correct counts the user has made
        if (message.guesses !== 2) {
            client.database?.setCourtesyChances(message.guild?.id || "", 2);// resets the chances given for the players to guess the number if they get it wrong under circums.
        }

        // handling count timing
        if (timing) {
            countTimings.splice(countTimings.indexOf(timing), 1);
        }

        // fail role handling
        const failroleid = await client.database.getFailRole(message.guild?.id || "");
        if (failroleid && failroleid.length > 0) {// will check if a role needs to be given to the user who failed the count
            const failrole = message.guild?.roles.cache.get(failroleid);
            if (!failrole) {
                client.database?.setFailRole(message.guild?.id || "", "");
            } else {
                message.member?.roles.add(failrole);
            }
        }
        // auto mute handling
        await handleMute(client, message, offBy, curr);

        const increment = await client.database.getIncrement(message.guild?.id);
        const incre = increment || 1;
        await message.channel.send(`${message.member} you messed up **with no saves left**`, {// gives the actual fail message
            embed: {
                color: process.env.INFO_COLOR,
                title: `\`❌\` ${reason}`,
                description: `**reset to 0**\nthe next number is \`${incre}\``,
                footer: {
                    text: "next time use c?c"
                }
            }
        });

        // record role handling
        const recordRoleID = await client.database.getRecordRole(message.guild.id);
        if (recordRoleID && recordRoleID.length > 0) {// will check if a role needs to be given to the user who failed the count
            const s = await client.database.getStats(message.guild.id);
            if (s && s.recordNumber) {
                if (curr + incre >= s.recordNumber && message.guild.roles.cache.get(recordRoleID)) {// For someone reason this statement stopped working properly, which I realized was because of the updateCount above making the (cc + incre) give the current count, not the count that comes after the current in the DB. It worked before, I don't know when or why I changed it. But, the issue is that (cc + incre) wouldn't give a number greater than the recordNumber in the database, it would be equal.
                    const recordRole = await message.guild.roles.fetch(recordRoleID);
                    if (recordRole) {
                        // const members = await message.guild.members.fetch();
                        const members = recordRole.members;
                        try {
                            const withRole = members.array();
                            for await (const m of withRole) {
                                await m.roles.remove(recordRole);
                            }
                        } catch (error) {
                            //
                        }

                        const awardee = message.guild.members.cache.get(lastUpdater);
                        if (awardee) {
                            awardee.roles.add(recordRole);
                            client.database.setRecordHolder(message.guild.id, lastUpdater);
                        }
                    } else {
                        client.database.setRecordRole(message.guild?.id || "", "");
                    }
                }
            }
        }
        return true;
    } catch (error) {
        xlg.error(error);
        return false;
    }
}

// NOTE: number > Number.MAX_SAFE_INTEGER
async function handleMute(client: CommandClient, message: ExtMessage, offBy?: number, curr = 1): Promise<void> {
    if (!message.guild || message.channel.type !== "text" || !message.member) return;
    const ams = await client.database?.getAutoMuteSetting(message.guild?.id);
    if (!ams) return;

    const currConv = Math.abs(curr) / 2;
    let muteLength = parseInt(process.env.DEF_MUTE_LENGTH || "10");
    if (offBy && Math.abs(offBy) > 3) {// if the error was "wrong number" and they were off by more than 5
        if (offBy < Number.MAX_SAFE_INTEGER) {
            muteLength = (Math.abs(offBy) + 5) + currConv;
        } else {
            muteLength = 60 * 24 * 5;// five days
        }
        if (muteLength > 60 * 24 * 5) {// if greater than five days
            muteLength = 60 * 24 * 5;
        }
    } else if (!offBy) {// if the error was "counting out of turn"
        muteLength = 1 / 3 + (curr > 10 ? currConv : 0);// 20 seconds unless the count was above 10
    } else {// if they were off by less than three
        muteLength = currConv;
    }
    const aimDate = moment(new Date()).add(muteLength, "m").toDate();

    const t = getFriendlyUptime(muteLength * 60 * 1000);
    try {
        const th = t.hours + (t.days * 24);
        const tm = t.minutes;
        const ts = t.seconds;
        const ttypes = ["hours", "minutes", "seconds"];
        if (!th) {
            ttypes.splice(ttypes.indexOf("hours"), 1);
        }
        if (!tm) {
            ttypes.splice(ttypes.indexOf("minutes"), 1);
        }
        if (!ts) {
            ttypes.splice(ttypes.indexOf("seconds"), 1);
        }
        const tt = [th, tm, ts].filter(x => x > 0).map((x, i, xt) => {
            return `${x} ${ttypes[i]}${i !== (xt.length - 1) ? (xt.length > 1 && xt.length - 2 === i ? `${xt.length > 2 ? "," : ""} and ` : ", ") : ""}`;
        });
        const joinedtt = tt.join("");
        await message.author.send(`Hello Person Who Cannot Count 👋

Your server admins have enabled auto-muting.

You have been muted for **${joinedtt}** in ${message.guild}. Check how much time remains on your mute with the \` c?ms \` command.

Remember:
    - **You can't count more than once in a row**
    - **You cannot count out of sequence**
    - After a fatal mistake is made, the count starts over
    - Your server gets one save per day
    - Confirm the count with the \` c?c \` command
    - Other people may try to mess with you

Yours,
Human`);
    } catch (e) {
        // ...just want errors to fizzle out
    }

    await message.channel.updateOverwrite(message.member, {
        "SEND_MESSAGES": false
    }, `auto-muting ${message.author.tag} for ${muteLength}min`);
    client.database.setMemberMute(message.guild?.id, message.author.id, aimDate);
}

// function userStatter(status: boolean, memberid: string, guildid: string, count?: number) {}
