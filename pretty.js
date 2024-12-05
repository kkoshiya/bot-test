import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';

const bot = new Telegraf('7726387189:AAFxLd3-TdrXXxGVUMiVf5WA4D2PUUWvQ1Y');

let users = {};
let userStates = {};

bot.start((ctx) => {
  return ctx.reply('Welcome to the wallet bot!', 
    Markup.keyboard([
      ['🆕 Create Wallet']
    ])
    .resize()
  );
});

// Handle wallet creation button press
bot.hears('🆕 Create Wallet', async (ctx) => {
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
    ctx.reply(`Wallet created! Address: ${response.data.address}`);
  } catch (error) {
    console.error('Error making POST request:', error);
    ctx.reply('Sorry, there was an error creating your wallet.');
  }
});

// Modify /lis command to use conversation state
bot.command('lis', (ctx) => {
  // Set user state to awaiting recipient address
  userStates[ctx.from.id] = 'awaiting_recipient';
  
  ctx.reply('Please enter the recipient address:');
});

// Handle user messages based on state
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  
  // Check if user is in the process of entering recipient address
  if (userStates[userId] === 'awaiting_recipient') {
    const recipientAddress = ctx.message.text.trim();
    
    try {
      // Ensure user has a wallet before proceeding
      if (!users[userId] || users[userId].length === 0) {
        return ctx.reply('Please create a wallet first using the "Create Wallet" button.');
      }

      const response = await axios.post('https://mantle-sol-bridge-production.up.railway.app/listen-wallet', {
        address: users[userId][0],
        recipientAddress: recipientAddress
      });

      ctx.reply(response.data.message);
      
      // Reset user state
      delete userStates[userId];
    } catch (error) {
      console.error('Error making POST request:', error);
      ctx.reply('Sorry, there was an error processing your request.');
      
      // Reset user state
      delete userStates[userId];
    }
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));