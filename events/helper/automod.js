const { Events } = require('discord.js');

const fs = require('fs');
const path = require('path');

async function autoModeration(message, interaction) {
    const prohibitedWords = LoadBadWords();

    console.log(`Checking message: ${message}`);

    const refinedRegexPattern = new RegExp(
        prohibitedWords.map(word => {
            const wordPattern = WordFilter(word);
            return `(?<!\\w)${wordPattern}(?!\\w)`;
        }).join('|'),
        'gi'
    );

    const inviteLinkRegex = /(?:https?:\/\/)?(?:www\.|ptb\.|canary\.)?(?:discord\.gg|discord(?:app)?\.(?:com|gg)\/(?:invite|servers))\/[a-z0-9-_]+/gi;

    if (refinedRegexPattern.test(message) || inviteLinkRegex.test(message)) {
        const msgId = interaction.id
        const chn = interaction.channel;
        const msg = await chn.messages.fetch(msgId);
        deleteMessage(msg);
    }
}

function LoadBadWords() {
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

function WordFilter(word) {
    const substitutions = {
        'a': '[aаáâäàãåā4@]',
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

async function deleteMessage(message) {
    await message.delete()
}

// I have yet to figure out what this thing does
function escape(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
    autoModeration,
}