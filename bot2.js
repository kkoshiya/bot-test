const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const { console } = require('inspector');
const token = '7726387189:AAFxLd3-TdrXXxGVUMiVf5WA4D2PUUWvQ1Y';
//const token = '7583107183:AAHIe42K_eXjpGwb_gzWBM4-_uvtaXMBAq4';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

//let users = {};
let sol = '';
// Respond to the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome! Send /run to execute the script.');
});

bot.onText(/\/kek/, (msg) => {
    const chatId = msg.chat.id;
    console.log('kek print test');
    bot.sendMessage(chatId, msg.text);
});

bot.onText(/\/createWallet/, (msg) => {
    console.log('test');
    const chatId = msg.chat.id;
    const inputs = {};
    fetch('https://mantle-sol-bridge-production.up.railway.app/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputs)
      })
      .then(response => response.json())
      .then(data => {
        bot.sendMessage(chatId, data.address);
        //users[msg.from.id] = data.address;
        sol = data.address;
        //console.log(sol);
        console.log('Response:', data.address);
        //console.log(typeOf(data.address))
      })
      .catch(error => {
        console.error('Error:', error);
      });
});

bot.onText(/\/lis/, (msg) => {
    const chatId = msg.chat.id;
    const mantleAddress = msg.text;
    //console.log(msg.text);
    // const data = {
    //     address: "Gob2fp8udoqLB1jybdLruGqJuBrC4ZSb3KoCMgT3AvRD", 
    //     recipientAddress: msg.text
    // };
    const inputs = {
        address: "GEPJfF72fpBGNZWriAMjwt4uYrAfe2zTi8sVRGPxRLMm", 
        recipientAddress: mantleAddress
    };
    fetch('https://mantle-sol-bridge-production.up.railway.app/listen-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputs)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Response:', data);
        bot.sendMessage(chatId, data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    bot.sendMessage(chatId, 'sent???' );
});

