import Discord from 'discord.js';
import { Db } from 'mongodb';
//import mongodb from 'mongodb';

/*export interface CDAT {
    client: CommandClient,
    message: ExtMessage,
    args: string[]
}*/

//DEFINE GLOBAL INTERFACES
export interface Command {
    name: string,
    aliases: string[],
    description: string | object,
    usage: string,
    args: boolean,
    execute: (client: CommandClient, message: ExtMessage, args: string[]) => any
}

export interface CommandClient extends Discord.Client {
    commands?: Discord.Collection<string, Command>,
    database?: Db
}

export interface ExtMessage extends Discord.Message {
    gprefix: string
}