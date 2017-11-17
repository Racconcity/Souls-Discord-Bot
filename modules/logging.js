/**
 * Created by Doge on 3/19/2017.
 */

var moment = require('moment');

var log = function(toLog) {
    console.log(moment().format("MM/DD-HH:mm") + ": " + toLog);
};
module.exports.log = log;

module.exports.logCommand = function(msg) {
    let toRet = "";
    if (msg.guild) {
        toRet += msg.guild.name + "; Ch " + msg.channel.name + "; " + msg.author.username;
    } else {
        toRet += "PM; " + msg.author.username;
    }
    log(toRet + "; " + msg.content);
};