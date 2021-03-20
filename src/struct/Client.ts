import { Client, Collection } from 'discord.js';
import { Command, CommandClient } from '../typings';
import fs from 'fs';
import { sendError, sendInfo, sendWarn } from '../utils/messages';
import { Database } from '../utils/dbm';
import path from 'path';

export default class extends Client implements CommandClient {
    public commands: Collection<string, Command>;
    public sendError: typeof sendError;
    public sendWarn: typeof sendWarn;
    public sendInfo: typeof sendInfo;
    public database: Database;

    constructor() {
        super({
            disableMentions: 'everyone'
        });

        this.commands = new Collection();

        // VV these are "possible undefined," and I don't know how to fix that
        this.sendError = sendError;
        this.sendWarn = sendWarn;
        this.sendInfo = sendInfo;

        // setting up db and attaching it to the client
        this.database = new Database();
    }

    // ▼▲▼▲▼▲▼▲▼▲▼▲▼▲ for command handler
    async loadCommands(): Promise<void> {
        const commandFiles = fs.readdirSync(path.join(__dirname, `../`, `/commands`)).filter(file => file.endsWith('.js'));
        let commNumber = 1;
        for (const file of commandFiles) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { command } = await import(path.join(__dirname, `../`, `/commands/${file}`));
            this.commands?.set(command.name, command);
            let noName = '';
            if (command.name === '' || command.name == null) {
                noName = ' \x1b[33mWARNING: \x1b[32mthis command has no name, it may not be configured properly\x1b[0m';
            }
            console.log(`${commNumber} - %s$${command.name}%s has been loaded%s`, '\x1b[35m', '\x1b[0m', noName);
            commNumber++;
        }
    }
}
