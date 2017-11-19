# Bagoum Souls
#### Discord bot for Dark Souls.

## Usage
You can add this bot to your server [here](https://discordapp.com/oauth2/authorize?client_id=380988051679215616&scope=bot). 

Functionality is simple. You can search up a card by parts of its description (default) or by name, and the bot will return its description.

(Capitalization is for emphasis. The bot ignores capitalization.)

```
-NAME greatsword of artorias
-hunted the darkwraiths
-SEARCH hunted the darkwraiths
```
^These all return Greatsword of Artorias from DS1.

You can limit a search to a specific game by putting ds3, ds2, ds1, or bb in front of the command. Bloodborne support is experimental, let me know if there are problems.

```
-DS3 brigand armor
-DS2 brigand armor
```
^These will return two different Brigand Armors!

You can also request the image of the search object, or a link to wikia for the object. 

```
-IMG friede scythe
-DS1 LINK moonlight greatsword
```

Finally, you can get a random thing using `-random`. You can use `-ds1 random` to get game-specific random things.


The bot reflects data from http://darksouls.wikia.com and http://bloodborne.wikia.com , which has been cached in the JSON files for speed of access.
