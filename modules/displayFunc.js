/**
 * Created by Doge on 1/9/2017.
 */

var cards = require('./cards');
module.exports = {};

//all display functions return embed objects.

function displayImg(cardName) {
    console.log(cards.cardData[cardName].img);
    return {image: {url:cards.cardData[cardName].img}};
}
module.exports.displayImg = displayImg;

function displayFlair(cardName) {
    let card = cards.cardData[cardName];
    formattedText = `*${card.flair.trim()}*`;
    return {
        title: card.name,
        description: `*${card.flair}*`,
        thumbnail: {url: card.img}
    };
}
module.exports.displayFlair = displayFlair;

function displayLink(cardName) {
    let card = cards.cardData[cardName];
    return {
        title: card.name,
        description: card.link,
        thumbnail: {url: card.img}
    };
}
module.exports.displayLink = displayLink;