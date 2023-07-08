import { code } from 'telegraf/format'
import { oggService } from '../services/oggService.js'
import { openaiService } from '../services/openaiService.js'


const INITIAL_SESSION = {
    messages: [],
}
class TelegramManager {
    constructor() {
    }


    async initalCommand(ctx, text) {
        ctx.session = INITIAL_SESSION;
        await ctx.reply(text);
    }

    async voiceMessageTextAnswer(ctx) {
        
        ctx.session ??= INITIAL_SESSION;
        try {
            await ctx.reply(code('Your question was recieved, we are waiting for the server response...'));

            //get the file from telegram
            const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
            const userId = String(ctx.message.from.id);
            const oggPath = await oggService.create(link.href, userId);
            
            //convert the file to mp3   
            const mp3Path = await oggService.toMp3(oggPath, userId);

            //get the text of a message
            const text = await openaiService.transcription(mp3Path);

            await ctx.reply(code(`Your question is: ${text}`));
            await this.getTextAnswer(ctx, text);
        }
        catch (e) {
            console.log('Error while answering the voice message', e.message);
            await ctx.reply(code('The internal error occured, please, try again later.'));
        }          
    }

    async textMessageTextAnswer(ctx, text) {
    
        ctx.session ??= INITIAL_SESSION;
        try {
            await ctx.reply(code('Your question was recieved, we are waiting for the server response...'));
            await this.getTextAnswer(ctx, ctx.message.text)
        }
        catch (e) {
            console.log('Error while answering the voice message', e.message);
            await ctx.reply(code('The internal error occured, please, try again later.'));
        }          
    }

    async getTextAnswer(ctx, text) {
        
            ctx.session.messages.push({
                role: openaiService.roles.USER,
                content: text
            });

            const response = await openaiService.chat(ctx.session.messages);

            ctx.session.messages.push({
                role: openaiService.roles.ASSISTANT,
                content: response.content
            });
            await ctx.reply(response.content);
    }
}

export const telegramManager = new TelegramManager();