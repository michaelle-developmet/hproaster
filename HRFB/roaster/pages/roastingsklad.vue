<script setup lang="ts">
// <-- Импорты -->
import { ref , computed , onMounted , watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'
import { toRaw } from 'vue';

// <-- Импорты иконок -->
import { ChevronRight , ChevronLeft , Truck , Flame} from 'lucide-vue-next';
import { FlaskConicalOff } from 'lucide-vue-next';
import { Skeleton } from '@/components/ui/skeleton'

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
import { ThumbsUp } from 'lucide-vue-next';


import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RocketIcon } from '@radix-icons/vue'
import { SERVER_URL } from '../utils/con.js';


// Массив который хранит все лоты
const invoice2 = ref<any[]>([]);



// Текущая страница
const currentPage = ref(1);
// Количество объектов на странице
const itemsPerPage = 7;





// Текущий лот для отображения
const selectedInvoice = ref<any | null>(null);

const formData = ref({
  name: '',
  country: '',
  region: '',
  processing:'',
  varaiti:'',
  price:'',
  comment:'',
  packing:'',
  volume:'',
  arrive:'',
  maybearrive:''
  // остальные поля
});


// Обновленный тип для RoastFormData
const RoastFormData = ref<{
  batchSize: string;
  capping: boolean;
  roasting_time: string;
  lotId?: string; // Добавляем опциональное свойство lotId
}>({
  batchSize: '',
  capping: false,
  roasting_time: '',
  lotId: '', // Инициализируем пустым значением
});


const submitForm = async () => {
  try {
    const { data } = await axios.post(`${SERVER_URL}/api/submit-form`, formData.value,{
        withCredentials:true
    });
    // alert('Форма успешно отправлена');
    postavkaDialog.value = false;
    fetchWorkers();
  } catch (error) {
    console.error(error);
    alert('Ошибка при отправке формы');
  }
};

interface User {
    name: string;
    post: string;
}

let user:any = ref<User[]>

const fetchWorkers = async () => {
    try {
        const response = await axios.get(`${SERVER_URL}/api/team`, {
            withCredentials: true, // Отправляем куки с запросом
        });
        user = response.data.user;

        invoice2.value = response.data.boss.datas.roast_kava.roasted;


        // boss = response.data.boss;

        console.log(invoice2)
    } catch (error) {
        console.error('Ошибка при загрузке работников:', error);
    }
};

// Загружаем список работников при монтировании компонента


console.log(invoice2)
// Вычисляем данные для текущей страницы
const paginatedData = computed(() => {
  // Фильтрация данных
  const filtered = invoice2.value.filter(invoice => {
    return (
      (filters.value.name === "" || invoice.lotName.toLowerCase().includes(filters.value.name.toLowerCase())) &&
      (filters.value.batch === "" || invoice.batch_volume.toString().includes(filters.value.batch)) &&
      (filters.value.capping === "" || invoice.capping.toString().includes(filters.value.capping))
    );
  });

  // Сортировка по finish_time
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.finish_time).getTime();
    const dateB = new Date(b.finish_time).getTime();
    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Пагинация
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return sorted.slice(start, end);
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

const postavkaDialog = ref(false);



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
const acceptDelivery = async (lot: any) => {
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " "); // Форматируем текущую дату в формат "2024-16-09 - 19:43"
  
  try {
    // Отправляем запрос на сервер для обновления лота
    const response = await axios.put(`${SERVER_URL}/api/lots/${lot.lotId}`, {
      arrive: currentDate,
      status: 'sklad',
      roasting: false,
    
    },{
        withCredentials:true
    });
    progressLots.value = progressLots.value.filter((l) => l.lotId !== lot.lotId);
    fetchWorkers();
  } catch (error) {
    console.error('Ошибка при принятии поставки:', error);
  }
};

// Функция для открытия модала и добавления lotId в данные формы
const openInvoiceInfo = (invoice: any) => {
  selectedInvoice.value = invoice; // Устанавливаем выбранный лот
  RoastFormData.value.lotId = invoice.lotId; // Добавляем lotId в форму
};


