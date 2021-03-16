# counting human

A Discord bot made for any server: [counting human](https://github.com/GalaxySH/cr-counting-bot) is something cool and fun to have, and enjoyable to use. The purpose of this app is to manage and enhance a channel for counting. More specifically, this application is designed to run the _counting_ game on your server.

The support (Discord) server: [Rooskie's](https://dsc.gg/ro).

## The Counting Game

Essentially, the counting game is an activity involving counting. The server's admin(s) get final say over exactly how it is played and the rules to play it, but often the game is a challenge to see how high the members of the server can count, in sequence, until they mess up. counting human adds to the game by introducing measures of fair play, channel moderation (e.g. only allowing numbers in the channel), saves (basically "lives" for the players to use up), and more.

### - Saves

People seem to often get confused about the save system. The save system is basically a default add-on feature for the bot that enhances the game experience. Some players like it, some don't. The point of the whole thing is to make the whole counting premise a bit more enjoyable and to keep people from getting frustrated at the bot.

Basically, when you **first** add the bot, the server it is added to gets one "Guild Save," a unit of protection. What this does is it gives the new server one chance to mess up before it gets real. There are two types of saves in the game: the aforementioned Guild Saves (GS), and then Personal Saves (PS, or just "your saves"). The first time you count (anywhere in any server), a user profile is created for you. This initial profile contains, by default, zero (0) saves. Personal Saves are earned by the player individually, while Guild Saves are allocated passively. The two types work the same way, they are units of anti-fail, or get-out-of-jail-free cards, essentially. As long as you have one Personal Save, or your server has one Guild Save, you can rest assured that messing up will not mess up your server's count of 1000000. Personal Saves are used on a per-person basis and are synced in any server the bot is in, while the pool of Guild Saves only exist per-server and are pulled from by anyone within those servers.

#### Earning Saves

**Personal Saves:** People must earn Personal Saves individually (on their own). For every 25 (successful) counts they send, they gain a PS.

**Guild Saves:** Remember, GSs are assigned to servers. Every server that the bot is in is given one GS every 24 hours.

No guild or user may hold more than three (3) saves at one time.

## Usage

When it is invited (`c?invite`) the server admins (only admins can manage the settings at this time) may set a **counting channel**. The bot will listen to that channel, and will respond to numbers that are sent in it. Bot commands can be executed from any channel the bot has the permissions to see.

## Running Locally

It is not recommended to run this locally, as you lose out on some functionality. If there's an issue with the bot, open a GitHub issue, or join the [support server](https://dsc.gg/ro). That said, if you like running stuff locally, see below.

### With Docker

Make sure you have [docker](https://www.docker.com/get-started) installed. Then run:

```bash
git clone https://github.com/GalaxySH/cr-counting-bot .
```

After that create a `.env` file using the [template](https://github.com/GalaxySH/cr-counting-bot/tree/main/.env-example). Finally run:

```bash
docker-compose -f "docker-compose.yml" up -d --build -t counting_human
```

### Contributing

See the [steps to contribute](https://github.com/GalaxySH/cr-counting-bot/tree/main/.env-example)