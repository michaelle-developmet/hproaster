<template>
    <div class="main_block">
      <!-- Отображение текущей страницы с анимацией -->
      <div class="time" :class="{ 'animate-text': isPageChanging }">{{ currentPageName }}</div>
      <BellDot class="notification"></BellDot>
  
      <!-- Скрытые элементы: каунтер и аватар -->
      <div class="hover_content">
        <div class="counter">00:00:00 ></div>
        <div class="avatar"></div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { ref, watch } from 'vue';
  import { BellDot } from 'lucide-vue-next';
  
  // Получаем текущий маршрут
  const route = useRoute();
  
  // Логика для определения названия текущей страницы
  const currentPageName = computed(() => {
    const path = route.path;
    if (path === '/') return 'Головна';
    if (path === '/profile') return 'Профіль';
    if (path === '/green') return 'Замовлення';
    if (path === '/workcalc') return 'Робочий графік';
    if (path === '/login') return 'Логін';
    if (path === '/registration') return 'Реєстрація';
    if (path === '/greensklad') return 'Склад ЗК';
    if (path === '/roastingwork') return 'Обсмажка';
    if (path === '/roastingsklad') return 'Склад ОМ';
    if (path === '/addition') return 'Додаткове';
    if (path === '/assorti') return 'Асортимент';
    if (path === '/settings') return 'Налаштування';
    if (path === '/packingwork') return 'Фасовка';
    if (path === '/packingsklad') return 'Фасовка СК';
    
    

    
    
    
    
    
    // Добавьте другие страницы по аналогии
    return 'Неизвестная страница';
  });
  
  // Для отслеживания изменения страницы
  const isPageChanging = ref(false);
  
  // Следим за изменением маршрута
  watch(() => route.path, () => {
    isPageChanging.value = true;
    setTimeout(() => {
      isPageChanging.value = false;
    }, 1000); // Время, чтобы завершить анимацию
  });
  </script>
  


  <style scoped>
  /* Основная анимация для текста */
  @keyframes resizeText {
    0% {
      font-size: 0;
      opacity: 0;
    }
    100% {
      font-size: 1em; /* Текущий размер шрифта */
      opacity: 1;
    }
  }
  
  /* Применяем анимацию при изменении текста */
  .animate-text {
    animation: resizeText .2s ease-in-out;
  }
  
  /* Основной контейнер */
  .main_block {
    background-color: black;
    color: #ffffff;
    display: flex; /* Flexbox для горизонтального расположения */
    align-items: center;
    justify-content: center; /* Центрируем элементы */
    overflow: hidden;
  
    position: absolute;
    margin: 0 auto;
    left: 0;
    right: 0;
    text-align: center;
    top: 2.5vh;
    width: 14vw; /* Узкая ширина по умолчанию */
    height: 6vh;
    border-radius: 50px;
    transition: width 0.5s ease, box-shadow 0.5s ease;
    box-shadow: 1px 1px 75px 0px rgba(255, 255, 255, 0.75);
    cursor: pointer;
  }
  
  /* Увеличение ширины при наведении */
  .main_block:hover {
    width: 30vw; /* Расширение блока */
    box-shadow: 1px 1px 75px 0px #FFCFEF;
  }
  
  /* Время (всегда по центру) */
  .time {
    font-size: 1em;
    flex-shrink: 0; /* Не позволяет времени сжиматься */
    z-index: 1; /* Гарантирует, что время остаётся видимым */
  }
  
  /* Скрытые элементы */
  .hover_content {
    display: flex; /* Flexbox для горизонтального расположения */
    flex-direction: row;
    align-items: center;
    justify-content: space-between; /* Распределяем элементы равномерно */
    gap: 10px; /* Расстояние между каунтером и аватаром */
    position: absolute; /* Для независимого позиционирования */
    left: 0;
    right: 0;
    width: 100%; /* Растягиваем по ширине контейнера */
    opacity: 0; /* Скрываем по умолчанию */
    transform: scale(0.95); /* Уменьшаем для эффекта появления */
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  /* Отображаем скрытые элементы при наведении */
  .main_block:hover .hover_content {
    opacity: 1; /* Делаем видимыми */
    transform: scale(1); /* Возвращаем к нормальному размеру */
  }
  
  /* Счётчик (слева от времени) */
  .counter {
    font-size: 1em;
    margin-right: auto; /* Отталкивает влево */
    margin-left: 20px;
  }
  
  /* Аватар (справа от времени) */
  .avatar {
    width: 30px;
    height: 30px;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.5);
    margin-left: auto; /* Отталкивает вправо */
    margin-right: 20px;
  }

  .notification{
    color: red;
    width: 1.5vw;
    margin-left: 1vw;
  }
  </style>
  