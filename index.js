const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const webAppUrl = 'https://astonishing-pothos-609d9e.netlify.app'
const token = '7120533023:AAHdqojFMnTdpfMna2e8SAhh2VKETtZy9FQ';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async(msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text == '/start'){
    await bot.sendMessage(chatId, 'Добро пожаловать', {
      reply_markup: {
        inline_keyboard: [
          [{text:'Make zakaz', web_app: {url: webAppUrl}}]
        ]
      }
    })
    
  }

  if(text == '/data'){
    await bot.sendMessage(chatId, 'Заполните форму которая появиться ниже', {
      reply_markup: {
        keyboard: [
          [{text:'Заполние форму', web_app: {url: webAppUrl + '/form'}}]
        ]
      }
    })
    
  }

  if(msg?.web_app_data?.data){
    try{
      const data = JSON.parse(msg?.web_app_data?.data)

      await bot.sendMessage(chatId,'Спасибо за ваше доверие!')
      await bot.sendMessage(chatId,'Ваш имейл: '+ data?.email)
      await bot.sendMessage(chatId,'Ваш пароль: '+ data?.password)
      await bot.sendMessage(chatId,'Донат в: '+ data?.subject)
    }
    catch (e){
      console.log(e);
    }
    
  }
});

app.post('/web-data', async(req, res) => {
  
  const{queryId, product, totalPrice} = req.body;

  try{
    await bot.answerWebAppQuery(queryId,{
      type: 'article',
      id: queryId,
      title: 'Победа',
      input_message_content: {message_text: "Хороший выбор, покупка прошла успешно! Ваша общая сумма составляет: " + totalPrice +
      ". Свяжитесь с @Lojin для дальнейших указаний"}
    })
    return res.status(200).json({});
  }
  catch (e) {
    await bot.answerWebAppQuery(queryId,{
      type: 'article',
      id: queryId,
      title: 'Ошибка',
      input_message_content: {message_text: "ВЫшла ошибочка, не удалось приобрести товар. Свяжитесь с @Lojin для дальнейших указаний"}
      
    })
    return res.status(505).json({});
  }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))