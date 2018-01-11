/**
 * Created by Doge on 1/9/2017.
 */

var cards = require('./cards');
module.exports = {};

//all display functions return embed objects.

function displayImg(cardName, era) {
    let card = cards.getCard(cardName, era);
    return {image: {url:card.img}};
}
module.exports.displayImg = displayImg;

function displayFlair(cardName, era) {
    let card = cards.getCard(cardName, era);
    formattedText = `*${card.flair.trim()}*`;
    return {
        title: `${card.name} (${card.era})`,
        description: `*${card.flair}*`,
        thumbnail: {url: card.img}
    };
}
module.exports.displayFlair = displayFlair;

function displayLink(cardName, era) {
    let card = cards.getCard(cardName, era);
    return {
        title: `${card.name} (${card.era})`,
        description: card.link,
        thumbnail: {url: card.img}
    };
}
module.exports.displayLink = displayLink;