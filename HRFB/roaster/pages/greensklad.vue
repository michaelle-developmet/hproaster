<script setup lang="ts">
// <-- Импорты -->
import { ref , computed , onMounted , watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'
// <-- Импорты иконок -->
import { ChevronRight , ChevronLeft , Truck , Flame} from 'lucide-vue-next';
// <-- Импорты shadecn -->
import { Separator, ScrollArea, Button } from '@/components/ui';
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger,} from '@/components/ui/dialog'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RocketIcon } from '@radix-icons/vue'




// Массив который хранит все лоты
const invoice2 = ref<any[]>([]);



// Текущая страница
const currentPage = ref(1);
// Количество объектов на странице
const itemsPerPage = 10;

// Текущий лот для отображения
const selectedInvoice = ref<any | null>(null);

interface User {
    name: string;
    post: string;
}

let user:any = ref<User[]>
const fetchWorkers = async () => {
    try {
        const response = await axios.get('http://3.70.45.39:5011/api/team', {
            withCredentials: true, // Отправляем куки с запросом
        });
        user = response.data.user;
        invoice2.value = response.data.boss.datas.green_kava_work;
    } catch (error) {
        console.error('Ошибка при загрузке работников:', error);
    }
};



const paginatedData = computed(() => {
  // Фильтруем данные и добавляем флаг для тех товаров, у которых нет поставок
  const filteredData = invoice2.value.map((invoice) => {
    // Ищем последнюю поставку с типом 'postavka'
    const lastPostavka = invoice.operations.reverse().find((operation: { type: string; }) => operation.type === "arrive");
    
    // Если поставка есть, то сохраняем дату, иначе записываем 'нема поставки'
    const postavkaDate = lastPostavka ? lastPostavka.deliver_time : 'нема поставки';

    console.log("BBBBBB",lastPostavka)
    console.log("postavkaDate",postavkaDate)

    return {
      ...invoice,
      postavkaDate // добавляем или обновляем информацию о поставке
    };
  });

  // Разбиваем данные на страницы
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  // Возвращаем часть данных для текущей страницы
  return filteredData.slice(start, end);
});


// Общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(invoice2.value.length / itemsPerPage);
});
// Смена страницы
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const router = useRouter()

const progressLots = ref<any[]>([]); // Массив для хранения лотов со статусом "progress"

// Функция для фильтрации лотов со статусом "progress"
const filterProgressLots = () => {
  // Фильтруем лоты и сохраняем только те, у которых статус "progress"
  progressLots.value = invoice2.value.filter(lot => lot.status === 'progress');
  
  // Логируем отфильтрованные лоты, чтобы проверить результат
  console.log('Лоты со статусом "progress":', progressLots.value);
};

// Следим за изменениями в invoice2 и фильтруем лоты, когда данные загружены
watch(invoice2, (newData) => {
  if (newData.length > 0) {
    filterProgressLots(); // Фильтруем лоты только после того, как данные загрузятся
  }
});

// Функция для принятия поставки




const selectedInvoiceForRoasting = ref<any | null>(null); // Для выбранного лота
const orderVolume = ref<number>(0); // Объем для обсмажки
const orderDate = ref<string>(''); // Дата для обсмажки
const orderSource = ref<string>(''); // Источник заказа (от кого)
const isRoastingPopupOpen = ref<boolean>(false); // Статус попапа




const openRoastingPopup = (invoice: any) => {
  console.log('Открыт попап для лота:', invoice);  // Логируем данные лота
  selectedInvoiceForRoasting.value = invoice;
  orderVolume.value = 0;
  orderDate.value = orderDate.value || new Date().toISOString().split('T')[0]; // Если пустая, ставим текущую
  orderSource.value = '';

  isRoastingPopupOpen.value = true;
};




const closeRoastingPopup = () => {
  isRoastingPopupOpen.value = false;
};


const submitRoastingOrder = async () => {
  if (!selectedInvoiceForRoasting.value) {
    alert('Выберите лот для заказа');
    return; // Выход, если лот не выбран
  }

  // Проверка, что объем не превышает доступный на складе
  if (orderVolume.value <= 0 || orderVolume.value > selectedInvoiceForRoasting.value.globalWeight) {
    alert('Об\'єм не може перевищувати залишок на складі');
    return;
  }

  const orderData = {
    volume: orderVolume.value,
    date: orderDate.value,
    source: user.name,
    lotId: selectedInvoiceForRoasting.value.lotId,
  };

  try {
    const response = await axios.put(
      `http://3.70.45.39:5011/api/lots/${selectedInvoiceForRoasting.value.lotId}/roasting`,
      orderData,
      { withCredentials: true }
    );

    closeRoastingPopup(); // Закрыть попап после отправки
    fetchWorkers(); // Обновить список лотов
    alert('Замовлення на обсмажку оформлено');
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error);
    alert('Сталася помилка при оформленні замовлення');
  }
};






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


  fetchWorkers();
  filterProgressLots();
})


