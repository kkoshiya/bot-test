import { Telegraf } from 'telegraf';
import 'dotenv/config';
//const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const bot = new Telegraf("7508930200:AAFKahQtN-Cj-mQBTZx_B_GFWkLBNPmHg8U");
import { ethers } from 'ethers';
import { JsonRpcProvider } from 'ethers';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 10000;
bot.telegram.setWebhook(`https://bot-test-xt1z.onrender.com`);

// Express route to handle webhook
app.use(express.json());
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

bot.command('send', async (ctx) => {
    const provider = new JsonRpcProvider('https://api.nitrogen.fhenix.zone');
    const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const recipientAddress = ctx.message.text.split(' ')[1];
    const amount = ethers.parseEther('0.01');
    //const balance = await provider.getBalance(adminWallet.address);
    const tx = await adminWallet.sendTransaction({
        to: recipientAddress,
        value: amount
    });
    const receipt = await tx.wait();
    ctx.reply(`Transfer of 0.01 ETH successful! \nTransaction Hash: ${receipt.hash}`);
});

bot.command('start', async (ctx) => {
    ctx.reply(`way to start`);
});


bot.launch();