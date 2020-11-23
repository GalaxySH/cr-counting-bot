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
    showInHelp: boolean,
    execute: (client: CommandClient, message: ExtMessage, args: string[]) => never
}

export interface CommandClient extends Discord.Client {
    commands?: Discord.Collection<string, Command>,
    database?: Database
}

export interface ExtMessage extends Discord.Message {
    gprefix?: string
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
    paused?: boolean;
    members?: Array<{
        id: string;
        totalCounts?: number;
        highestNumber?: number;
    }>;
    saves?: number;
    lastSaved?: Date;
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
    userID?: string;
    //guildID?: string;
    saves?: 0 | 1 | 2 | 3;
}
