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
app.use(cors());
app.use(bodyParser.json());

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

app.post('/web-data', (req, res) => {
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
