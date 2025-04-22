const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors'); 
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid'); 
const multer = require('multer');
const path = require('path');


dotenv.config();

const app = express();
const port = process.env.PORT || 5011;



connectDB();

// CORS настройки
const corsOptions = {
    origin: 'http://localhost:3000', // Указываем фронтенд-домен
    methods: 'GET,POST,PUT,DELETE',  // Разрешаем эти методы
    allowedHeaders: 'Content-Type,Authorization',  // Разрешаем эти заголовки
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// Увеличиваем лимит для JSON и URL-encoded данных
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// доступ к папке /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршрут для регистрации
app.post('/register', async (req, res) => {
    const { name, business_name, post, password, isWorker, bossPost } = req.body;

    if (!name || !post || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Проверяем, существует ли пользователь с такой почтой
        const userExists = await User.findOne({ post });
        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (isWorker) {
            if (!bossPost) {
                return res.status(400).json({ msg: 'Boss email is required for workers' });
            }

            // Ищем босса по его почте
            const boss = await User.findOne({ post: bossPost });
            if (!boss) {
                return res.status(404).json({ msg: 'Boss not found' });
            }

            // Создаем работника
            const newWorker = new User({
                name,
                business_name,
                post,
                password: hashedPassword,
                bossPost, // Сохраняем почту босса у работника
                workers: [], // У работника нет своих работников
                datas: [],
                shift_status:false,
            });

            await newWorker.save();

            // Добавляем почту работника в массив `workers` босса
            boss.workers.push(post);
            await boss.save();

            return res.status(201).json({ message: 'Worker registered successfully and linked to boss' });
        }

        // Если это владелец
        const newOwner = new User({
            name,
            business_name,
            post,
            password: hashedPassword,
            bossPost: null, // У владельца нет босса
            workers: [], // У владельца изначально нет работников
            datas: [],

        });

        await newOwner.save();

        // Генерируем токен для владельца
        const payload = { userId: newOwner._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Устанавливаем токен в куки
        res.cookie('token', token, {
            httpOnly: false,
            secure: false,
            maxAge: 3600 * 1000, // 1 час
        });

        res.status(201).json({ message: 'Owner registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Хранилище для загружаемых фото
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ storage });


// Маршрут для логина
app.post('/login', async (req, res) => {
    const { post, password } = req.body;  // Используем post вместо email
    const user = await User.findOne({ post });  // Поиск пользователя по полю post
    if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Неверный пароль' });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Устанавливаем токен в куки
    res.cookie('token', token, {
        httpOnly: false,  // токен доступен только для серверной обработки
        secure: false,  // Использовать только через HTTPS в продакшн
        maxAge: 3600 * 1000,  // Время жизни токена - 1 час
    });

    res.json({ message: 'Авторизация успешна' });
});

// Middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ID пользователя из токена
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Токен невалиден' });
    }
};



app.get('/team', authMiddleware, async (req, res) => {
    try {
        // Ищем текущего пользователя
        const user = await User.findById(req.user.userId); // Мы не исключаем поля, чтобы получить все данные
        if (!user) {
            return res.status(404).json({ msg: 'Пользователь не найден' });
        }


        let boss = await User.findOne({post:user.bossPost})

        if (!boss){
            boss = await User.findOne({post:user.post})
        }

        // Получаем список работников по их ID (или можно искать по email/другим полям)
        const workers = await User.find({ post: { $in: user.workers } });

        res.json({
            user, // Возвращаем данные текущего пользователя
            workers, // Возвращаем данные работников
            boss,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Ошибка сервера' });
    }
});

// Эндпоинт для получения данных о доступах пользователя
app.post('/user/access', authMiddleware, async (req, res) => {
    const { post } = req.body;

    try {
        // Извлекаем почту босса из токена
        const bossPost = req.user.userId;

        console.log(req.user)

        // Проверяем наличие пользователя
        const user = await User.findOne({ post: post });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Возвращаем данные о доступах работника
        res.json({ access: user.access });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


app.post('/user/update-access', authMiddleware, async (req, res) => {
    const { post, updatedAccess } = req.body;
    try {
        // Извлекаем почту босса из токена
        const bossPost = req.user.userId;

        // Находим пользователя
        const user = await User.findOne({ post: post });

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }


        const boss = await User.findById(bossPost);

        // Проверяем, что текущий пользователь является боссом этого работника
        if (user.bossPost !== boss.post) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        // Обновляем доступы
        user.access = updatedAccess;

        await user.save();

        res.json({ message: 'Доступы успешно обновлены', access: user.access });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


// Пример эндпоинта для авторизации
app.post('/api/auth', authMiddleware , async (req, res) => {
    const { email, password } = req.body;
  
    // Ищем пользователя по email и паролю
    const user = await User.findOne({ email });
  
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Неверные данные для авторизации" });
    }
  
    // Возвращаем данные пользователя, включая почту боса и данные доступа
    res.json(user);
  });

app.post('/api/submit-form', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.userId);
    const { email, name, country, region, ...otherData } = req.body;
  
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
  
    // Получаем почту боса
    const bossEmail = user.bossPost;
  
    if (!bossEmail) {
      return res.status(400).json({ message: "У пользователя нет почты боса" });
    }
  
    // Находим боса по email
    const boss = await User.findOne({ post: bossEmail });
  
    if (!boss) {
      return res.status(400).json({ message: "Босс не найден" });
    }
  

    // Генерация дополнительных данных
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Формат YYYY-MM-DD
  const lotNumber =boss.datas.green_kava_work.length + 1; // Номер лота (длина массива + 1)
  const status = 'progress';
  const author = user.name;
  const global_weight = 0;

    // Генерация уникального ID в формате числа
    const generateNumericId = () => {
        return Math.floor(100000000 + Math.random() * 900000000); // Случайное 9-значное число
      };
      const lotId = generateNumericId();



  
    // Добавляем новый объект в массив green_kava_work
    boss.datas.green_kava_work.push({
    name,
    country,
    region,
    ...otherData,
    date: formattedDate, // Дата отправки
    lotNumber,           // Номер лота
    lotId,   
    status,            // Уникальный ID
    author,
    global_weight
  });
  
    // Сохраняем изменения
    await boss.save();
  
    res.json({ message: 'Данные успешно сохранены' });
  });

  app.post('/api/submit-delivery', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
  
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
  
      const { big_direct_kava } = req.body;
      const bossEmail = user.bossPost;
      if (!bossEmail) {
        return res.status(400).json({ message: "У пользователя нет почты боса" });
      }
  
      const boss = await User.findOne({ post: bossEmail });
      if (!boss) {
        return res.status(400).json({ message: "Босс не найден" });
      }
  
      // Формируем новый лот
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      const newLotNumber = boss.datas.big_direct_kava.length + 1;
      const deliverId = boss.datas.big_direct_kava.length + 13;
  
      boss.datas.big_direct_kava.push({
        lots_inside: big_direct_kava[0].lots_inside,
        lot_number: newLotNumber,
        lot_name: `Лот ${newLotNumber}`,
        date: formattedDate,
        delivery_status:"progress",
        deliverId
      });
  
      // Перебираем все товары в lots_inside и обновляем их в green_kava_work
      big_direct_kava[0].lots_inside.forEach(lot => {
        const targetIndex = boss.datas.green_kava_work.findIndex(product => product.lotId === lot.lotId);
      
        if (targetIndex !== -1) {
          let targetProduct = boss.datas.green_kava_work[targetIndex];
      
          if (!targetProduct.operations) {
            targetProduct.operations = [];
          }
      
          targetProduct.operations.push({
            weight: lot.volume,
            date: formattedDate,
            price: lot.price,
            author: user.name,
            type: 'postavka',
            deliverId
          });
      
      
          // Явно помечаем массив как измененный
          boss.markModified('datas.green_kava_work'); 
        }
      });
  
      await boss.save();
      res.json({ message: 'Данные успешно сохранены' });
      
    } catch (error) {
      console.error("Ошибка при обработке запроса:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });
  
  
  

  


app.put('/lots/:lotId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // Находим пользователя
    const boss = await User.findOne({ post: user.bossPost }); // Находим босса

    const { lotId } = req.params; // Получаем ID лота из параметров
    const { arrive, status, roasting , deliverId} = req.body; // Данные для обновления

    const todayDate = new Date().toISOString().split('T')[0]; // Получаем текущую дату в формате YYYY-MM-DD

    // Ищем лот с соответствующим lot_number
    const lotIndex = boss.datas.big_direct_kava.findIndex((kava) => {
      return kava.lot_number === Number(lotId); // Сравниваем lot_number с lotId
    });

    // Функция которая генерирует массив ид товаров которые приехали
    function extractLotIds(lotsInside) {
      // Массив для хранения всех lotId
      const lotIds = [];
    
      // Перебираем каждый товар в массиве lots_inside и забираем lotId
      lotsInside.forEach(lot => {
        if (lot.lotId) {
          lotIds.push(lot.lotId); // Добавляем lotId в новый массив
        }
      });
    
      
      console.log(lotIds)
      return lotIds; // Возвращаем массив с lotId
    }


    async function addArriveOperations(lotIds, boss, user) {
      // Получаем сегодняшнюю дату в формате YYYY-MM-DD
      const todayDate = new Date().toISOString().split('T')[0];
    
      // Перебираем все lotIds
      for (const lotId of lotIds) {
        // Находим товар в green_kava_work по lotId
        const lot = boss.datas.green_kava_work.find(item => item.lotId === lotId);
    
        if (lot) {
          // Находим операции типа "postavka" с соответствующим deliverId
          const postavkaOperation = lot.operations.find(op => op.type === 'postavka' && op.deliverId === req.body.deliverId);
    
          if (postavkaOperation) {
            // Получаем вес из найденной операции
            const weight = postavkaOperation.weight;
    
            // Создаем новый объект для операции "arrive"
            const info_to_send = {
              deliver_time: todayDate,
              type: 'arrive',
              arrive_author: user.name,
              weight: weight,  // Используем вес из найденной операции
            };
    
            // Пушим новый объект в массив операций
            lot.operations.push(info_to_send);
            lot.globalWeight = Number(lot.globalWeight || 0) + Number(weight || 0);


    
            console.log(`Arrive operation added for lotId ${lotId}`);
          } else {
            console.log(`No postavka operation found for lotId ${lotId}`);
          }
        } else {
          console.log(`Lot with lotId ${lotId} not found in green_kava_work`);
        }
      }
    
      // Сохраняем изменения в базе данных один раз после всех изменений
      try {
        await boss.save();
        console.log('Boss data saved successfully');
      } catch (error) {
        console.error(`Error saving boss data: ${error.message}`);
      }
    }
    

    addArriveOperations(extractLotIds(req.body.lots_inside),boss,user)

    // Если нашли лот
    if (lotIndex !== -1) {
      // Изменяем статус и дату в найденном лоте
      boss.datas.big_direct_kava[lotIndex].delivery_status = status; // Обновляем статус
      boss.datas.big_direct_kava[lotIndex].deliver_time = todayDate; // Обновляем дату

      // Сохраняем изменения в базе данных
      await boss.save();

      // Отправляем успешный ответ
      res.json({ message: 'Лот обновлен успешно' });
    } else {
      // Если лот не найден
      res.status(404).json({ message: 'Лот не найден' });
    }
  } catch (error) {
    console.error('Error updating lot:', error);
    res.status(500).json({ message: 'Ошибка при обновлении лота' });
  }
});


app.put('/lots/:lotId/roasting', authMiddleware, async (req, res) => {
  try {
    const { lotId } = req.params;
    const { volume, date, source } = req.body;
    const generateNumericId = () => {
      return Math.floor(100000000 + Math.random() * 900000000); // Случайное 9-значное число
    };
    const roastId = generateNumericId();



    // Находим текущего пользователя
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
    }
    // Находим босса
    const boss = await User.findOne({ post: user.bossPost });
    if (!boss) {
        return res.status(404).json({ message: 'Боса не знайдено' });
    }
    // Ищем нужный лот в массиве green_kava_work
    const lot = boss.datas.green_kava_work.find(item => item.lotId.toString() === lotId);
    if (!lot) {
        return res.status(404).json({ message: 'Лот не знайдено у босса' });
    }
    // Проверяем, хватает ли веса
    if (lot.globalWeight < volume) {
        return res.status(400).json({ message: 'Недостатньо кави для обсмажки' });
    }
    // Добавляем операцию в `operations`
    if (!Array.isArray(lot.operations)) {
        lot.operations = []; // Если operations нет, создаем массив
    }

    lot.globalWeight = lot.globalWeight - volume + (volume*lot.maybearrive/100)


    lot.operations.push({
        roast_volume:volume,
        green_volume:volume + (volume*lot.maybearrive/100), 
        date,
        source,
        type: 'roast',
        roastId,
        lotname: lot.name
    });

    // Проверяем, есть ли у босса массив roast_kava
    if (!Array.isArray(boss.roast_kava)) {
        boss.roast_kava = [];
    }

    if (!boss.datas.roast_kava) {
      boss.datas.roast_kava = { to_roast: [], in_roast:[], roasted: [] }; // Создаём пустой объект с массивами
  }
  
  const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD


  // Теперь добавляем данные в массив to_roast
  boss.datas.roast_kava.to_roast.push({
      roast_volume: volume,
      green_volume: volume + (volume*lot.maybearrive/100), 
      date,
      author: source,
      todayDate, 
      lotId,
      roastId,
      lotname: lot.name,
      lotNum : lot.lotNumber
  });
  

    // Сохраняем обновленные данные босса
    await boss.save();

    res.json({ message: 'Замовлення на обсмажку оформлено успішно' });
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error);
    res.status(500).json({ message: 'Сталася помилка при оформленні замовлення' });
  }
});

app.post('/api/update-roasting', authMiddleware, async (req, res) => {
  try {
    const { batchSize, uzharka, capping ,lotId ,roastId ,roasting_time ,roast_volume ,green_volume ,lotName ,lotNum , } = req.body;

    console.log("Body",req.body);




    // Находим текущего пользователя
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
    }
    // Находим босса
    const boss = await User.findOne({ post: user.bossPost });
    if (!boss) {
        return res.status(404).json({ message: 'Боса не знайдено' });
    }

    console.log("Username",user.name)
    
    boss.datas.roast_kava.in_roast.push({
      batchSize,
      uzharka,
      capping,
      lotId,
      roastId,
      roasting_time,
      roast_volume,
      green_volume,
      roasting_time,
      lotName,
      lotNum,
      author:user.name
  });


  // Удаление объекта с конкретным roastId из массива to_roast у boss.roast_kava
  boss.datas.roast_kava.to_roast = boss.datas.roast_kava.to_roast.filter(item => item.roastId !== roastId);



  await boss.save()
    res.json({ message: 'Обсмажку оновлено' });
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error);
    res.status(500).json({ message: 'Сталася помилка при оформленні замовлення' });
  }
});

app.post('/api/finish_roasting', authMiddleware, async (req, res) => {
  try {
    const { batch_volume, roasted_volume, capping ,lotId ,roastId ,finish_time ,roast_volume ,green_volume ,lotName ,lotNum , } = req.body;

    console.log("Body",req.body);




    // Находим текущего пользователя
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
    }
    // Находим босса
    const boss = await User.findOne({ post: user.bossPost });
    if (!boss) {
        return res.status(404).json({ message: 'Боса не знайдено' });
    }

    
    boss.datas.roast_kava.roasted.push({
      batch_volume,
      roasted_volume,
      capping,
      lotId,
      roastId,
      finish_time,
      roast_volume,
      green_volume,
      lotName,
      lotNum,
      author:user.name,
      actual_status:"false",
  });


  boss.datas.roast_kava.in_roast = boss.datas.roast_kava.in_roast.filter(item => item.roastId !== roastId);

  let currentLot = boss.datas.green_kava_work.find(item => item.lotId !== lotId);

  currentLot.globalRoastWeight = Number(currentLot.globalRoastWeight || 0) + Number(roast_volume || 0);

  console.log("weight",currentLot.globalRoastWeight)

  boss.markModified('datas.green_kava_work');


  await boss.save()

    res.json({ message: 'Обсмажку оновлено' });
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error);
    res.status(500).json({ message: 'Сталася помилка при оформленні замовлення' });
  }
});

//открытие или закрытие смены 
app.post('/api/toggle_shift', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const now = new Date().toLocaleString('uk-UA'); // или ISO, если нужно
    const newType = user.shift_status ? 'close' : 'open';

    user.shifts.push({
      time: now,
      type: newType,
    });

    user.shift_status = !user.shift_status;

    await user.save();

    res.json({
      message: `Смена ${newType === 'open' ? 'відкрита' : 'закрита'}`,
      shift_status: user.shift_status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при перемиканні зміни' });
  }
});

//добавление задачи
app.post('/api/assign_task', authMiddleware, async (req, res) => {
  try {
    const { whoisdoing, deadline, priority, description } = req.body;

    if (!whoisdoing || !deadline || !priority || !description) {
      return res.status(400).json({ message: 'Будь ласка, заповніть усі поля' });
    }

    // Находим текущего пользователя
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // Находим босса
    const boss = await User.findOne({ post: user.bossPost });
    if (!boss) {
      return res.status(404).json({ message: 'Боса не знайдено' });
    }

    // Создаём новую задачу
    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 8), // уникальный ID
      whoisdoing,
      from: user.name,
      issuedAt: new Date().toISOString(),
      deadline,
      priority,
      description,
      status: 'added',            // изначально пустой статус
      completedAt: ''        // когда выполнена — изначально пусто
    };

    // Пушим задачу в массив boss.appointments
    boss.appointments.push(newTask);

    // Сохраняем босса
    await boss.save();

    res.json({ message: 'Задачу призначено', task: newTask });
  } catch (error) {
    console.error('Помилка при призначенні задачі:', error);
    res.status(500).json({ message: 'Сталася помилка при призначенні задачі' });
  }
});

