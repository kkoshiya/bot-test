import { Telegraf } from 'telegraf';
const bot = new Telegraf('7726387189:AAFxLd3-TdrXXxGVUMiVf5WA4D2PUUWvQ1Y');
import axios from 'axios';

let users = {};

bot.start((ctx) => {
    ctx.reply('Welcome to the bot!');
});

bot.command('createWallet', async (ctx) => {
    const userId = ctx.from.id;
    try {
      const response = await axios.post('https://mantle-sol-bridge-production.up.railway.app/create-wallet');
      console.log(response.data.address);
      if (users[userId]) {
        users[userId].unshift(response.data.address);
      } else {
        users[userId] = [response.data.address];
      }
      console.log(users);
      ctx.reply(`wallet address: ${response.data.address}`);

    } catch (error) {
      console.error('Error making POST request:', error);
      ctx.reply('Sorry, there was an error processing your request.');
    }
  });

  bot.command('lis', async (ctx) => {
    const userMessage = ctx.message.text.split(' ').slice(1).join(' ')
    try {
      console.log(ctx.message.text)
      const response = await axios.post('https://mantle-sol-bridge-production.up.railway.app/listen-wallet', {
            address: users[ctx.from.id][0],
            recipientAddress: userMessage
      });
      ctx.reply(response.data.message);
    } catch (error) {
      console.error('Error making POST request:', error);
      ctx.reply('Sorry, there was an error processing your request.');
    }
  });

bot.launch();