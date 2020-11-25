import xlg from '../xlogger';
import { sendError } from "../utils/messages";
import checkAccess from '../utils/checkaccess';
import { CommandClient, ExtMessage } from '../typings';
import { CollectorFilter, MessageEmbed, TextChannel } from 'discord.js';

module.exports = {
    name: "increment",
    aliases: ["count"],
    description: "set the count difference",
    usage: "<number < 75,000>",
    args: true,
    specialArgs: 1,
    async execute(client: CommandClient, message: ExtMessage, args: string[]) {
        try {
            // check for perms
            if (!(await checkAccess(message))) return;

            if (args.length === 1) {
                if (/[^0-9]+/.test(args[0]) || parseInt(args[0], 10) > 75000 || parseInt(args[0], 10) < 1) {
                    message.channel.send({
                        embed: {
                            color: process.env.FAIL_COLOR,
                            description: "that is not a valid number\nnumber must be less than `75,000`"
                        }
                    });
                    return false;
                }
                const increment = await client.database?.getIncrement(message.guild?.id);
                if (!increment) return;
                if (parseInt(args[0], 10) === increment.increment) {
                    message.channel.send({
                        embed: {
                            color: process.env.WARN_COLOR,
                            description: "that increment is already set"
                        }
                    });
                    return false;
                }
                const ninc = parseInt(args[0], 10);// The increment to be set


                const stats = await client.database?.getStats(message.guild?.id);
                if (!stats) return false;
                // This section will only execute if the guild no longer has eligibility
                if (!stats.leaderboardEligible) {
                    await client.database?.setIncrement(message.guild?.id || "none", ninc);

                    await message.channel.send({
                        embed: {
                            color: parseInt(process.env.INFO_COLOR || "0"),
                            description: `Increment set to ${ninc}`
                        }
                    });

                    return true;
                }
                // This section will only execute if the guild still has eligibility
                const warnMsg = await message.channel.send({
                    embed: {
                        color: process.env.WARN_COLOR,
                        description: `**WARNING:** This action will permanently remove your leaderboard eligibility, continue?`
                    }
                });
                await warnMsg.react("🟢").catch(xlg.error);
                await warnMsg.react("🚫").catch(xlg.error);

                const filter: CollectorFilter = async (r, u) => {
                    return ((r.emoji.name === '🟢' || r.emoji.name === '🚫') && (message.guild?.members.cache.get(u.id)?.permissions.has(["ADMINISTRATOR"]) || u.id === message.author.id))
                };
                const collected = await warnMsg.awaitReactions(filter, { max: 1, time: 10000 });
                if (!collected || !collected.size || collected.first()?.emoji.name === '🚫') {
                    warnMsg.embeds[0].color = parseInt(process.env.FAIL_COLOR || "0");
                    warnMsg.embeds[0].description = "__Aborted__ increment change!";
                    await warnMsg.edit(new MessageEmbed(warnMsg.embeds[0]));

                    const reactsToRemove = warnMsg.reactions.cache.filter(r => r.users.cache.has(client.user?.id || "0"));
                    try {
                        for (const reaction of reactsToRemove.values()) {
                            await reaction.users.remove(client.user?.id || "0");
                        }
                    } catch (error) {
                        xlg.error("could not remove my reactions");
                    }
                } else {
                    if (collected.first()?.emoji.name === "🟢") {
                        await client.database?.setIncrement(message.guild?.id || "none", ninc);
                        warnMsg.embeds[0].color = parseInt(process.env.INFO_COLOR || "0");
                        warnMsg.embeds[0].description = `Increment set to ${ninc}`;
                    }
                    await warnMsg.edit(new MessageEmbed(warnMsg.embeds[0]));
                    
                    const reactsToRemove = warnMsg.reactions.cache.filter(r => r.users.cache.has(client.user?.id || "0"));
                    try {
                        for (const reaction of reactsToRemove.values()) {
                            await reaction.users.remove(client.user?.id || "0");
                        }
                    } catch (error) {
                        xlg.error("could not remove my reactions");
                    }
                }
                return true;
            }
            /*const ninc = Math.floor(Math.random() * 10);
            client.database?.setIncrement(message.guild?.id, ninc);
            message.channel.send({
                embed: {
                    color: process.env.NAVY_COLOR,
                    description: `increment randomly set to \`${ninc}\``
                }
            });
            return;*/
        } catch (error) {
            xlg.error(error);
            if (!(message.channel instanceof TextChannel)) return;
            sendError(message.channel);
        }
    }
}