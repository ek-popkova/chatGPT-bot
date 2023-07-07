import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import config from 'config';
import { ogg } from './ogg.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.on(message('voice'), async (ctx) => {
    try {
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await ogg.create(link.href, userId);
        //await ctx.reply(JSON.stringify(ctx.message, null, 2))
    }
    catch (e) {
        console.log('Error while voice message', e.message);
    }   
});

bot.command('start', async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message, null, 2))
});

bot.launch();

//stop the bot if node.js stops
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

//console.log("js works");