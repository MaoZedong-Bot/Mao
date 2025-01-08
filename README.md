
<h1 style="text-align: center;">Mao Zedong</h1>
<p align="center">
  <img src="https://github.com/MaoZedong-Bot/Mao/blob/main/images/maozedong.jpg?raw=true" alt="A portrait of Mao Zedong" style="width:200px;"/>
</p>

<p align="center"><i>Deaths have benefits. They can fertilise the ground.</i></p>
<a href="https://github.com/MaoZedong-Bot/Mao/stargazers">![GitHub Repo stars](https://img.shields.io/github/stars/MaoZedong-Bot/Mao?style=social)</a>
<a href="https://github.com/MaoZedong-Bot/Mao/releases">![GitHub release (latest by date)](https://img.shields.io/github/v/release/MaoZedong-Bot/Mao)</a>

# Running the bot
## Prerequisites
> [!WARNING]
> You must use the **LTS** version of Node.js, Stable will **NOT** work. Your computer will **spontaneously combust**.
>
> If you try to install `better-sqlite3` on Node.js Stable, reverting any damages will be, uh, quite difficult.
>
> The bot was last tested on Node.js v22

Due to our dependency on `better-sqlite3`, you need C++ build tools:
* On Windows these will automatically be installed by `npm`
* On macOS, install [Xcode](https://developer.apple.com/xcode/)
* On Linux, install GCC or any similar compiler
* * For Ubuntu, `sudo apt install build-essential`

## Actually running it
1. Run `npm i` to install packages
2. Rename `config.example.json` to `config.json` and set your own values
3. Run `npx pm2 start ecosystem.config.js`
4. Profit

## Some general usage tips
* PM2 will **NOT** survive a reboot, you have to restart the bot using `npx pm2 start mao`
  * On macOS/Linux you can configure automatic startup of the bot: [PM2 - Startup Script](https://pm2.keymetrics.io/docs/usage/startup/)
  * Windows users, uhhhhhhhhhhhh, skill issue i guess????????????