const submitFormRoasting = async () => {
  try {
    // Получаем текущую дату и время
    const currentDate = new Date().toISOString();

    // Получаем "сырые" данные из реактивного объекта и добавляем ID лота
    const updatedFormData = {
      ...toRaw(RoastFormData.value), // Преобразуем в обычный объект
      roasting_time: currentDate, // Вставляем текущую дату и время
      lotId: selectedInvoice.value?.lotId, // Добавляем ID выбранного лота
    };

    // Проверка на случай, если лот не выбран
    if (!selectedInvoice.value) {
      alert("Не выбран лот для обработки.");
      return;
    }

    // Отправляем данные на сервер
    const { data } = await axios.post(`${SERVER_URL}/api/update-roasting`, updatedFormData, {
      withCredentials: true,
    });

    // Закрытие диалога или другие действия после успешной отправки
    postavkaDialog.value = false;

    // Вызовите alert или любую другую логику
    alert('Дані успішно збережено');
  } catch (error) {
    console.error(error);
    alert('Сталася помилка при збереженні даних');
  }
};



const formatDate = (dateString: string) => {
  // Преобразуем строку даты в объект Date
  const date = new Date(dateString);

  // Форматируем дату в нужный формат YYYY-DD-MM HH:mm
  const year = date.getFullYear();
  const day = String(date.getDate()).padStart(2, '0'); // Добавляем ведущий ноль
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Добавляем ведущий ноль (месяцы начинаются с 0)
  const hours = String(date.getHours()).padStart(2, '0'); // Добавляем ведущий ноль
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Добавляем ведущий ноль

  // Возвращаем отформатированную строку
  return `${year}-${day}-${month} ${hours}:${minutes}`;
};


const filters = ref({
  name: "",
  batch: "",
  capping: "",
});


const sortOrder = ref('asc');

// Функция для смены порядка сортировки
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
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


    <div class="filters">
      <input type="text" v-model="filters.name" placeholder="Omni" />
      <input type="text" v-model="filters.batch" placeholder="Батч" />
      <input type="text" v-model="filters.capping" placeholder="Каппінг" />
      <Button @click="toggleSortOrder">
  {{ sortOrder === 'asc' ? 'От старых к новым' : 'От новых к старым' }}
</Button>
      <!-- <Button @click="resetFilters">Reset</Button> -->
    </div>
    
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

      <TableHeader class="head_of_table" >


        <TableRow  >
          <TableHead class="w-[100px] tbl">Номер лоту</TableHead>

            <!-- <TableHead>ID лоту</TableHead> -->
            <TableHead class="tbl">     Назва лоту          </TableHead>
            <TableHead class="tbl">     Дата обсмажки       </TableHead>
            <TableHead class="tbl">     Обсмажено    </TableHead>
            <TableHead class="tbl">     Каппінг     </TableHead>
            <TableHead class="tbl">     Обсмажник            </TableHead>
            <TableHead class="tbl">     Батч         </TableHead>
            <TableHead class="tbl">     Актуальність        </TableHead>

        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="invoice in paginatedData"
          :key="invoice.lotId"
          class="cell"
        >
          <TableCell class="font-medium tbl">{{ invoice.lotNum }}</TableCell>
          <!-- <TableCell>{{ invoice.lotId }}</TableCell> -->
          <TableCell class="tbl">{{ invoice.lotName }}</TableCell>
          <TableCell class="tbl">{{ invoice.finish_time }}</TableCell>
          <TableCell class="tbl">{{ invoice.roasted_volume }} кг</TableCell>
          <TableCell class="tbl">{{ invoice.capping }}</TableCell>
          <TableCell class="tbl">{{ invoice.author }}</TableCell>
          <TableCell class="tbl">{{ invoice.batch_volume }}</TableCell>
          <TableCell class="tbl">
            <div :style="{
      backgroundColor: (invoice.actual_status) 
        ? (() => {
            // const invoiceDate = new Date(invoice.todayDate); // Преобразуем timestamp в объект Date
            // const currentDate = new Date();
            // const diffInTime = currentDate.getTime() - invoiceDate.getTime();
            // const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

            const status = invoice.actual_status

            if (status <= 1) return 'rgba(0, 255, 156, 0.700)'; // Если прошел 0 или 1 день — зеленый
            else return 'rgba(0, 255, 156, 0.700)'; // Если прошло 2 дня — желтый
            return '';
          })() 
        : ''
    }" class="truck " >
  <ThumbsUp style="width: 15px; color: white;"/>

    </div>
          </TableCell>

          
        </TableRow>
      </TableBody>
    </Table>
  </div>
    </div>

