import { Telegraf } from 'telegraf';
import 'dotenv/config';
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
import { ethers } from 'ethers';
import { JsonRpcProvider } from 'ethers';

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

bot.launch();