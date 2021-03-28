// THANK YOU BULLETBOT, A LOT OF THE BASE FOR THESE PARSERS CAME FROM THAT REPO, THEY ARE VERY HELPFUL
// https://www.npmjs.com/package/string-similarity

import { Guild, GuildChannel, GuildMember, MessageEmbed, Role, User } from "discord.js";
import { CommandClient } from "../typings";

/**
 * Returns similarity value based on Levenshtein distance.
 * The value is between 0 and 1
 *
 * @param {string} s1 first string
 * @param {string} s2 second string
 * @returns
 */
function stringSimilarity(s1: string, s2: string) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());
}

/**
 * helper function for stringSimilarity
 *
 * @param {*} s1
 * @param {*} s2
 * @returns
 */
function editDistance(s1: string, s2: string) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

/**
 * Executes a RegExp on a string and returns last result of first search if successful
 *
 * @param str String to search in
 * @param regex RegExp to search with
 * @returns
 */
function extractString(str: string, regex: RegExp) {
    const result = regex.exec(str);
    if (!result)
        return undefined;
    return result[result.length - 1];
}

/**
 * Extracts the id from a string and the fetches the User
 *
 * @export
 * @param client the client
 * @param text Text to extract id from
 * @returns User
 */
export async function stringToUser(client: CommandClient, text: string): Promise<User | undefined> {
    text = extractString(text, /<@!?(\d*)>/) || text;
    try {
        return await client.users.fetch(text) || undefined;
    } catch (e) {
        return undefined;
    }
}

/**
 * Parses a string into a Role object or a String for 'everyone' or 'here'.
 * If the role name isn't accurate the function will use the stringSimilarity method.
 * Can parse following input:
 * - here / everyone name
 * - @here / @everyone mention
 * - role name
 * - role mention
 * - role id
 * - similar role name
 *
 * @export
 * @param {Guild} guild guild where the role is in
 * @param {string} text string to parse
 * @param {boolean} [byName=true] if it should also search by name (default true)
 * @param {boolean} [bySimilar=true] if it should also search by similar name (default true)
 * @returns
 */

/**
 * Parses string into GuildMember object.
 * If the username isn't accurate the function will use the stringSimilarity method.
 * Can parse following inputs:
 * - user mention
 * - username
 * - nickname
 * - user id
 * - similar username
 *
 * @export
 * @param guild guild where the member is in
 * @param text string to parse
 * @param [byUsername=true] if it should also search by username (default true)
 * @param [byNickname=true] if it should also search by nickname (default true)
 * @param [bySimilar=true] if it should also search by similar username (default true)
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function stringToMember(guild: Guild, text: string, byUsername = true, byNickname = true, bySimilar = true): Promise<GuildMember | undefined> {
    if (!text) return undefined;
    text = extractString(text, /<@!?(\d*)>/) || extractString(text, /([^#@:]{2,32})#\d{4}/) || text;
    guild.members.cache = await guild.members.fetch();

    // by id
    let member = guild.members.cache.get(text);
    if (!member && byUsername)
        // by username
        member = guild.members.cache.find((x) => x.user.username == text);
    if (!member && byNickname)
        // by nickname
        member = guild.members.cache.find((x) => x.nickname == text);

    if (!member && bySimilar) {
        // closest matching username
        member = <GuildMember>guild.members.cache.reduce((prev, curr) => {
            return prev ? (stringSimilarity(curr.user.username, text) > stringSimilarity(prev.user.username, text) ? curr : prev) : curr;
        });
        if (member && stringSimilarity(member.user.username, text) < 0.4) {
            member = undefined;
        }
    }
    return member;
}

/**
 * Parses a string into a Role object or a String for 'everyone' or 'here'.
 * If the role name isn't accurate the function will use the stringSimilarity method.
 * Can parse following input:
 * - here / everyone name
 * - @here / @everyone mention
 * - role name
 * - role mention
 * - role id
 * - similar role name
 *
 * @export
 * @param guild guild where the role is in
 * @param text string to parse
 * @param [byName=true] if it should also search by name (default true)
 * @param [bySimilar=true] if it should also search by similar name (default true)
 * @returns
 */

export function stringToRole(guild: Guild, text: string, byName = true, bySimilar = true): Role | string | undefined {

    if (text == 'here' || text == '@here') {
        return '@here';
    }
    if (text == 'everyone' || text == '@everyone') {
        return '@everyone';
    }

    text = extractString(text, /<@&(\d*)>/) || text;

    // by id
    let role = guild.roles.cache.get(text);
    if (!role && byName) {
        // by name
        role = guild.roles.cache.find((x) => x.name == text);
    }
    if (!role && bySimilar) {
        // closest matching name
        role = <Role>guild.roles.cache.reduce((prev, curr) => {
            return prev ? (stringSimilarity(curr.name, text) > stringSimilarity(prev.name, text) ? curr : prev) : curr;
        });
        if (role && stringSimilarity(role.name, text) < 0.4) {
            role = undefined;
        }
    }
    return role;
}

/**
 * Parses a string into a Channel object.
 * Can parse following input:
 * - channel mention
 * - channel id
 * - channel name
 * - similar channel name
 *
 * @export
 * @param guild guild where channel is in
 * @param text string to parse
 * @returns
 */
export function stringToChannel(guild: Guild, text: string, byName = true, bySimilar = true): GuildChannel | undefined {
    if (!guild || !text) return;
    text = extractString(text, /<#(\d*)>/) || text;

    let channel = guild.channels.cache.get(text);
    if (!channel && byName) channel = guild.channels.cache.find((x) => x.name == text);
    if (!channel && bySimilar) {
        // closest matching name
        channel = <GuildChannel>guild.channels.cache.reduce(function (prev, curr) {
            return prev ? (stringSimilarity(curr.name, text) > stringSimilarity(prev.name, text) ? curr : prev) : curr;
        });
        if (stringSimilarity(channel.name, text) < 0.4) {
            channel = undefined;
        }
    }
    return channel;
}

/**
 * Parses a string into a JSON object for Embed.
 *
 * @export
 * @param text string to parse
 * @returns
 */
export function stringToEmbed(text: string): MessageEmbed | null {
    let embed = null;
    try {
        //text = text.replace(/(\r\n|\n|\r|\t| {2,})/gm, '');
        embed = JSON.parse(text);
    } catch (e) {
        return null;
    }
    return embed
}

/*function timeParser() {

}*/

/**
 * converts milliseconds into a string. Examples:
 * - 3m 4s
 * - 20d 30m
 * - 0s
 * - 1d 1h 1m 1s
 *
 * @export
 * @param {number} duration duration in milliseconds
 * @returns
 */
export function durationToString(duration: number): string {

    const ms = duration % 1000;
    duration = (duration - ms) / 1000;
    const seconds = duration % 60;
    duration = (duration - seconds) / 60;
    const minutes = duration % 60;
    duration = (duration - minutes) / 60;
    const hours = duration % 24;
    const days = (duration - hours) / 24;

    let durationString = '';

    if (days != 0) durationString += days + 'd ';
    if (hours != 0) durationString += hours + 'h ';
    if (minutes != 0) durationString += minutes + 'm ';
    if (seconds != 0) durationString += seconds + 's';

    if (durationString == '') durationString = '0s';

    return durationString.trim();
}