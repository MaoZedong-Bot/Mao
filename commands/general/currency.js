const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('currency')
        .setDescription('Convert currencies')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of currency')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('currency')
                .setDescription('The origin currency')
                .setRequired(true)
                .addChoices(
                    { name: 'AUD - Australian Dollar', value: "AUD" },
                    { name: 'BRL - Brazilian Real', value: "BRL" },
                    { name: 'CAD - Canadian Dollar', value: "CAD" },
                    { name: 'CHF - Swiss Franc', value: "CHF" },
                    { name: 'CNY - Chinese Renminbi Yuan', value: "CNY" },
                    { name: 'DKK - Danish Krone', value: "DKK" },
                    { name: 'EUR - Euro', value: "EUR" },
                    { name: 'GBP - British Pound', value: "GBP" },
                    { name: 'HUF - Hungarian Forint', value: "HUF" },
                    { name: 'IDR - Indonesian Rupiah', value: "IDR" },
                    { name: 'INR - Indian Rupee', value: "INR" },
                    { name: 'JPY - Japanese Yen', value: "JPY" },
                    { name: 'MXN - Mexican Peso', value: "MXN" },
                    { name: 'MYR - Malaysian Ringgit', value: "MYR" },
                    { name: 'NOK - Norwegian Krone', value: "NOK" },
                    { name: 'NZD - New Zealand Dollar', value: "NZD" },
                    { name: 'PHP - Philippine Peso', value: "PHP" },
                    { name: 'PLN - Polish Złoty', value: "PLN" },
                    { name: 'RON - Romanian Leu', value: "RON" },
                    { name: 'SEK - Swedish Krona', value: "SEK" },
                    { name: 'SGD - Singapore Dollar', value: "SGD" },
                    { name: 'THB - Thai Baht', value: "THB" },
                    { name: 'TRY - Turkish Lira', value: "TRY" },
                    { name: 'USD - United States Dollar', value: "USD" },
                    { name: 'ZAR - South African Rand', value: "ZAR" },
                )
        )
        .addStringOption(option =>
            option.setName('convert_to')
                .setDescription('The currency to convert to. Leave empty for all currencies')
                .setRequired(false)
                .addChoices(
                    { name: 'AUD - Australian Dollar', value: "AUD" },
                    { name: 'BRL - Brazilian Real', value: "BRL" },
                    { name: 'CAD - Canadian Dollar', value: "CAD" },
                    { name: 'CHF - Swiss Franc', value: "CHF" },
                    { name: 'CNY - Chinese Renminbi Yuan', value: "CNY" },
                    { name: 'DKK - Danish Krone', value: "DKK" },
                    { name: 'EUR - Euro', value: "EUR" },
                    { name: 'GBP - British Pound', value: "GBP" },
                    { name: 'HUF - Hungarian Forint', value: "HUF" },
                    { name: 'IDR - Indonesian Rupiah', value: "IDR" },
                    { name: 'INR - Indian Rupee', value: "INR" },
                    { name: 'JPY - Japanese Yen', value: "JPY" },
                    { name: 'MXN - Mexican Peso', value: "MXN" },
                    { name: 'MYR - Malaysian Ringgit', value: "MYR" },
                    { name: 'NOK - Norwegian Krone', value: "NOK" },
                    { name: 'NZD - New Zealand Dollar', value: "NZD" },
                    { name: 'PHP - Philippine Peso', value: "PHP" },
                    { name: 'PLN - Polish Złoty', value: "PLN" },
                    { name: 'RON - Romanian Leu', value: "RON" },
                    { name: 'SEK - Swedish Krona', value: "SEK" },
                    { name: 'SGD - Singapore Dollar', value: "SGD" },
                    { name: 'THB - Thai Baht', value: "THB" },
                    { name: 'TRY - Turkish Lira', value: "TRY" },
                    { name: 'USD - United States Dollar', value: "USD" },
                    { name: 'ZAR - South African Rand', value: "ZAR" },
                )
        ),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount') ?? 1;
        const convert_from = interaction.options.getString('currency');
        const convert_to = interaction.options.getString('convert_to') ?? null;

        const fallbackCurrencies = ["AUD", "EUR", "GBP", "NZD", "USD"]

        var url;
        if (!convert_to) {
            url = `https://api.frankfurter.dev/v1/latest?base=${convert_from}&symbols=${fallbackCurrencies.join(',')}`;
            const json = await axios.get(`${url}`);
            const jsonData = json.data;
            const rates = jsonData.rates;
            var response = `${(amount ?? 1)} **${convert_from}** is equal to:\n`;
            fallbackCurrencies.forEach(currency => {
                if (currency == convert_from) return;
                const rate = rates[currency];
                const convertedAmount = (amount ?? 1) * rate;
                response += `${convertedAmount.toFixed(2)} **${currency}**\n`;
            });
            await interaction.reply(response);
        } else {
            url = `https://api.frankfurter.dev/v1/latest?base=${convert_from}&symbols=${convert_to}`;
            const json = await axios.get(`${url}`);
            const jsonData = json.data;
            const rate = jsonData.rates[convert_to];
            const convertedAmount = (amount ?? 1) * rate;
            await interaction.reply(`${(amount ?? 1)} **${convert_from}** is equal to ${convertedAmount.toFixed(2)} **${convert_to}**`);
        }

    }
}