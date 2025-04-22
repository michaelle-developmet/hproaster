<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import axios from 'axios';
import { ref } from 'vue';

definePageMeta({
  layout: 'auth'  // Указываем, что эта страница использует layout 'auth'
});

let awesome: boolean;

// Поля формы
const name = ref('');
const business_name = ref('');
const post = ref('');
const password = ref('');
const isWorker = ref(false); // Статус (владелец/работник)
const bossPost = ref(''); // Почта босса (если работник)


// Обработчик регистрации
const handleRegister = async () => {
  try {
    const requestData: Record<string, any> = {
      name: name.value,
      business_name: business_name.value,
      post: post.value,
      password: password.value,
      isWorker: isWorker.value,
    };

    if (isWorker.value) {
      requestData.bossPost = bossPost.value; // Добавляем почту босса
    }

    const response = await axios.post(
      'http://localhost:5011/register',
      requestData,
      {
        withCredentials: true, // Отправка cookies с запросом
      }
    );

    // Перенаправляем на главную страницу после успешной регистрации
    window.location.replace('/');
  } catch (error) {
    console.error('Error during registration:', error);
    alert('Error during registration');
  }
};

</script>

<template>
  <div class="glob">
    <div class="main_block">
        <Card class=" card_block">
      <CardHeader>
        <CardTitle class="text-xl">Регістрація</CardTitle>
        <CardDescription class="desc">
          Для регістрації нам потрібні деякі данні
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <!-- Имя и Название бизнеса -->
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="first-name">Ім'я</Label>
              <Input v-model="name" id="first-name" placeholder="Max" required class="input_style" />
            </div>
            <div class="grid gap-2">
              <Label for="last-name">Назва бізнесу</Label>
              <Input v-model="business_name" id="last-name" placeholder="Robinson" required class="input_style" />
            </div>
          </div>

          <!-- Почта -->
          <div class="grid gap-2">
            <Label for="post">Пошта</Label>
            <Input v-model="post" id="post" type="email" placeholder="m@example.com" required class="input_style" />
          </div>

          <!-- Пароль -->
          <div class="grid gap-2">
            <Label for="password">Пароль</Label>
            <Input v-model="password" id="password" type="password" required class="input_style" />
          </div>

          <div class="grid gap-2">
  <Label for="status">Статус</Label>
  <div class="flex items-center space-x-2">
    <input type="checkbox" v-model="isWorker" id="status"  />
    <label for="status">{{ isWorker ? 'Працівник' : 'Власник' }}</label>
  </div>
</div>

<!-- Почта босса (если выбран статус "работник") -->
<div v-if="isWorker" class="grid gap-2">
  <Label for="boss-post">Пошта босса</Label>
  <Input v-model="bossPost" id="boss-post" type="email" placeholder="boss@example.com" required class="input_style" />
</div>


          <!-- Кнопки -->
          <Button @click="handleRegister" type="button" class="w-full button">
            Створити аккаунт
          </Button>
          <!-- <Button variant="outline" class="w-full">
            Зарєструватись через Google
          </Button> -->
        </div>

        <!-- Ссылка на логин -->
        <div class="mt-4 text-center text-sm">
          Вже є аккаунт?
          <a href="/login" class="underline">Увійти</a>
        </div>
      </CardContent>
        </Card>
    </div>
  </div>

</template>

<style scoped>
.main_block {
    /* width: 25vw;
    height: 55vh;
    position: absolute;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: 20vh; */

}

.glob{
  background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card_block{
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(0px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;
    width: 50vw;
    border: none;
    color: #FFE31A;
    transition: 1.5s;
}

.desc{
  color: white;
}

.input_style{
  border-color: grey;
  outline: white;
}

.input_style::placeholder{
  color: white;

}

.input_style:active{
  border-color: white;
}

.button{
  background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(0px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;
    border: none;
}



</style>