app.put('/api/tasks/complete', authMiddleware, async (req, res) => {
  try {
    const { taskId, completeTime } = req.body;

    // Проверка на наличие данных
    if (!taskId || !completeTime) {
      return res.status(400).json({ message: 'Необходимые данные отсутствуют' });
    }

    // Находим пользователя по ID
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // Находим босса
    const boss = await User.findOne({ post: user.bossPost });
    if (!boss) {
      return res.status(404).json({ message: 'Боса не знайдено' });
    }

    // Логирование данных для отладки
    console.log('Задача для обновления:', { taskId, completeTime });
    console.log('Текущий босс:', boss);

    // Ищем задачу у босса и обновляем её
    const updatedBoss = await User.findOneAndUpdate(
      { _id: boss._id, 'appointments.id': taskId }, // Указываем условие для поиска нужной задачи
      { 
        $set: { 
          'appointments.$.status': 'complete', 
          'appointments.$.completedAt': completeTime 
        }
      },
      { new: true } // Вернуть обновленный документ
    );

    if (!updatedBoss) {
      console.log('Задача не найдена или не обновлена');
      return res.status(404).json({ message: 'Задача не найдена или не обновлена' });
    }

    // Печатаем обновленную задачу для проверки
    const updatedTask = updatedBoss.appointments.find(t => t.id === taskId);
    console.log('Обновленная задача:', updatedTask);

    res.json({ message: 'Задача завершена', task: updatedTask });
  } catch (error) {
    console.error('Ошибка при завершении задачи:', error);
    res.status(500).json({ message: 'Сталася помилка при завершенні задачі' });
  }
});


