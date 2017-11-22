/**
 * Created by Doge on 12/13/2016.
 */
var Discord = require("discord.js");
var fs = require("fs");
var request = require("request");
var cards = require('./modules/cards');
var display = require('./modules/displayFunc');
var log = require('./modules/logging');

var bot = new Discord.Client();

var loginToken = process.env.DS_DISCORD_TOKEN;
var blacklist = process.env.DISC_BLACKLIST.split(";");
var prefix = "-";
var messgQ = {};
var botUserQ = {};
var bypassID = process.env.DISC_BYPASSMOD.split(";"); //this gives supermod perms
var shutdown = false;

const Q_SIZE = 50;
const DISC_INV = "https://discord.gg/9GfkagF";
const colors = {blue:"33023", green:"3997500", red:"16727100"};


function defaultChannel(guild) {
    return guild.defaultChannel || guild.channels.get("358013891948576778");
}

bot.on("message", msg => {
    if (msg.content.startsWith(prefix) &&
        msg.content.length > 1 && !msg.author.bot) {
        try {
            let args = msg.content.substring(1).split(" ");
            let command = args[0].toLowerCase();
            let era = cards.eraDeterminer(command);
            if (era) {
                command = args[1].toLowerCase();
                args.shift();
            }
            log.logCommand(msg);
            if (["name"].indexOf(command) > -1) {
                cardNameCommand(args, era, msg);
            } else if (["random"].indexOf(command) > -1) {
                randomCard(era, msg);
            } else if (["search"].indexOf(command) > -1) {
                cardSearchCommand(args, era, msg);
            } else if (["link"].indexOf(command) > -1) {
                cardSearchCommand(args, era, msg, display.displayLink);
            } else if (["img"].indexOf(command) > -1) {
                cardSearchCommand(args, era, msg, display.displayImg);
            } else if (memeDict.hasOwnProperty(command)) {
                meme(memeDict[command], msg);
            } else if (["help", "man"].indexOf(command) > -1) {
                helpCommand(msg);
            } else if (isSuperMod(msg.member)) {
                if (["destroy"].indexOf(command) > -1) {
                    console.log("Logging out.");
                    shutdown = true;
                    bot.destroy();
                } else if (command == "clean") {
                    cleanChannel(msg, msg.channel);
                } else {
                    cardSearchCommand(["search"].concat(args), era, msg);
                }
            } else if (isModEquiv(msg.member)) {
                if (command == "clean") {
                    cleanChannel(msg, msg.channel);
                } else {
                    cardSearchCommand(["search"].concat(args), era, msg);
                }
            } else {
                cardSearchCommand(["search"].concat(args), era, msg);
            }
        } catch (err) {
            log.log(`Couldn't process ${msg.content} on ${(msg.guild) ? msg.guild.name : "PM"} by ${msg.author.name}`);
        }
    }
});

function isModEquiv(member) {
    return member && (bypassID.indexOf(member.id) > -1 || member.permissions.has("MANAGE_MESSAGES"));
}
function isSuperMod(member) {
    return (bypassID.indexOf(member.id) > -1);
}

var memeDict = {
    'praise':'ds/praisehd.png',
    'chaoszwei':'ds/chaoszwei.jpg'
};

bot.on('ready', () => {
    log.log(`Logged on to ${bot.guilds.map(x => {
        x.fetchMember(bot.user).then(botmember => {
            botUserQ[x.id] = botmember;
        });
        return x.name;
    })}`);
    Array.from(bot.guilds.values()).forEach(x => {
        if (blacklist.indexOf(x.id) > -1) {
            log.log("Found blacklisted guild on login: " + x.name + " " + x.id);
            x.leave();
        }
    });
    setTimeout(function() {
        console.log("Setting icon");
        bot.user.setAvatar('icons/icon2.jpg').catch(log.log);
        bot.user.setGame("Dark Souls IIII").catch(log.log);
    }, 5000);
});
bot.on("guildCreate", (guild) => {
    log.log("Joined " +  guild.name + " " + guild.id);
    if (blacklist.indexOf(guild.id) > -1) {
        log.log("Blacklisted guild! Leaving.");
        guild.leave();
    } else {
        guild.fetchMember(bot.user).then(botmember => {
            botUserQ[guild.id] = botmember;
        });
        sendMessage(defaultChannel(guild), "Bagoum Souls Bot has successfully joined the server!", true);
    }
});

bot.on("disconnect", () => {
    log.log("Bot disconnected! Shutdown is set to " + shutdown);
    if (!shutdown) {
        bot.login(loginToken);
    }
});

//MESSAGE HANDLING

