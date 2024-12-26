const { PermissionFlagsBits, PermissionsBitField } = require('discord.js');

const fs = require('fs');
const path = require('path');

async function autoModeration(message, interaction) {

    const { log } = require('../../commands/mod/helper/log');

    if(interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) || interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return;
    }

    const bot = interaction.guild.members.me;
    
    if (!bot.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
        return;
    }

    const prohibitedWords = loadBadWords();

    const refinedRegexPattern = new RegExp(
        prohibitedWords.map(word => {
            const wordPattern = wordFilter(word);
            return `(?<!\\w)${wordPattern}(?!\\w)`;
        }).join('|'),
        'gi'
    );

    const inviteLinkRegex = /(?:https?:\/\/)?(?:www\.|ptb\.|canary\.)?(?:discord\.gg|discord(?:app)?\.(?:com|gg)\/(?:invite|servers))\/[a-z0-9-_]+/gi;


    const matches = message.match(refinedRegexPattern);

    if (matches || inviteLinkRegex.test(message)) {
        if (matches) {
            const matchedWords = matches.map(match => {
                return prohibitedWords.find(word => new RegExp(wordFilter(word), 'gi').test(match));
            }).filter(Boolean);

            const msgId = interaction.id;
            const chn = interaction.channel;
            const msg = await chn.messages.fetch(msgId);
            punish(msg, interaction, matchedWords);
        } else {
            const msgId = interaction.id;
            const chn = interaction.channel;
            const msg = await chn.messages.fetch(msgId);
            punish(msg, interaction, matchedWords);
        }
    }
}

function loadBadWords() {
    const filePath = path.resolve(__dirname, 'badwords.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(data);
        return json.prohibitedWords || [];
    } catch (error) {
        console.error('oops', error);
        return [];
    }
}

function wordFilter(word) {
    const substitutions = {
        'a': '[aаáâäàãåā49@]',
        'b': '[bв8]',
        'c': '[cсςćč]',
        'd': '[dԁđ]',
        'e': '[eеéèêëēėę3]',
        'f': '[fғ]',
        'g': '[gğġ6]',
        'h': '[hһ#]',
        'i': '[iіíìîïīįı1!]',
        'j': '[jј]',
        'k': '[kκ]',
        'l': '[lӏ1]',
        'm': '[mм]',
        'n': '[nпñń]',
        'o': '[oоóòôöõøō0]',
        'p': '[pр]',
        'q': '[qɋ]',
        'r': '[rг]',
        's': '[sѕ$5]',
        't': '[tт7]',
        'u': '[uυúùûüū]',
        'v': '[vν]',
        'w': '[wω]',
        'x': '[xх]',
        'y': '[yуýÿ]',
        'z': '[zźżž2]',
        'č': '[č]',
    };

    const plurals = '(?:s|es|ies|ie)?'; // This works I think

    return word.split('').map(char => {
        return `(${substitutions[char.toLowerCase()] || escape(char)})[\\W_]*`;
    }).join('') + plurals;
}

async function punish(message, interaction, matchedWord) {

    const dictionary = ['nigger', 'nigga', 'nigglet', 'nigr', 'nigg']
    const { log } = require('../../commands/mod/helper/log');


    await message.delete()
    await interaction.channel.send(`<@${interaction.author.id}> you cant be saying that !!`)
    const targetID = await interaction.guild.members.fetch(interaction.author.id);
    let isMatch = false;
    for (let i = 0; i < matchedWord.length; i++){
        isMatch = dictionary.includes(matchedWord[i]);
        if(isMatch) break;
    }
    if (isMatch) {
        targetID.timeout(43200000, 'N word');
        log(interaction, 3, interaction.content, interaction.author, 'N word', `12h`, true);
        await interaction.channel.send(`<@${interaction.author.id}> was timed out for **12h**: ***N word.***`);
    } else {
        log(interaction, 3, interaction.content, interaction.author, null, null, false);
    }

}

// I have yet to figure out what this thing does
function escape(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
    autoModeration,
}