/**
 * Created by Doge on 1/9/2017.
 */

var request = require("request");
var fs = require('fs');

module.exports = {};
var cardData = {};
module.exports.cardData = cardData;

function doesTermMatchCard(term, cardName) {
    return cardData[cardName].searchableText.includes(term.toLowerCase());
}
module.exports.doesTermMatchCard = doesTermMatchCard;

function formatCardData(cards) {
    for (var cardName in cards) {
        if (cards.hasOwnProperty(cardName)) {
            card = cards[cardName];
            card.name = cardName;
            cardData[cardName.toLowerCase()] = card;
            card.searchableText = (cardName + " " + card.flair).toLowerCase();
        }
    }
}

function buildCardData(callback) {
    body = fs.readFileSync("ds3.json").toString();
    var cards = JSON.parse(body.replace(/\<br\>/g, "\\n"));
    formatCardData(cards);
    module.exports.cardsList = Object.keys(module.exports.cardData);
    return callback(null);
    /*
    request("http://ds.bagoum.com/dsInfo.json", function (err, resp, body) {
        if (err) {
            return callback(err);
        }
        if (resp.statusCode != 200) {
            return callback("Invalid status code: " + resp.statusCode);
        }
        var cards = JSON.parse(body.replace(/\<br\>/g, "\\n"));
        formatCardData(cards);
        module.exports.cardsList = Object.keys(module.exports.cardData);
        return callback(null);
    });*/
}
module.exports.buildCardData = buildCardData;