function sendMessage(channel, message, overridePermCheck=false, color="green") {
    if (!channel) { return; }
    if (channel instanceof Discord.TextChannel) {
        let gid = channel.guild.id;
        if (!overridePermCheck &&
            (!botUserQ.hasOwnProperty(gid) || !channel.permissionsFor(botUserQ[gid]).has(["SEND_MESSAGES"]))) {
            log.log(`Could not send message. Guild: ${channel.guild.name} Channel: ${channel.name}`);
            return;
        }
    }
    channel.send(options={embed:{description:message, color:colors[color]}})
        .then(message => {
            addMessageToQueue(channel, message);
        })
        .catch(console.log);
}
function sendEmbed(channel, embed, overridePermCheck=false, color="", footer=true) {
    if (!channel) { return; }
    if (channel instanceof Discord.TextChannel) {
        let gid = channel.guild.id;
        if (!overridePermCheck &&
            (!botUserQ.hasOwnProperty(gid) || !channel.permissionsFor(botUserQ[gid]).has(["SEND_MESSAGES"]))) {
            log.log(`Could not send embed. Guild: ${channel.guild.name} Channel: ${channel.name}`);
            return;
        }
    }
    if (color) {
        embed.color = colors[color];
    }
    if (footer) {
        embed.footer = {
            icon_url: "http://sv.bagoum.com/logo_white.png",
            text: "Bot by Bagoum: ds.bagoum.com"
        }
    }
    channel.send(options={embed:embed})
        .then(message => {
            addMessageToQueue(channel, message);
        })
        .catch(console.log);
}

function addMessageToQueue(channel, message) {
    let channel_id = channel.id;
    if (!messgQ[channel_id]) {
        messgQ[channel_id] = {
            'index': -1,
            'queue': []
        };
    }
    let queue = messgQ[channel_id];
    queue.index = (queue.index + 1) % Q_SIZE;
    if (queue.queue.length == Q_SIZE) {
        queue.queue[queue.index] = message;
    } else {
        queue.queue.push(message);
    }
}

function cleanChannel(msg, channel) {
    let queue = messgQ[channel.id];
    if (queue) {
        for (var i = 0; i < queue.queue.length; i++) {
            let message = queue.queue[i];
            message.delete();
        }
        messgQ[channel.id] = null;
    }
    sendMessage(
        channel,
        "Cleaned messages."
    );
}

//CARD COMMANDS

function cardNameCommand(args, era, msg) {
    let subname = args.slice(1).join(" ").toLowerCase();
    let cardNames = cards.getCardList(era).filter(function (name) {
        return name.includes(subname);
    });
    outputCards(msg, era, cardNames, display.displayFlair);
}


function cardSearchCommand(args, era, msg, displayFunc = display.displayFlair) {
    let cardNames = cards.getCardList(era);
    givenSearch = args.slice(1).join(" ").toLowerCase();
    for (var ci = 0; ci < cardNames.length; ci++) {
        if (cardNames[ci] == givenSearch) {
            outputCards(msg, era, [cardNames[ci]], displayFunc);
            return;
        }
    }
    for (var i = 1; i < args.length; i++) {
        cardNames = cardNames.filter(function (cardName) {
            return cards.doesTermMatchCard(args[i], era, cardName);
        });
    }
    outputCards(msg, era, cardNames, displayFunc);
}

function randomCard(era, msg) {
    let cardList = cards.getCardList(era);
    outputCards(msg, era, [cardList[cardList.length * Math.random() << 0]], display.displayFlair);
}

function outputCards(msg, era, cardNames, displayFunc) {
    if (cardNames.length == 1) {
        sendEmbed(msg.channel, displayFunc(cardNames[0], era), undefined, "green");
        //TODO
    } else if (cardNames.length > 1 && cardNames.length <= 32) {
        sendMessage(
            msg.channel,
            "I found these objects: " +
            cardNames.map(function (cardName) {
                return cards.getCard(cardName, era).name;
            }).join(", ")
        );
    } else if (cardNames.length > 32) {
        sendMessage(
            msg.channel,
            "I found " + cardNames.length + " objects. Please limit your search."
        );
    } else {
        sendMessage(
            msg.channel,
            "I can't find that object."
        );
    }
}

//LINK COMMANDS

function helpCommand(msg) {
    msg.author.sendMessage(
        "Prefix any command with ds3 (or ds2,ds1,bb) to limit searches to that game.\n\n" +
        "__-name__ _name_\n" +
        "Shows the item description for the query that matches the name\n" +
        "__-search__ _term1 term2_...\n" +
        "Shows the item description for the query that matches the terms\n" +
        "__-img__ _term1 term2_...\n" +
        "Shows the image for the query that matches the terms\n" +
        "__-link__ _term1 term2_...\n" +
        "Links to the wiki for the query that matches the terms\n" +
        "__-random__\n" +
        "Gets a random Dark Souls thing\n" +
        "__-clean__\n" +
        `Deletes the last ${Q_SIZE} messages by this bot. Requires mod permissions.\n` +
        `\nPlease report any issues to ElDynamite#4773 on the Bagoum server: ${DISC_INV}\nAdd this bot to your server here: https://discordapp.com/oauth2/authorize?client_id=380988051679215616&scope=bot`
    );
    sendMessage(msg.channel, `${msg.author.username}, I've sent you a list of commands via PM.`);
}

function meme(imgLink, msg) {
    sendEmbed(msg.channel,
        {image:{url:"http://www.bagoum.com/images/memes/" + imgLink}});
}

//INIT

function initializeData(callback) {
    log.log("Starting...");
    cards.buildCardData(function (err) {
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
}

initializeData((err) => {
    if (err) {
        return console.log(err);
    }
    bot.login(loginToken);
});