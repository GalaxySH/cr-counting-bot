import Discord from 'discord.js';
import { Database } from './utils/dbm';
//import { Db } from 'mongodb';
//import mongodb from 'mongodb';

/*export interface CDAT {
    client: CommandClient,
    message: ExtMessage,
    args: string[]
}*/

interface descriptionObject {
    short?: string;
    long?: string;
}

//DEFINE GLOBAL INTERFACES
export interface Command {
    name: string,
    aliases: string[],
    description: string | descriptionObject,
    usage: string,
    args: boolean,
    specialArgs: number;
    hideInHelp: boolean,
    execute: (client: CommandClient, message: ExtMessage, args: string[]) => never
}

export interface CommandClient extends Discord.Client {
    commands?: Discord.Collection<string, Command>,
    database?: Database
}

export interface ExtMessage extends Discord.Message {
    gprefix?: string
    chatting?: boolean;
    countChannel?: string;
    cmdChannel?: string | false;
    guesses?: number;
}

export interface guildObject {// the information object assigned to every active guild
    guildID?: string;// identifying snowflake
    count?: number;// current count (the last number in the counting channel)
    increment?: number;// what the count should be increasing by
    countChannel?: string;// identifying snowflake of the channel the count takes place in
    commandChannel?: string;// identifying snowflake of the only channel commands can be executed in, if enabled
    failRole?: string;// identifying snowflake of the role given to players when they fail the count
    lastUpdatedID?: string;// identifying snowflake of the last user to count
    lastMessageID?: string;// identifying snowflake of the message containing the last count
    chatAllowed?: boolean;// setting for whether non-numeric messages should be allowed in the counting channel
    leaderboardEligible?: 0 | 1;// status of whether the guild is stil eligible to appear on the leaderboard
    numberOfCounts?: number;// the total number of counts committed in the guild
    totalCount?: number;// numberOfCounts * increment (the current increment is added to this figure every count)
    recordNumber?: number;// the highest number reached in the guild
    numberOfErrors?: number;// the total number of counting errors made in the guild
    pogNumStat?: number;// the number of times the number 69 was reached
    players?: Array<GuildPlayer>;// individual player data for the guild, not global info
    saves?: number;// the number of saves the guild currently has (max 3)
    lastSaved?: Date;// the timestamp of the last time a save was used on the count
    deletedMessageReminder?: boolean;// whether or not the message warning that the previous count was deleted was already sent for the turn
    courtesyChances?: 0 | 1 | 2;// the number of chances remaining for the players to guess the number if the situation arises
    autoMute?: boolean;// whether the auto-mute on fail feature is enabled, IN BETA
    recordRole?: string;// for the achievement role handed out when the record is broken
    recordHolder?: string;// identifying snowflake of the user who made the last highest count, MAY SWITCH TO ARRAY OF USERS
    //paused?: boolean;
    //foulMessage?: boolean;
    //checkMarks?: boolean;
}

export interface GuildPlayer {// used for player data in a guildObject
    id: string;// the identifying snowflake
    errors: number;// the number of errors in total made by the player
    totalCounts: number;// the total number of counts made by the player
    highestNumber: number;// the highest number the player reached
    //mutedUntil?: Date;
}

export interface PermLevels {
    member: 0;
    trustedMember: 1;
    immune: 2;
    mod: 3;
    admin: 4;
    botMaster: 5;
}

export interface CheckAccessOptions {
    adminOnly?: boolean;
    ownerOnly?: boolean;
}

export interface PlayerData {
    userID: string;
    //guildID?: string;
    saves: 0 | 1 | 2 | 3;
    lastSaved?: Date;
    errors?: number;
    counts?: number;
    highestNumber?: number;
    banned: boolean;
}

export interface MuteData {
    guildID: string;
    memberID: string;
    muteTime: Date | 0;
}
