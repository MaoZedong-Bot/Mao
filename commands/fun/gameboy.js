const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Gameboy = require('serverboy');
const { PNG } = require('pngjs');
const fetch = require('node-fetch');

const BUTTONS = ['A', 'B', 'Up', 'Down', 'Left', 'Right', 'Start', 'Select'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gameboy')
        .setDescription('Run GameBoy and GameBoy Color games')
        .addAttachmentOption(option =>
            option
                .setName('rom')
                .setDescription('Upload any .gb or .gbc ROM')
                .setRequired(true)
        ),

    async execute(interaction) {
        const rom = interaction.options.getAttachment('rom');

        if (!(rom.name.endsWith('.gb') || rom.name.endsWith('.gbc'))) {
        return interaction.reply({
            content: `Invalid file extension. Only \`.gb\` or \`.gbc\` files are allowed.`,
            ephemeral: true
        });
        }

        await interaction.reply(`Loading ROM **${rom.name}**`);

        if (rom.name.endsWith('.gbc')) {
        await interaction.followUp({
            content: `GameBoy Color games may not render properly.`,
            ephemeral: false
        });
        }

        console.log(rom.name, rom.url, rom.contentType, rom.size);

        const gameboy = new Gameboy();
        const res = await fetch(rom.url);
        const romBuffer = await res.buffer();
        gameboy.loadRom(romBuffer);

        // Run initial frames to let the ROM load
        for (let i = 0; i < 60; i++) gameboy.doFrame();

        let lastScreen = gameboy.getScreen();
        let pngBuffer = updateScreen(gameboy);

        // Add button
        const controlRows = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('A').setLabel('A').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('B').setLabel('B').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('Start').setLabel('Start').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('Select').setLabel('Select').setStyle(ButtonStyle.Secondary)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('Up').setLabel('Up').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('Down').setLabel('Down').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('Left').setLabel('Left').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('Right').setLabel('Right').setStyle(ButtonStyle.Success)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('Continue').setLabel('Continue Until Change').setStyle(ButtonStyle.Danger)
            )
        ];

        const frameMessage = await interaction.editReply({
            content: `**${rom.name}** - First frame`,
            files: [{ attachment: pngBuffer, name: `${rom.name}.png` }],
            components: controlRows
        });

        // Button collector
        const collector = frameMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 10 * 60_000
        });

        collector.on('collect', async i => {
            await i.deferUpdate();
            //if (!BUTTONS.includes(i.customId)) return;

            if (i.customId === 'Continue') {
                // Run asynchronously
                (async () => {
                    const maxFrames = 10000;
                    let screenChanged = false;
                    let framesRan = 0;

                    for (let f = 0; f < maxFrames; f++) {
                        gameboy.doFrame();
                        framesRan++;
                        const currentScreen = gameboy.getScreen();

                        if (screensAreDifferent(lastScreen, currentScreen)) {
                            lastScreen = currentScreen;
                            screenChanged = true;
                            break;
                        }

                        // Optional: small sleep to avoid blocking Discord updates
                        if (f % 60 === 0) await sleep(1);
                    }

                    const newPng = screenChanged ? updateScreen(gameboy) : null;
                    await frameMessage.edit({
                        content: screenChanged
                            ? `**${rom.name}** - Screen changed (Frames run: ${framesRan})`
                            : `**${rom.name}** - No change detected after ${maxFrames} frames`,
                        files: screenChanged ? [{ attachment: newPng, name: `${rom.name}.png` }] : [],
                        components: controlRows
                    });
                })();
            } else {
                // Manual button handling
                const key = Gameboy.KEYMAP[i.customId.toUpperCase()];
                if (key) {
                    gameboy.pressKey(key);
                    for (let f = 0; f < 10; f++) gameboy.doFrame();
                }
                const currentScreen = gameboy.getScreen();
                const newPng = updateScreen(gameboy);
                lastScreen = currentScreen;

                await frameMessage.edit({
                    content: `**${rom.name}** - Button ${i.customId} pressed`,
                    files: [{ attachment: newPng, name: `${rom.name}.png` }],
                    components: controlRows
                });
            }
        });
    }
};

function updateScreen(gameboy) {
  const screen = gameboy.getScreen();
  const png = new PNG({ width: 160, height: 144 });
  png.data = Buffer.from(screen);
  return PNG.sync.write(png);
}

function screensAreDifferent(screen1, screen2) {
  if (!screen1 || !screen2) return true;
  if (screen1.length !== screen2.length) return true;
  for (let i = 0; i < screen1.length; i++) {
    if (screen1[i] !== screen2[i]) return true;
  }
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
