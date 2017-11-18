/**
 * Created by Doge on 1/9/2017.
 */

var request = require("request");
var fs = require('fs');

module.exports = {};
var cardData = {};
var cardDataF = {}; //for all eras at once.
cardsList = {};
cardsListF = [];
var eras;

function eraDeterminer(era) {
    if (eras.indexOf(era.toUpperCase()) > -1) {
        return era.toUpperCase();
    }
    return false;
}
module.exports.eraDeterminer = eraDeterminer;

function getCardList(era) {
    if (era) {
        return cardsList[era];
    }
    return cardsListF;
}
module.exports.getCardList = getCardList;

function getCard(cardName, era) {
    if (era) {
        return cardData[era][cardName];
    }
    for (var ii=0; ii < eras.length; ii++) {
        era = eras[ii];
        if (cardData[era].hasOwnProperty(cardName)) {
            return cardData[era][cardName];
        }
    }
    console.log("Bad getcard call", cardName, era);
}
module.exports.getCard = getCard;

function doesTermMatchCard(term, era, cardName) {
    return getCard(cardName, era).searchableText.includes(term.toLowerCase());
}
module.exports.doesTermMatchCard = doesTermMatchCard;

function formatCardData(era, cards) {
    cardData[era] = {};
    for (var cardName in cards) {
        if (cards.hasOwnProperty(cardName)) {
            card = cards[cardName];
            card.name = cardName;
            card.era = era;
            cardData[era][cardName.toLowerCase()] = card;
            cardDataF[cardName.toLowerCase()] = card; //Note that this WILL overwrite
            //in the case of multiple games with the same object.
            card.searchableText = (cardName + " " + card.flair).toLowerCase();
        }
    }
    cardsList[era] = Object.keys(cardData[era]);
}

function buildCardData(callback) {
    ["ds1", "ds2", "ds3", "bb"].forEach(function(x) {
        var body = fs.readFileSync(x + ".json").toString();
        var cards = JSON.parse(body.replace(/\<br\>/g, "\\n"));
        formatCardData(x.toUpperCase(), cards);
    });
    cardsListF = Object.keys(cardDataF);
    eras = Object.keys(cardData);
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