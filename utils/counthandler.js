const fs = require("fs");

module.exports = async (message) => {
    const config = require("../config.json");
    if (message.channel.id !== "769849916582789140") return false;
    if (!parseInt(message.content, 10) || /[^0-9]+/.test(message.content)) {
        message.delete();
        return true;
    }
    //const rmsgs = await message.channel.messages.fetch({ limit: 2 });
    //if (parseInt(message.content, 10) !== parseInt((rmsgs.array())[1].content, 10) + 1) {
    if (!config.currentNumber && config.currentNumber !== 0) config.currentNumber = 0;
    if (parseInt(message.content, 10) !== config.currentNumber + config.increment) {
        message.react("❌");
        config.currentNumber = 0;
        fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });
        message.channel.send({
            embed: {
                color: 6969,
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
        config.currentNumber = 0;
        fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });
        message.channel.send({
            embed: {
                color: 6969,
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
    message.react("✔");
    return true;
}