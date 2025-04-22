<script setup lang="ts">// <-- Импорты -->
import { ref , computed , onMounted , watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'
import { toRaw } from 'vue';

// <-- Импорты иконок -->
import { ChevronRight , ChevronLeft , Truck , Flame} from 'lucide-vue-next';
import { Clock } from 'lucide-vue-next';
import { Switch } from '@/components/ui/switch'
import { Heater } from 'lucide-vue-next';
import { MoveRight } from 'lucide-vue-next';
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

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RocketIcon } from '@radix-icons/vue'



const isLoading = ref(true);

// Массив который хранит все лоты
const invoice2 = ref<any[]>([]);

const toRoastList = ref<any[]>([]);

const inRoastList = ref<any[]>([]);



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
  uzharka: string;
  capping: string;
  lotId?: string; // Добавляем опциональное свойство lotId
  roastId?:string;
}>({
  batchSize: '',
  uzharka: '',
  capping: '',
  lotId: '', // Инициализируем пустым значением
  roastId:'',
});

// Обновленный тип для RoastFormData
const FinishRoastFormData = ref<{
  batch_volume: string;
  roasted_volume: string;
  capping: string;
  lotId?: string; // Добавляем опциональное свойство lotId
  roastId?:string;
}>({
  batch_volume: '',
  roasted_volume: '',
  capping: '',
  lotId: '', // Инициализируем пустым значением
  roastId:'',
});


const submitForm = async () => {
  try {
    const { data } = await axios.post('http://3.70.45.39:5011/api/submit-form', formData.value,{
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

// const fetchUserAccess = async (workerPost: string) => {
//   try {
//     const response = await axios.post(
//       'http://localhost:5011/user/access',
//       { post: workerPost },
//       { withCredentials: true }
//     );
//   } catch (error) {
//     console.error('Ошибка получения доступов:', error);
//   }
// };

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
        toRoastList.value = response.data.boss.datas.roast_kava.to_roast;
        inRoastList.value = response.data.boss.datas.roast_kava.in_roast;
        // boss = response.data.boss;

        console.log("To Roast List",toRoastList)
        console.log('In Roast List',inRoastList)
    } catch (error) {
        console.error('Ошибка при загрузке работников:', error);
    }
};

// Загружаем список работников при монтировании компонента


// Вычисляем данные для текущей страницы
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return toRoastList.value.slice(start, end);
});

const paginatedDataInRoast = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return inRoastList.value.slice(start, end);
});
//inRoastList
// Общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(toRoastList.value.length / itemsPerPage);
});

const totalPagesinRoastList = computed(() => {
  return Math.ceil(inRoastList.value.length / itemsPerPage);
});

// Смена страницы
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const changePageinRoastList = (page: number) => {
  if (page > 0 && page <= totalPagesinRoastList.value) {
    currentPage.value = page;
  }
};

const router = useRouter()

const progressLots = ref<any[]>([]); // Массив для хранения лотов со статусом "progress"

const postavkaDialog = ref(false);



// Функция для фильтрации лотов со статусом "progress"
const filterProgressLots = () => {
  // Фильтруем лоты и сохраняем только те, у которых статус "progress"
  progressLots.value = toRoastList.value.filter(lot => lot.status === 'progress');
  
  // Логируем отфильтрованные лоты, чтобы проверить результат
  console.log('Лоты со статусом "progress":', progressLots.value);
};

// Следим за изменениями в invoice2 и фильтруем лоты, когда данные загружены
watch(toRoastList, (newData) => {
  if (newData.length > 0) {
    filterProgressLots(); // Фильтруем лоты только после того, как данные загрузятся
  }
});



//inRoastList
watch(inRoastList, (newData) => {
  if (newData.length > 0) {
    filterProgressLots(); // Фильтруем лоты только после того, как данные загрузятся
  }
});

// Функция для открытия модала и добавления lotId в данные формы
const openInvoiceInfo = (invoice: any) => {
  selectedInvoice.value = invoice; // Устанавливаем выбранный лот
  RoastFormData.value.lotId = invoice.lotId; // Добавляем lotId в форму
  RoastFormData.value.roastId = invoice.roastId; // Добавляем lotId в форму

};

