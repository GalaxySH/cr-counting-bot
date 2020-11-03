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
    paused?: boolean;
    countChannel?: string;
    lastUpdatedID?: string;
}