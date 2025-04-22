<script setup lang="ts">
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()


const user: any = ref(null)



const fetchPacksCoffee = async () => {
  try {
    const { data } = await axios.get('http://3.70.45.39:5011/api/get_packs_coffee', {
      withCredentials: true
    })
    user.value = data
    console.log('coffee',user.value)
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error)
  }
}



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


  fetchPacksCoffee();

})
</script>

<template>
    <div class="main_block">


    
        <ScrollArea class="container">





            <div class="packing_work">
                <Table>
  <TableHeader class="head_of_table">
    <TableRow>
      <TableHead class="w-[100px] tbl">Номер лоту</TableHead>
      <TableHead class="tbl">Назва лоту</TableHead>
      <TableHead class="tbl">Остання дата обсмажки</TableHead>
      <TableHead class="tbl">Вага</TableHead>
      <TableHead class="tbl">Дія</TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>

  </TableBody>
</Table>

            </div> 

      </ScrollArea >
    </div>
</template>





<style scoped>
    .main_block{
        width: 100vw;
        height: 100vh;
        width: 100%;
        height: 100%;
        display: flex;
        flex-flow: column;
        align-items: center;
        background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
    }

    .button_line{
    margin-top: 10vh;
    width: 80vw;
  }


    .container{
        margin-top: 14vh;
        width: 80vw;
        height: 65vh;

        transition: transform 0.5s ease-in-out; /* Плавная анимация */
        background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        
  }
  .type{
    border: none;
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;
    cursor: pointer;
    color: white;
    padding: 1.5vh 2.5vh;
    margin-right: 1vw;
    font-size: 1vw;
    transition: .3s;
  }

  .packing_order{
    width: 100%;
    height: 10vw;
    border: 1px solid red;
  }

  .packing_work{
    
    width: 100%;
    height: 10vw;
    border: 1px solid red;
  }
</style>