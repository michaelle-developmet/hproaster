const express = require('express');

// Создаём экземпляр приложения
const app = express();

// Указываем порт
const PORT = 3004;

// Маршрут для обработки GET-запроса к корневому URL
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});