const openFinichInvoice = (invoice: any) => {
  selectedInvoice.value = invoice;
  FinishRoastFormData.value.lotId = invoice.lotId;
  FinishRoastFormData.value.roastId = invoice.roastId;
}


const submitFormRoasting = async () => {
  try {
    // Получаем текущую дату и время
    const currentDate = new Date();
    
    // Форматируем дату в формат "YYYY-MM-DD HH:MM"
    const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " "); // 2024-12-23 23:55

    // Получаем "сырые" данные из реактивного объекта и добавляем ID лота
    const updatedFormData = {
      ...toRaw(RoastFormData.value), // Преобразуем в обычный объект
      roasting_time: formattedDate, // Вставляем отформатированную дату
      lotId: selectedInvoice.value?.lotId, // Добавляем ID выбранного лота
      roastId:selectedInvoice.value?.roastId,
      roast_volume:selectedInvoice.value?.roast_volume,
      green_volume:selectedInvoice.value?.green_volume,
      lotName:selectedInvoice.value?.lotname,
      lotNum:selectedInvoice.value?.lotNum,
    };

    // Проверка на случай, если лот не выбран
    if (!selectedInvoice.value) {
      alert("Не выбран лот для обработки.");
      return;
    }

    // Отправляем данные на сервер
    const { data } = await axios.post('http://3.70.45.39:5011/api/update-roasting', updatedFormData, {
      withCredentials: true,
    });

    // Закрытие диалога или другие действия после успешной отправки
    fetchWorkers();

    // Вызовите alert или любую другую логику

  } catch (error) {
    console.error(error);
    alert('Сталася помилка при збереженні даних');
  }
};

const submitFormFinishRoasting = async () => {
  try {
    // Получаем текущую дату и время
    const currentDate = new Date();
    
    // Форматируем дату в формат "YYYY-MM-DD HH:MM"
    const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " "); // 2024-12-23 23:55

    // Получаем "сырые" данные из реактивного объекта и добавляем ID лота
    const updatedFormData = {
      ...toRaw(FinishRoastFormData.value), // Преобразуем в обычный объект
      finish_time: formattedDate, // Вставляем отформатированную дату
      lotId: selectedInvoice.value?.lotId, // Добавляем ID выбранного лота
      roastId:selectedInvoice.value?.roastId,
      roast_volume:selectedInvoice.value?.roast_volume,
      green_volume:selectedInvoice.value?.green_volume,
      lotName:selectedInvoice.value?.lotName,
      lotNum:selectedInvoice.value?.lotNum,
    };

    // Проверка на случай, если лот не выбран
    if (!selectedInvoice.value) {
      alert("Не выбран лот для обработки.");
      return;
    }

    console.log(updatedFormData)

    // Отправляем данные на сервер
    const { data } = await axios.post('http://3.70.45.39:5011/api/finish_roasting', updatedFormData, {
      withCredentials: true,
    });



    // Закрытие диалога или другие действия после успешной отправки
    fetchWorkers();

    // Вызовите alert или любую другую логику

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


const isMoved = ref(false);

const moveTable = () => {
  isMoved.value = !isMoved.value;
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
    
    isLoading.value = false; // Отключаем загрузку после получения данных



})


</script>

<template>


    <div class="main_block">

      <Button 
  @click="moveTable" 
  :class="{ moved: isMoved }" 
  class="special_btn" 
  variant="outline"
