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

export interface guildObject {
    guildID?: string;
    count?: number;
    increment?: number;
    countChannel?: string;
    commandChannel?: string;
    failRole?: string;
    lastUpdatedID?: string;
    lastMessageID?: string;
    chatAllowed?: boolean;
    leaderboardEligible?: 0 | 1;
    numberOfCounts?: number;
    totalCount?: number;
    recordNumber?: number;
    numberOfErrors?: number;
    //paused?: boolean;
    players?: Array<{
        id: string;
        totalCounts?: number;
        highestNumber?: number;
    }>;
    saves?: number;
    lastSaved?: Date;
    //checkMarks?: boolean;
    deletedMessageReminder?: boolean;
    courtesyChances?: 0 | 1 | 2;
    //foulMessage?: boolean;
    //redemptionChances?: 0 | 1 | 2;
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
