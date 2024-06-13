const fs = require('fs');
const path = require('path');

function autoModeration(message) {
    const prohibitedWords = LoadBadWords();

    console.log(`Checking message: ${message.content}`);

    const refinedRegexPattern = new RegExp(
        prohibitedWords.map(word => {
            const wordPattern = WordFilter(word);
            return `(?<!\\w)${wordPattern}(?!\\w)`;
        }).join('|'),
        'gi'
    );

    const inviteLinkRegex = /(?:https?:\/\/)?(?:www\.|ptb\.|canary\.)?(?:discord\.gg|discord(?:app)?\.(?:com|gg)\/(?:invite|servers))\/[a-z0-9-_]+/gi;

    if (refinedRegexPattern.test(message.content) || inviteLinkRegex.test(message.content)) {
        deleteMessage(message);
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
        'a': '[aаáâäàãåā]',
        'b': '[bв]',
        'c': '[cсςćč]',
        'd': '[dԁđ]',
        'e': '[eеéèêëēėę]',
        'f': '[fғ]',
        'g': '[gğġ]',
        'h': '[hһ]',
        'i': '[iіíìîïīįı]',
        'j': '[jј]',
        'k': '[kκ]',
        'l': '[lӏ]',
        'm': '[mм]',
        'n': '[nпñń]',
        'o': '[oоóòôöõøō]',
        'p': '[pр]',
        'q': '[qɋ]',
        'r': '[rг]',
        's': '[sѕ]',
        't': '[tт]',
        'u': '[uυúùûüū]',
        'v': '[vν]',
        'w': '[wω]',
        'x': '[xх]',
        'y': '[yуýÿ]',
        'z': '[zźżž]',
        'č': '[č]',
    };

    const plurals = '(?:s|es|ies|ie)?'; // This works I think

    return word.split('').map(char => {
        return `(${substitutions[char.toLowerCase()] || escape(char)})[\\W_]*`;
    }).join('') + plurals;
}

function deleteMessage(message) {
    message.delete()
        .then(() => {
            message.channel.send(`${message.author}, Do you kiss your mother with that mouth?`);
            console.log(`Deleted message from ${message.author.tag}`);
        })
        .catch(console.error);
}

// I have yet to figure out what this thing does
function escape(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { autoModeration };