app.post('/api/add_pack', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { name , volume } = req.body;
    const photoPath = req.file?.path;

    if (!name || !photoPath) {
      return res.status(400).json({ message: 'Будь ласка, заповніть усі поля' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const boss = await User.findOne({ post: user.bossPost });
    if (!boss) return res.status(404).json({ message: 'Боса не знайдено' });

    const newPack = {
      packId: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name,
      photo: photoPath,
      author: user.name,
      createdAt: new Date().toISOString(),
      count: 0,
      volume
    };

    if (!boss.datas.additions) boss.datas.additions = {};
    if (!Array.isArray(boss.datas.additions.packs)) boss.datas.additions.packs = [];

    boss.datas.additions.packs.push(newPack);
    await boss.save();

    res.json({ message: 'Упаковку додано', pack: newPack });
  } catch (error) {
    console.error('Помилка при додаванні упаковки:', error);
    res.status(500).json({ message: 'Сталася помилка при додаванні упаковки' });
  }
});



app.post('/api/update_pack_count', authMiddleware, async (req, res) => {
  try {
    const { packId, countToAdd } = req.body;

    if (!packId || typeof countToAdd !== 'number') {
      return res.status(400).json({ message: 'Некоректні дані' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const boss = await User.findOne({ post: user.bossPost });
    if (!boss || !boss.datas?.additions?.packs) {
      return res.status(404).json({ message: 'Боса або упаковки не знайдено' });
    }

    const pack = boss.datas.additions.packs.find(p => p.packId === packId);
    console.log(pack)
    if (!pack) {
      return res.status(404).json({ message: 'Упаковку не знайдено' });
    }

    pack.count += countToAdd;
    boss.markModified('datas.additions.packs'); // ⬅️ Обязательно!
    await boss.save();

    res.json({ message: 'Кількість оновлено', pack });
  } catch (error) {
    console.error('Помилка при оновленні кількості упаковок:', error);
    res.status(500).json({ message: 'Сталася помилка' });
  }
});

  

  
app.post('/api/add_sticker', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { name , size } = req.body;
    const photoPath = req.file?.path;

    if (!name || !photoPath) {
      return res.status(400).json({ message: 'Будь ласка, заповніть усі поля' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const boss = await User.findOne({ post: user.bossPost });
    if (!boss) return res.status(404).json({ message: 'Боса не знайдено' });

    const newSticker = {
      stickerId: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name,
      photo: photoPath,
      author: user.name,
      createdAt: new Date().toISOString(),
      count: 0,
      size
    };

    if (!boss.datas.additions) boss.datas.additions = {};
    if (!Array.isArray(boss.datas.additions.stickers)) boss.datas.additions.stickers = [];

    boss.datas.additions.stickers.push(newSticker);
    await boss.save();

    res.json({ message: 'Упаковку додано', sticker: newSticker });
  } catch (error) {
    console.error('Помилка при додаванні упаковки:', error);
    res.status(500).json({ message: 'Сталася помилка при додаванні упаковки' });
  }
});

app.post('/api/update_sticker_count', authMiddleware, async (req, res) => {
  try {
    const { stickerId, addedStickerCount } = req.body;

    if (!stickerId || typeof addedStickerCount !== 'number') {
      return res.status(400).json({ message: 'Некоректні дані' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const boss = await User.findOne({ post: user.bossPost });
    if (!boss || !boss.datas?.additions?.stickers) {
      return res.status(404).json({ message: 'Боса або упаковки не знайдено' });
    }

    const sticker = boss.datas.additions.stickers.find(s => s.stickerId === stickerId);
    console.log(sticker)
    if (!sticker) {
      return res.status(404).json({ message: 'Упаковку не знайдено' });
    }

    sticker.count += addedStickerCount;
    boss.markModified('datas.additions.stickers'); // ⬅️ Обязательно!
    await boss.save();

    res.json({ message: 'Кількість оновлено', sticker });
  } catch (error) {
    console.error('Помилка при оновленні кількості упаковок:', error);
    res.status(500).json({ message: 'Сталася помилка' });
  }
});


app.post('/api/add_role', authMiddleware, async (req, res) => {
  try {
    const { role_name, decorative = false } = req.body;

    if (!role_name) {
      return res.status(400).json({ message: 'Назва ролі є обовʼязковою' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const boss = await User.findOne({ post: user.bossPost });
    if (!boss) return res.status(404).json({ message: 'Боса не знайдено' });

    const role_id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    const newRole = {
      role_name,
      role_id,
      decorative, // если чекбокс, можешь передавать true/false с фронта
      author: user.name,
      access: {
        green_kava: {
          postavka: 'hide',
          work: 'hide',
          sklad: 'hide'
        },
        roasted: {
          work: 'hide',
          sklad: 'hide'
        },
        packing: {
          work: 'hide',
          sklad: 'hide'
        },
        addition: {
          work: 'hide',
          sklad: 'hide'
        },
        statistic: {
          green_kava: { global: 'hide' },
          roasted: { global: 'hide' },
          packing: { global: 'hide' },
          addition: { global: 'hide' }
        },
        settings: {
          role_offer: 'hide',
          workers_offer: 'hide'
        }
      }
    };

    // Прямое обновление — даже если поля "roles" нет в схеме
    const updateResult = await User.updateOne(
      { post: user.bossPost },
      { $push: { roles: newRole } }
    );

    if (updateResult.modifiedCount === 0) {
      console.error(`[add_role] ❌ Роль не була збережена. Role ID: ${role_id}`);
      return res.status(500).json({ message: 'Роль не була збережена. Спробуйте ще раз.' });
    }

    console.log(`[add_role] ✅ Роль успішно додана. Role ID: ${role_id}`);
    res.json({ message: 'Роль додано', role: newRole });

  } catch (error) {
    console.error('[add_role] ❌ Помилка сервера:', error);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});


// app.get('api/get_all_roles',authMiddleware, async (req, res) =>{
//   try {
//     // Ищем текущего пользователя
//     const user = await User.findById(req.user.userId); // Мы не исключаем поля, чтобы получить все данные
//     if (!user) {
//         return res.status(404).json({ msg: 'Пользователь не найден' });
//     }


//     let boss = await User.findOne({post:user.bossPost})

//     if (!boss){
//         boss = await User.findOne({post:user.post})
//     }

//     // Получаем список работников по их ID (или можно искать по email/другим полям)
//     const workers = await User.find({ post: { $in: user.workers } });

//     res.json({
//         user, // Возвращаем данные текущего пользователя
//         workers, // Возвращаем данные работников
//         boss,
//     });
// } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: 'Ошибка сервера' });
// }
// })



app.get('/api/get_all_roles', authMiddleware, async (req, res) => {
  try {
      // Ищем текущего пользователя
      const user = await User.findById(req.user.userId); // Мы не исключаем поля, чтобы получить все данные
      if (!user) {
          return res.status(404).json({ msg: 'Пользователь не найден' });
      }


      let boss = await User.findOne({post:user.bossPost})

      if (!boss){
          boss = await User.findOne({post:user.post})
      }


      res.json({
          roles:boss.roles
      });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Ошибка сервера' });
  }
});

app.get('/api/get_all_styles', authMiddleware, async (req, res) => {
  try {
      // Ищем текущего пользователя
      const user = await User.findById(req.user.userId); // Мы не исключаем поля, чтобы получить все данные
      if (!user) {
          return res.status(404).json({ msg: 'Пользователь не найден' });
      }


      // let boss = await User.findOne({post:user.bossPost})

      // if (!boss){
      //     boss = await User.findOne({post:user.post})
      // }


      res.json({
          user:user.styles
      });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Ошибка сервера' });
  }
});

app.get('/api/get_roasted_kava', authMiddleware, async (req, res) => {
  try {
      // Ищем текущего пользователя
      const user = await User.findById(req.user.userId); // Мы не исключаем поля, чтобы получить все данные
      if (!user) {
          return res.status(404).json({ msg: 'Пользователь не найден' });
      }


      let boss = await User.findOne({post:user.bossPost})

      if (!boss){
          boss = await User.findOne({post:user.post})
      }




      res.json({
          user:boss.datas.green_kava_work
      });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Ошибка сервера' });
  }
});




app.post('/api/submit_packing', authMiddleware, async (req, res) => {
  try {
    const { lotId, volume, packId, stickerId, packCount, stickerCount, createdAt } = req.body;

    if (!lotId || !packId || !stickerId) {
      return res.status(400).json({ message: 'lotId, packId та stickerId є обовʼязковими' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const boss = await User.findOne({ post: user.bossPost });
    if (!boss) return res.status(404).json({ message: 'Боса не знайдено' });

    if (!boss.datas) boss.datas = {};
    if (!Array.isArray(boss.datas.pack_kava)) boss.datas.pack_kava = [];

    // 1. Обновляем roasted (уменьшаем объем по lotId)
    let lotName = '';
    if (Array.isArray(boss.datas.green_kava_work)) {
      const roastedLot = boss.datas.green_kava_work.find(lot => lot.lotId === lotId);
      if (roastedLot) {
        console.log("RoastedLot",roastedLot)
        roastedLot.globalRoastWeight = Math.max((roastedLot.globalRoastWeight || 0) - volume, 0);
        lotName = roastedLot.lotName || '';
      }
    }

    // 2. Списываем упаковки
    if (Array.isArray(boss.datas.additions?.packs)) {
      const pack = boss.datas.additions.packs.find(p => p.packId === packId);
      if (pack) {
        pack.count = Math.max((pack.count || 0) - packCount, 0);
      }
    }

    // 3. Списываем стикеры
    if (Array.isArray(boss.datas.additions?.stickers)) {
      const sticker = boss.datas.additions.stickers.find(s => s.stickerId === stickerId);
      if (sticker) {
        sticker.count = Math.max((sticker.count || 0) - stickerCount, 0);
      }
    }

    // 4. Работа с pack_kava
    let lotIndex = boss.datas.pack_kava.findIndex(p => p.lotId === lotId);
    let lotObj;

    if (lotIndex === -1) {
      // Создаем новый объект лота
      lotObj = {
        lotId,
        lotName,
        globalPackWeight: volume,
        lots_inside: []
      };
      boss.datas.pack_kava.push(lotObj);
      lotIndex = boss.datas.pack_kava.length - 1;
    } else {
      lotObj = boss.datas.pack_kava[lotIndex];
    }

    const generateNumericId = () => {
      return Math.floor(100000000 + Math.random() * 900000000);
    };
    const pack_kava_id = generateNumericId();

    // Поиск записи
    const foundIndex = lotObj.lots_inside.findIndex(
      i => i.packId === packId && i.stickerId === stickerId
    );

    if (foundIndex !== -1) {
      lotObj.lots_inside[foundIndex].packCount += packCount;
      lotObj.lots_inside[foundIndex].stickerCount += stickerCount;
      lotObj.lots_inside[foundIndex].weight += volume;
    } else {
      lotObj.lots_inside.push({
        packId,
        stickerId,
        packCount,
        stickerCount,
        weight: volume,
        createdAt,
        author: user.post,
        packsKavaId: pack_kava_id,
      });
    }

    lotObj.globalPackWeight = (lotObj.globalPackWeight || 0) + volume;
    boss.datas.pack_kava[lotIndex] = lotObj;

    // Помечаем все изменения
    boss.markModified('datas.roasted');
    boss.markModified('datas.additions.packs');
    boss.markModified('datas.additions.stickers');
    boss.markModified('datas.pack_kava');

    await boss.save();

    res.json({ message: 'Фасування додано успішно' });

  } catch (error) {
    console.error('Помилка при збереженні фасування:', error);
    res.status(500).json({ message: 'Внутрішня помилка сервера' });
  }
});



app.get('/api/get_packs_coffee', authMiddleware, async (req, res) => {
  try {
      // Ищем текущего пользователя
      const user = await User.findById(req.user.userId); // Мы не исключаем поля, чтобы получить все данные
      if (!user) {
          return res.status(404).json({ msg: 'Пользователь не найден' });
      }


      let boss = await User.findOne({post:user.bossPost})

      if (!boss){
          boss = await User.findOne({post:user.post})
      }

      const packs_coffee = boss.datas.pack_kava




      res.json({
          data:packs_coffee
      });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Ошибка сервера' });
  }
});



app.put('/api/update_role_access', authMiddleware, async (req, res) => {
  try {

    const { role_id, access } = req.body;
    
      // Ищем текущего пользователя
      const user = await User.findById(req.user.userId); // Мы не исключаем поля, чтобы получить все данные
      if (!user) {
          return res.status(404).json({ msg: 'Пользователь не найден' });
      }


      let boss = await User.findOne({post:user.bossPost})

      if (!boss){
          boss = await User.findOne({post:user.post})
      }
    // Находим нужную роль внутри массива ролей
    const role = boss.roles.find(r => r.role_id === role_id);
    if (!role) {
      return res.status(404).json({ message: 'Роль не найдена' });
    }

    // Глубокая замена access
    role.access = access;

    // Явно помечаем путь как модифицированный (на случай, если вложенные поля не триггерят dirty)
    boss.markModified(`roles`); 


    // Сохраняем изменения
    await boss.save();

    res.status(200).json({ message: 'Доступы обновлены' });

  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Ошибка сервера' });
  }
});


// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// pack_kava:[
//   {
//     lotId:тут лод ид,
//     globalRoastWeight : тут понятно 
//     lotsInside;[
//       {
//         weight:вес
//         stickerId:
//         packid:
//         stickerCount
//         packCount
//         createdAt 
//         author 
//       }
//     ]
//   }
// ]

// юзер:{
//   номер_телефона:3800000000
//   игры:[
//     {
//       игра1:проигрыш / промокод,
//       игра2:5 / промокод ,
//       игра3:под_системы / промокод,
//       выбранная:игра1
//     },
//     {
//       игра1:проигрыш / промокод,
//       игра2:5 / промокод ,
//       игра3:под_системы / промокод,
//       выбранная:игра1
//     },
//     {
//       игра1:проигрыш / промокод,
//       игра2:5 / промокод ,
//       игра3:под_системы / промокод,
//       выбранная:игра1
//     },  
//   ]


// }