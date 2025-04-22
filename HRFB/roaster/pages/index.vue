<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Проверка наличия токена в куки при монтировании компонента
onMounted(() => {
  // Получаем все куки
  const cookies = document.cookie;
  console.log("Cookies:", cookies); // Выводим все куки в консоль

  // Проверяем, есть ли токен в куки
  const token = cookies.split('; ').find(row => row.startsWith('token='));

  // Если токен найден, token будет не undefined
  if (token) {
    console.log("Token found:", token);  // Выводим токен в консоль
  } else {
    console.log("No token found, redirecting to login...");
  }

  if (!token) {
    // Если токен отсутствует, перенаправляем на страницу логина
    router.push('/login')
  }
})
</script>

<template>
    <div class="global">
        <div class="main_block">



<div class="collector">
    <div >
        <p class="head_text">Зелена кава</p>
        <p class="weight">2,3 кг</p>
        <p class="comprasion">-3,65%          <span class="addition">Меньше попереднього тижня</span></p>

    </div>
    <div >
        <p class="head_text">Обсмажка</p>
        <p class="weight">2,3 кг</p>
        <p class="comprasion">-3,65%          <span class="addition">Меньше попереднього тижня</span></p>

    </div>
    <div >
        <p class="head_text">Фасофка</p>
        <p class="weight">2,3 кг</p>
        <p class="comprasion">-3,65%          <span class="addition">Меньше попереднього тижня</span></p>

    </div>
    <div >
        <p class="head_text">Готова кава</p>
        <p class="weight">2,3 кг</p>
        <p class="comprasion">-3,65%          <span class="addition">Меньше попереднього тижня</span></p>

    </div>
</div>
    </div>
    </div>



</template>

<style scoped>

.global{
  background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
  width: 100vw;
  height: 100vh;
}

.main_block{
    width: 100%;
    height: 100%;
    /* border: 1px solid red; */
    display: flex;
    flex-flow: column;
    margin-top: 15vh;
    align-items: center;

}
    h1{
        font-size: 3vw;
        text-align: center;
        margin-top: 15vh;
    }

    .collector{
        display: grid;
        grid-template-columns: 2fr 2fr;
    }

    .collector > div{
        min-width: 30vw;
        min-height: 25vh;
        margin: 20px;
        padding: 15px;
        border-radius: 25px;
        background: rgba(12, 12, 12, 0.527);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(0px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;
        display: flex;
        flex-flow: column;
        justify-content: center;
        cursor: pointer;
        transition: .2s;
    }
    .collector > div:hover{
        box-shadow: 1px 1px 75px 0px #FFCFEF;
        transition: .2s;
    }

    .head_text{
        font-size: 2vw;
        color: white;
    }

    .weight{
        font-size: 2.5vw;
        color: white;
    }

    .comprasion{
        font-size: 1vw;
        color: white;
    }


    .addition{
        font-size: 1vw;
        
        color: #FFE31A;
    }


    
</style>
  