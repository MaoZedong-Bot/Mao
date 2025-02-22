const { SlashCommandBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

const cheerio = require('cheerio');

async function searchPhonearena(interaction, query1, query2, query3) {

    const url = "https://www.phonearena.com/phones/size";
    let headers = { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest", "Referer": "https://www.phonearena.com/phones/size" };

    let phones1 = [];
    let phones2 = [];
    let phones3 = [];

    phones1 = fetch(url, { method: "POST", body: `phone_name=${query1}&items=[]`, headers }).then(res => res.json());

    phones2 = fetch(url, { method: "POST", body: `phone_name=${query2}&items=[]`, headers }).then(res => res.json());

    if (query3 !== null) {
        phones3 = fetch(url, { method: "POST", body: `phone_name=${query3}&items=[]`, headers }).then(res => res.json());
    }

    let phoneNames1 = [];
    let phoneNames2 = [];
    let phoneNames3 = [];
    let devices1 = [];
    let devices2 = [];
    let devices3 = [];

    phones1.forEach(phone => {
        phoneNames1.push(phone.label);
        devices1.push({id: phone.value, name: phone.readableName});
    })

    phones2.forEach(phone => {
        phoneNames2.push(phone.label);
        devices2.push({id: phone.value, name: phone.readableName});
    })

    if (query3 !== null) {
        phones3.forEach(phone => {
            phoneNames3.push(phone.label);
            devices3.push({id: phone.value, name: phone.readableName});
        })

        return { "phoneNames1": phoneNames1, "phoneNames2": phoneNames2,
            "phoneNames3": phoneNames3, "devices1": devices1,
            "devices2": devices2, "devices3": devices3 };
    } else {
        return { "phoneNames1": phoneNames1, "phoneNames2": phoneNames2,
            "devices1": devices1, "devices2": devices2 };
    }
}

async function getPhones(phone1, phone2, phone3, id1, id2, id3) {
    // get the actual size data and images
    const response = await fetch(`https://www.phonearena.com/phones/size/Google-Pixel-6-Pro,Samsung-Galaxy-S24/phones/11733,12113`);
    const html = await response.text();
    const $ = cheerio.load(html);

    let results = [];

    $('.widgetSizeCompare__compare_standardView .widgetSizeCompare__phoneTemplate_phone').each((_, phoneElement) => {
        const phone = $(phoneElement);
        const phoneName = phone.attr('data-name') || 'Unknown Phone';

        const images = [];

        phone.find('.widgetSizeCompare__phoneTemplate_phone_image_middle_front, .widgetSizeCompare__phoneTemplate_phone_image_middle_side').each((_, imgElement) => {
            const img = $(imgElement);
            const parentPhone = img.closest('.widgetSizeCompare__phoneTemplate_phone');
            images.push({
                src: img.attr('src'),
                height: img.attr('height'),
                realHeight: parentPhone.attr('data-height')
            });
        });

        results.push({
            phone: phoneName,
            images
        });
    });



    console.log(results[0].images);

    let frontImages = [];
    results.forEach(result => {
        frontImages.push(result.images[0]);
    })

    let sideImages = [];
    results.forEach(result => {
        sideImages.push(result.images[1]);
    })


    await processPhoneImages(frontImages, sideImages);
    return;
}

async function overlayFrontImages(images) {
    try {
        // Load all images
        const loadedImages = await Promise.all(images.map(async (img) => {
            const image = await loadImage(img.src);
            console.log(img.realHeight)
            return {
                image,
                realHeight: parseFloat(img.realHeight),
                width: image.width,
                height: image.height
            };
        }));

        const maxRealHeight = Math.max(...loadedImages.map(img => img.realHeight));

        loadedImages.forEach(img => {
            console.log(img);
            img.scaleFactor = img.realHeight / maxRealHeight;
            img.scaledHeight = 600 * img.scaleFactor;
            img.scaledWidth = (img.width / img.height) * img.scaledHeight;
            console.log(`${img.scaledWidth} width`)
        });

        const canvasWidth = Math.max(...loadedImages.map(img => img.scaledWidth));
        const canvasHeight = 600;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.globalAlpha = 0.7;

        const borderColors = ['red', 'blue', 'green'];

        loadedImages.forEach((img, index) => {
            const xOffset = 0; // Align to the left
            const yOffset = canvasHeight - img.scaledHeight;

            ctx.globalAlpha = 0.7;
            ctx.drawImage(img.image, xOffset, yOffset, img.scaledWidth, img.scaledHeight);
            ctx.globalAlpha = 1.0;

            ctx.strokeStyle = borderColors[index] || 'white';
            ctx.lineWidth = 5;
            ctx.strokeRect(xOffset, yOffset, img.scaledWidth, img.scaledHeight);
        });

        const buffer = canvas.toBuffer('image/png');
        return buffer;

    } catch (error) {
        console.error('Error processing images:', error);
    }
}

async function overlaySideImages(images) {
    try {
        // Load all images
        const loadedImages = await Promise.all(images.map(async (img) => {
            const image = await loadImage(img.src);
            console.log(img.realHeight)
            return {
                image,
                realHeight: parseFloat(img.realHeight),
                width: image.width,
                height: image.height
            };
        }));

        const maxRealHeight = Math.max(...loadedImages.map(img => img.realHeight));

        loadedImages.forEach(img => {
            console.log(img);
            img.scaleFactor = img.realHeight / maxRealHeight;
            img.scaledHeight = 600 * img.scaleFactor;
            img.scaledWidth = (img.width / img.height) * img.scaledHeight;
            console.log(`${img.scaledWidth} width`)
        });

        const canvasWidth = Math.max(...loadedImages.map(img => img.scaledWidth));
        const canvasHeight = 600;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.globalAlpha = 0.7;

        const borderColors = ['red', 'blue', 'green'];

        loadedImages.forEach((img, index) => {
            const xOffset = 0; // Align to the left
            const yOffset = canvasHeight - img.scaledHeight;

            ctx.globalAlpha = 0.7;
            ctx.drawImage(img.image, xOffset, yOffset, img.scaledWidth, img.scaledHeight);
            ctx.globalAlpha = 1.0;

            ctx.strokeStyle = borderColors[index] || 'white';
            ctx.lineWidth = 5;
            ctx.strokeRect(xOffset, yOffset, img.scaledWidth, img.scaledHeight);
        });

        const buffer = canvas.toBuffer('image/png');
        return buffer;

    } catch (error) {
        console.error('Error processing images:', error);
    }
}

async function mergeFrontAndSide(frontBuffer, sideBuffer) {
    const frontImage = await loadImage(frontBuffer);
    const sideImage = await loadImage(sideBuffer);

    const canvasWidth = frontImage.width + sideImage.width + 40;
    const canvasHeight = Math.max(frontImage.height, sideImage.height);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(frontImage, 0, 0);

    ctx.drawImage(sideImage, frontImage.width + 40, 0);

    const buffer = canvas.toBuffer('image/png');
    return buffer;
}

async function processPhoneImages(frontImages, sideImages) {
    const fs = require('fs');

    const frontBuffer = await overlayFrontImages(frontImages);
    const sideBuffer = await overlaySideImages(sideImages);

    fs.writeFileSync('front_overlay.png', frontBuffer);
    fs.writeFileSync('side_overlay.png', sideBuffer);

    const finalBuffer = await mergeFrontAndSide(frontBuffer, sideBuffer);
    fs.writeFileSync('final_overlay.png', finalBuffer);

    console.log('Final merged image saved as final_overlay.png');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('phonesize')
        .setDescription('Generates a completely absurd inspirational quote')
        .addStringOption(option =>
            option.setName('query1')
                .setDescription('First phone')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('query2')
                .setDescription('Second phone')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('query3')
                .setDescription('Third phone (optional)')
                .setRequired(false)),
    async execute(interaction) {

        const query1 = interaction.options.getString('query1') || null;
        const query2 = interaction.options.getString('query2') || null;
        const query3 = interaction.options.getString('query3') || null;

        if (query1 === null || query2 === null) {
            await interaction.reply("wtf how is query1/2 empty");
            return;
        }

        await interaction.deferReply();

        let phones = [];
        let images = [];
        let queries = [];

        if (query3 !== null) {
            queries.push(query1, query2, query3);
            await searchPhonearena(interaction, queries);
        } else if (query3 === null) {
            queries.push(query1, query2);
            await searchPhonearena(interaction, queries);
        } else {
            await interaction.editReply("how the fuck");
            return;
        }

        searchPhonearena("");
        interaction.deferReply();

    },
};
