const fs = require("fs");

module.exports = async (message) => {
    const config = require("../config.json");
    if (message.channel.id !== "769849916582789140") return false;
    if (!parseInt(message.content, 10) || /[^0-9]+/.test(message.content)) {
        const args = message.content.slice(message.gprefix.length).trim().split(/ +/g)
        const commandName = args.shift().toLowerCase()
        const command = message.client.commands.get(commandName) ||
            message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
        if (command) return false;
        message.delete();
        return true;
    }
    //const rmsgs = await message.channel.messages.fetch({ limit: 2 });
    //if (parseInt(message.content, 10) !== parseInt((rmsgs.array())[1].content, 10) + 1) {
    if (!config.currentNumber && config.currentNumber !== 0) config.currentNumber = 0;
    if (parseInt(message.content, 10) !== config.currentNumber + config.increment) {
        message.react("❌");
        config.lastUpdatedId = message.author.id;
        config.currentNumber = 0;
        fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });
        message.channel.send({
            embed: {
                color: config.info_color,
                title: "❌ wrong number",
                description: `the count has reset to 0\nthe increment is ${config.increment}`,
                footer: {
                    text: "idiot"
                }
            }
        })
        return true;
    }
    if (config.lastUpdatedId === message.author.id) {
        message.react("❌");
        config.lastUpdatedId = message.author.id;
        config.currentNumber = 0;
        fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });
        message.channel.send({
            embed: {
                color: config.info_color,
                title: "❌ talking out of turn",
                description: `the count has reset to 0\nthe increment is ${config.increment}`,
                footer: {
                    text: "idiot"
                }
            }
        })
        return true;
    }
    config.lastUpdatedId = message.author.id;
    config.currentNumber += config.increment;
    fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
        if (err) return console.log(err);
    });
    //message.react("✔");
    message.react("☑️");
    return true;
}