>  
<MoveRight />
</Button>
  
  <div  :class="['table_block', { moved: isMoved }]">
    
    <div v-if="isLoading" class="skeleton-wrapper">
      <Skeleton class="w-full h-12 rounded-md mb-4" /> <!-- Имитируем заголовок -->
      <Skeleton class="w-full h-8 rounded-md mb-2" /> <!-- Имитируем строку таблицы -->
      <br>
      <Skeleton class="w-full h-8 rounded-md mb-2" />
      <Skeleton class="w-full h-8 rounded-md mb-2" />
      <Skeleton class="w-full h-8 rounded-md mb-2" />
      <Skeleton class="w-full h-8 rounded-md mb-2" />
      <Skeleton class="w-full h-8 rounded-md mb-2" />
      <Skeleton class="w-full h-8 rounded-md" />
  </div>


    <Table v-else class="table_load"> 
      <TableCaption class="capt">
        <!-- Пагинация -->
        <div class="pagination" style="display: flex;">

          <Button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="pagitation_button">
            <ChevronLeft />
          </Button>

          <span class="block">
         {{ currentPage }} з {{ totalPages }}
          </span>


          <Button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="pagitation_button">
            <ChevronRight />
          </Button>

        </div>
      </TableCaption>

      <TableHeader >
        <TableRow class="tbl_row">
          <TableHead class="w-[100px] tbl">Номер лоту</TableHead>
          <!-- <TableHead>ID лоту</TableHead> -->
          <TableHead class="tbl">Назва лоту</TableHead>
          <TableHead class="tbl">Об'єм</TableHead>
           <TableHead class="tbl">Об'єм зеленої кави</TableHead>
           <TableHead class="text-left tbl">Дата замовлення</TableHead>
           <TableHead class="text-left tbl">На коли</TableHead>
           <TableHead class="text-left tbl">Видано</TableHead>
          <TableHead class="text-left tbl">Статус</TableHead>
          <TableHead class="text-right tbl">Обсмажити</TableHead>
          <!-- <TableHead class="text-right">Інформація</TableHead> -->
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
          <TableCell class="tbl">{{ invoice.lotname }}</TableCell>
          <TableCell class="tbl">{{ invoice.roast_volume }} кг</TableCell>
          <TableCell class="tbl">{{ invoice.green_volume }} кг</TableCell>
          <TableCell class="tbl">{{ invoice.todayDate }} </TableCell>
          <TableCell class="tbl">{{ invoice.date }} </TableCell>
          <TableCell class="tbl">{{ invoice.author }} </TableCell>
          <TableCell>
  <div :style="{
      backgroundColor: (invoice.todayDate) 
        ? (() => {
            const invoiceDate = new Date(invoice.todayDate); // Преобразуем timestamp в объект Date
            const currentDate = new Date();
            const diffInTime = currentDate.getTime() - invoiceDate.getTime();
            const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

            if (diffInDays <= 1) return 'rgba(0, 255, 156, 0.700)'; // Если прошел 0 или 1 день — зеленый
            if (diffInDays === 2) return 'rgba(255, 230, 0, 0.700)'; // Если прошло 2 дня — желтый
            if (diffInDays >= 3) return 'rgba(255, 70, 70,0.700)'; // Если прошло 3 дня и более — красный
            return '';
          })() 
        : ''
    }" class="truck " >

    <Clock style="width: 15px; color: white;" />
  </div>
          </TableCell>
          <TableCell class="tbl">
  <!-- Условный рендеринг с дополнительным статусом -->


  <Dialog>
  <DialogTrigger as-child>
    <Button @click="openInvoiceInfo(invoice)" class="roast_dialog">Обсмажити</Button>
  </DialogTrigger>
  <DialogContent class="xl:max-w-[825px]">
    <DialogHeader>
      <DialogTitle>Налаштування обсмажки</DialogTitle>
      <DialogDescription>
        Номер лоту: {{ invoice.lotNum }} <br>
        Обʼєм замовлення: {{ invoice.roast_volume }} <br>
        Обʼєм зеленої кави: {{ invoice.green_volume }} <br>
      </DialogDescription>
    </DialogHeader>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="batchSize" class="text-right">Об'єм батчу</Label>
        <Input id="batchSize" v-model="RoastFormData.batchSize" class="col-span-3" placeholder="Введіть об'єм батчу" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="batchSize" class="text-right">Ужарка</Label>
        <Input id="batchSize" v-model="RoastFormData.uzharka" class="col-span-3" placeholder="Введіть об'єм батчу" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="batchSize" class="text-right">Оцінка каппінгу</Label>
        <Input id="batchSize" v-model="RoastFormData.capping" class="col-span-3" placeholder="Введіть об'єм батчу" />
      </div>
    </div>
    <DialogFooter>
      <Button @click="submitFormRoasting">Зберегти зміни</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

          </TableCell>
          </TableRow>
        </TableBody>
    </Table>
  </div>

  <div  :class="['table_block', { moved: isMoved }]">
    <Table> 
      <TableCaption class="capt">
        <!-- Пагинация -->
        <div class="pagination" style="display: flex;">

          <Button @click="changePageinRoastList(currentPage - 1)" :disabled="currentPage === 1" class="pagitation_button">
            <ChevronLeft />
          </Button>

          <span class="block">
         {{ currentPage }} из {{ totalPagesinRoastList }}
          </span>


          <Button @click="changePageinRoastList(currentPage + 1)" :disabled="currentPage === totalPagesinRoastList" class="pagitation_button">
            <ChevronRight />
          </Button>

        </div>
      </TableCaption>

      <TableHeader >
        <TableRow class="tbl_row">
          <TableHead class="w-[100px] tbl">Номер лоту</TableHead>
          <!-- <TableHead>ID лоту</TableHead> -->
          <TableHead class="tbl">Назва лоту</TableHead>
          <TableHead class="tbl">Об'єм</TableHead>
           <TableHead class="tbl">Об'єм Батчу</TableHead>
           <TableHead class="text-left tbl">Каппінг</TableHead>
           <TableHead class="text-left tbl">Ужарка</TableHead>
           <TableHead class="text-left tbl">Розпочато</TableHead>
           <TableHead class="text-left tbl">Обсмажник</TableHead>
          <TableHead class="text-right tbl">Обсмажити</TableHead>
          <!-- <TableHead class="text-right">Інформація</TableHead> -->
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="invoice in paginatedDataInRoast"
          :key="invoice.lotId"
          class="cell"
        >
          <TableCell class="font-medium tbl">{{ invoice.lotNum }}</TableCell>
          <!-- <TableCell>{{ invoice.lotId }}</TableCell> -->
          <TableCell class="tbl">{{ invoice.lotName }}</TableCell>
          <TableCell class="tbl">{{ invoice.roast_volume }} кг</TableCell>
          <TableCell class="tbl">{{ invoice.batchSize }} </TableCell>
          <TableCell class="tbl">{{ invoice.capping }} </TableCell>
          <TableCell class="tbl">{{ invoice.uzharka }} </TableCell>
          <TableCell class="tbl">{{ invoice.roasting_time }} </TableCell>
          <TableCell class="tbl">{{ invoice.author }} </TableCell>
          <TableCell class="tbl">
  <!-- Условный рендеринг с дополнительным статусом -->


  <Dialog>
  <DialogTrigger as-child>
    <Button @click="openFinichInvoice(invoice)" variant="outline" style="color: black;">Завершити</Button>
  </DialogTrigger>
  <DialogContent class="xl:max-w-[825px]">
    <DialogHeader>
      <DialogTitle>Налаштування обсмажки</DialogTitle>
      <DialogDescription>
        Номер лоту: {{ invoice.lotNum }} <br>
        Обʼєм замовлення: {{ invoice.roast_volume }} <br>
        Обʼєм зеленої кави: {{ invoice.green_volume }} <br>
      </DialogDescription>
    </DialogHeader>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="batchSize" class="text-right">Номер батчу</Label>
        <Input id="batchSize" v-model="FinishRoastFormData.batch_volume" class="col-span-3" placeholder="Введіть об'єм батчу" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="batchSize" class="text-right">Об'єм обсмаженої кави</Label>
        <Input id="batchSize" v-model="FinishRoastFormData.roasted_volume" class="col-span-3" placeholder="Введіть об'єм батчу" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="batchSize" class="text-right">Статус каппінга</Label>
        <Input id="batchSize" v-model="FinishRoastFormData.capping" class="col-span-3" placeholder="Введіть об'єм батчу" />
      </div>
    </div>
    <DialogFooter>
      <Button @click="submitFormFinishRoasting">Зберегти зміни</Button>
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

.main_block{
    width: 100%;
    height: 100%;
    display: flex;
    /* align-items: center; */
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
    padding: 5vh;
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
  /* border-radius: 25px !important; */
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
  