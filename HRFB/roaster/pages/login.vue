<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'

definePageMeta({
  layout: 'auth'  // Указываем, что эта страница использует layout 'auth'
});

// Состояния для формы логина
const post = ref('')
const password = ref('')

// Функция для отправки данных на сервер
const loginUser = async () => {
  try {
    const response = await axios.post('http://3.70.45.39:5011/api/login', {
      post: post.value,  // Используем post вместо email
      password: password.value,
    }, {
      withCredentials: true,  // Отправка cookies с запросом
    })
    
    // Если успешная авторизация, переходим на домашнюю страницу
    if (response.status === 200) {
      window.location.href = '/'  // Переход на главную страницу
    }
  } catch (error) {
    console.error('Ошибка при логине:', error)
    alert('Ошибка при входе. Пожалуйста, проверьте данные и попробуйте снова.')
  }
}
</script>

<template>
  <div class="glob">
    <div class="main_block">
    <Card class="mx-auto max-w-sm card_block">
      <CardHeader>
        <CardTitle class="text-2xl">
          Вхід до аккаунту
        </CardTitle>
        <CardDescription class="desc">
          Введіть вашу пошту та пароль
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="post">Пошта</Label> <!-- Используем post -->
            <Input
              id="post"
              type="text"
              v-model="post"
              placeholder="Ваша пошта"
              required
              class="input_style"
            />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="password">Пароль</Label>
            </div>
            <Input
              id="password"
              type="password"
              v-model="password"
                            placeholder="Ваш пароль"
              required
                            class="input_style"
            />
          </div>
          <Button @click="loginUser" class="w-full button" >
            Увійти
          </Button>
        </div>
        <div class="mt-4 text-center text-sm">
          Немає аккаунту?
          <a href="/registration" class="underline">
            Зарєструватись
          </a>
        </div>
      </CardContent>
    </Card>
  </div>
  </div>
</template>

<style scoped>

.glob{
  background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.main_block {
  /* width: 25vw;
  height: 65vh;
  position: absolute;
  margin: 0 auto;
  left: 0;
  right: 0;
  top: 20vh; */
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
}

.input_style{
  border-color: grey;
  outline: white;
}
.desc{
  color: white;
}

.input_style::placeholder{
  color: white;

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
