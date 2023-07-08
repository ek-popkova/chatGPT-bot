import { code } from 'telegraf/format'
import { oggService } from '../services/oggService.js'
import { openaiService } from '../services/openaiService.js'

class TelegramManager {
    constructor() {
    }

    async voiceMessageTextAnswer(ctx) {

        await ctx.reply(code('Your question was recieved, we are waiting for the server response...'));

        //get the file from telegram
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await oggService.create(link.href, userId);
        
        //convert the file to mp3
        const mp3Path = await oggService.toMp3(oggPath, userId);

        //get the text of a message
        const text = await openaiService.transcription(mp3Path);

        await ctx.reply(code('Your question is:'));
        await ctx.reply(text);

        //get an answer from chatGPT
        const messages = [{ role: openaiService.roles.USER, content: text }];
        const response = await openaiService.chat(messages);

        await ctx.reply(code('The answer is:'));
        await ctx.reply(response.content);
    }
}

export const telegramManager = new TelegramManager();