<script setup lang="ts">
import { useRouter } from 'vue-router'
import axios from 'axios'
import { SERVER_URL } from '../utils/con.js';

const router = useRouter()


const user: any = ref(null)



const fetchPacksCoffee = async () => {
  try {
    const { data } = await axios.get(`${SERVER_URL}/api/get_packs_coffee`, {
      withCredentials: true
    })
    user.value = data.data
    console.log('coffee',user.value )
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
              <ScrollArea class="rounded-md area">
    <div class="p-4 ">
      <div class="heaad">
        <span>Номер лоту</span>
        <span>Назва лоту</span>
        <span>ID лоту</span>
        <span>Загальна зафасована вага</span>
        <span>Детальна інформація</span>
      </div>
      <!-- Список товаров -->
      <div v-for="(coffe, index) in user" :key="coffe.lotId" class="uniq_position">
  <!-- Номер в таблице -->
  <span>{{ index + 1 }}</span>

  <!-- Название лота -->
  <span>{{ coffe.lotName }}</span>

  <!-- ID лота -->
  <span>{{ coffe.lotId }}</span>

  <!-- Глобальный вес -->
  <span>{{ coffe.globalPackWeight }} кг</span>

        <!-- Кнопка 2 - открывает подробную информацию -->
        <Dialog >
          <DialogTrigger as-child>
            <Button variant="outline"class="btn_info" style="color: black; width: 220px;">
              Дивитись
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Інформація про товар</DialogTitle>
              <DialogDescription>
                Тут ви можете побачити всі дані про товар.
              </DialogDescription>
            </DialogHeader>

            <!-- <div class="grid gap-4 py-4">
              <div>
                <span><strong>Номер лоту:</strong> {{ selectedInvoice?.lotNumber }}</span>
              </div>
              <div>
                <span><strong>ID лоту:</strong> {{ selectedInvoice?.lotId }}</span>
              </div>
              <div>
                <span><strong>Назва лоту:</strong> {{ selectedInvoice?.name }}</span>
              </div>
              <div>
                <span><strong>Дата замовлення:</strong> {{ selectedInvoice?.date }}</span>
              </div>
              <div>
                <span><strong>Дата доставки:</strong> {{ selectedInvoice?.arrive }}</span>
              </div>
              <div>
                <span><strong>Орієнтовна дата доставки:</strong> {{ selectedInvoice?.maybearrive }}</span>
              </div>
              <div>
                <span><strong>Вараїті:</strong> {{ selectedInvoice?.varaiti }}</span>
              </div>
              <div>
                <span><strong>Об'єм:</strong> {{ selectedInvoice?.volume }}</span>
              </div>
              <div>
                <span><strong>Вартість:</strong> {{ selectedInvoice?.price }}</span>
              </div>
              <div>
                <span><strong>Фасофка:</strong> {{ selectedInvoice?.packing }}</span>
              </div>
              <div>
                <span><strong>Обробка:</strong> {{ selectedInvoice?.processing }}</span>
              </div>
              <div>
                <span><strong>Коментар:</strong> {{ selectedInvoice?.comment }}</span>
              </div>
              <div>
                <span><strong>Статус:</strong> {{ selectedInvoice?.status }}</span>
              </div>
            </div> -->

            <DialogFooter>
              <!-- <Button type="button" variant="outline" @click="closeInvoiceInfo">
                Закрити
              </Button> -->
              <Button type="button" variant="outline">
                Закрити
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> 

        <!-- Диалоговое окно с подробной информацией -->

      </div>


    </div>
  </ScrollArea>

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


  .heaad{
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;

}

.heaad > span{

width: 220px;
}

.uniq_position{
  color: white;
  margin-top: 1vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid white;
  padding-bottom: 10px;
}

.uniq_position > span{
  width: 220px;

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
  }

  .packing_work{
    
    width: 100%;
    height: 10vw;
  }
</style>