</template>


<style scoped>

.main_block{
    width: 100%;
    height: 100%;
    display: flex;
    overflow: hidden;
    background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
    background-repeat: no-repeat;
    background-size: 100vw 100vh;
}

h1{
    font-size: 3vw;
    text-align: center;
    margin-top: 15vh;
}

.special_btn{
  position: absolute;
  top: 50vh;
  right: 3vw;
  z-index: 100;

  background: rgba(12, 12, 12, 0.203) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(0px) !important;
  cursor: pointer;

  border: none;
  color: #FFE31A;
  padding: 0;
  height: 6vh;
  width: 6vh;
  border-radius: 30px;
  transform: translateX(0vw);
  transition: transform 0.5s ease-in-out; /* Плавная анимация */
}


.head_of_table{
  margin: 2vh;
}


.filters{
  display: flex;
  align-items: center;
  justify-content: space-around;
  overflow: hidden;
}

.filters > input{
  border: none;
  outline: none;
  background: rgba(37, 37, 37, 0) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(0px) !important;
  -webkit-backdrop-filter: blur(0px) !important;
  border-radius: 10px !important;
  transition: .1s ;
  padding-left: 1vw;
  padding: .5vw;
  color: white;
  font-size: 1vw;
}

.filters > input::placeholder{
  font-size: 1vw;
}

  .head_block{
    display: flex;
    margin: 15px;
    width: 100%;
    margin-top: 15vh;
    justify-content: space-around;
    max-width: 50vw;
  }

  .table_block{
    min-width: 80vw;
    max-width: 80vw;
    max-height: 70vh;
    /* margin-top: 15vh; */
    /* margin-left: 5vh; */
    margin-top: 15vh;
    margin-left: 10vw;

    padding: 2vh 5vh 5vh 5vh ;
    transform: translateX(0vw);
    transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;
}

.table_block.moved {
  transform: translateX(-90vw); /* Смещение по нажатию */
}


.special_btn.moved{
  position: absolute;
  z-index: 100;
  background-color: yellow;
  color: black;
  padding: 1.5vw;
  height: 6vh;
  border-radius: 30px;
  transform: translateX(-90vw ) rotate(180deg);
  transition: transform 0.5s ease-in-out; /* Плавная анимация */
  color: #FFE31A;
}
  

  .tbl{
    min-width: 100px;
    text-align: center;
  color: white;
  }

  .text_righ_blockt{
    align-items: center;
    justify-content: center;
    text-align: right;
}

  .flex{
    display: flex;
    margin-top: 20px;
    justify-content: center;
  }

  .truck{
    width: 75px;
    height: 25px;
    background-color: transparent;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 20%;
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


  .block{
    border-radius: 10px;
    min-width: 5vw;
    min-height: 5vh;
    display: flex;
    align-items: center;
    justify-content: center;
    /* margin: 0 10px; */
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


  .roast_dialog{
    border: none;
    background: rgba(255, 255, 255, 0.07) !important;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    cursor: pointer;
    color: white;
    border-radius: 15px ;
  }

  .roast_dialog:hover{

    background: rgba(255, 255, 255, 0.07) !important;


  }

  
</style>
  