</script>

<template>

  <div class="main_block">



<div class="table_block">



  <Table> 
    <TableCaption class="capt">
      <!-- Пагинация -->
      <div class="pagination" style="display: flex;">

        <Button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="pagitation_button">
          <ChevronLeft />
        </Button>

        <span class="block">
       {{ currentPage }} из {{ totalPages }}
        </span>


        <Button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="pagitation_button">
          <ChevronRight />
        </Button>

      </div>
    </TableCaption>

    <TableHeader>
      <TableRow>
        <TableHead class="w-[100px] tbl">Номер лоту</TableHead>
        <!-- <TableHead>ID лоту</TableHead> -->
        <TableHead class="tbl">Назва лоту</TableHead>
        <TableHead class="tbl">Остання поставка</TableHead>
        <TableHead class="tbl">Актуальний залишок</TableHead>
        <TableHead class="tbl">Відправити на обсмажку</TableHead>
        <!-- <TableHead class="text-right">Інформація</TableHead> -->
      </TableRow>
    </TableHeader>

    <TableBody>
  <TableRow v-for="invoice in paginatedData" :key="invoice.lotId">
    <TableCell class="tbl">{{ invoice.lotNumber }}</TableCell>
    <TableCell class="tbl">{{ invoice.name }}</TableCell>
    <TableCell class="tbl">
  {{ invoice.postavkaDate === 'нема поставки' ? 'Нема поставки' : invoice.postavkaDate }}
</TableCell>

    <TableCell class="tbl">{{ invoice.globalWeight }} кг</TableCell>
    <TableCell class="tbl">
      
      
      <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" @click="openRoastingPopup(invoice)" class="btn_info">Замовити обсмажку</Button>

    </DialogTrigger>


    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
         <DialogTitle>Замовити обсмажку</DialogTitle>
      <DialogDescription>
        Вкажіть об'єм для обсмажки та інші дані.
      </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
      <!-- Поле для объема -->
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="volume" class="text-right">
          Об'єм (макс. {{ selectedInvoiceForRoasting?.globalWeight }} кг)
        </Label>
        <Input 
          id="volume" 
          type="number" 
          v-model="orderVolume" 
          :max="selectedInvoiceForRoasting?.globalWeight" 
          class="col-span-3" 
          placeholder="Введіть об'єм"
        />
      </div>

      <!-- Поле для даты -->
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="date" class="text-right">
          Дата готовності
        </Label>
        <Input 
          id="date" 
          type="date" 
          v-model="orderDate" 
          class="col-span-3" 
        />
      </div>

    </div>




      
      <DialogFooter>
        <Button @click="submitRoastingOrder">
        Замовити
      </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
    </TableCell>
  </TableRow>
</TableBody>
  </Table>

  
</div>

  </div>

  

</template>










<style scoped>

.btn_info{
  border: none;
    background: rgba(255, 255, 255, 0.07) !important;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    cursor: pointer;
    color: white;
    border-radius: 15px ;
}

.main_block{
    width: 100%;
    height: 100%;
    border: 1px solid red;
    display: flex;
    flex-flow: column;
    align-items: center;
    background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
}
    h1{
        font-size: 3vw;
        text-align: center;
        margin-top: 15vh;
    }

  .head_block{
    display: flex;
    margin: 15px;
    width: 100%;
    margin-top: 15vh;
    justify-content: space-around;
    max-width: 50vw;
  }
  .tbl{
    min-width: 100px;
    text-align: center;
    color: white;
  }

  .table_block{
    min-width: 80vw;
    max-width: 80vw;
    max-height: 70vh;

    margin-top: 15vh;

    padding: 2vh 5vh 5vh 5vh ;
    transform: translateX(0vw);
    transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;

  }

  .text_righ_blockt{
    display: flex;
    justify-content: flex-end
  }

  .flex{
    display: flex;
    margin-top: 20px;
    justify-content: center;
  }

  .truck{
    width: 25px;
    height: 25px;
    background-color: black;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center
  }

  .collection{
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-columns: 1fr 1fr;
  }

  .dia{
    min-width: 40vw;
  }
  .pagitation_button{
    padding: 10px;
    border: none;
    border-radius: 150px;

    background: rgba(12, 12, 12, 0.203) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(0px) !important;
  cursor: pointer;
  }


  .block{

    border-radius: 10px;
    min-width: 5vw;
    min-height: 5vh;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
    color: white;
  }

  .pagination{
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .arrive_lots{
    min-width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 25px 0;
  }
</style>
  