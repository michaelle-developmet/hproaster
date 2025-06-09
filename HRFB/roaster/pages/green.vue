<script setup lang="ts">

// rgba(0, 255, 156, 0.700)
// <-- Импорты -->
import { ref , computed , onMounted , watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'

// <-- Импорты иконок -->
import { ChevronRight , ChevronLeft , Truck} from 'lucide-vue-next';


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
import { SERVER_URL } from '../utils/con.js';


// Массив который хранит все лоты
const invoice2 = ref<any[]>([]);

const postavki = ref<any[]>([]);



// Текущая страница
const currentPage = ref(1);
// Количество объектов на странице
const itemsPerPage = 7;





// Текущий лот для отображения
const selectedInvoice = ref<any | null>(null);
  const selectedPostavka = ref<any | null>(null);

// Открыть модал с информацией о лоте
const openInvoiceInfo = (invoice: any) => {
  selectedInvoice.value = invoice;
};

const openPostavkaInfo = (postavochka: any) => {
  selectedPostavka.value = postavochka;
};

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
        const response = await axios.get(`${SERVER_URL}/api/team`, {
            withCredentials: true, // Отправляем куки с запросом
        });
        user = response.data.user;

        invoice2.value = response.data.boss.datas.green_kava_work;
        // boss = response.data.boss;

        console.log("Invoice",invoice2)
        console.log("User",response.data.boss.datas.big_direct_kava)
    } catch (error) {
        console.error('Ошибка при загрузке работников:', error);
    }
};

const fetchPostavki = async () => {
    try {
        const response = await axios.get(`${SERVER_URL}/api/team`, {
            withCredentials: true, // Отправляем куки с запросом
        });
        user = response.data.user;

        postavki.value = response.data.boss.datas.big_direct_kava;
        // boss = response.data.boss;

    } catch (error) {
        console.error('Ошибка при загрузке работников:', error);
    }
};

// Загружаем список работников при монтировании компонента


// Вычисляем данные для текущей страницы
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return invoice2.value.slice(start, end);
});

const paginatedDataPostavki = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return postavki.value.slice(start, end);
});

// Общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(invoice2.value.length / itemsPerPage);
});

const totalPagesPostavki = computed(() => {
  return Math.ceil(postavki.value.length / itemsPerPage);
});




// Смена страницы
const changePage = (page: number) => {
  if (page > 0 && page <= totalPagesPostavki.value) {
    currentPage.value = page;
  }
};

const router = useRouter()

const progressLots = ref<any[]>([]); // Массив для хранения лотов со статусом "progress"
const postavkaProgressLots = ref<any[]>([]);

const postavkaDialog = ref(false);



// Функция для фильтрации лотов со статусом "progress"
const filterProgressLots = () => {
  // Фильтруем лоты и сохраняем только те, у которых статус "progress"
  progressLots.value = invoice2.value.filter(lot => lot.status === 'progress');
  
  // Логируем отфильтрованные лоты, чтобы проверить результат
  console.log('Лоты со статусом "progress":', progressLots.value);
};

const filterProgressLotsPostavki = () => {
  // Фильтруем лоты и сохраняем только те, у которых статус "progress"
  postavkaProgressLots.value = postavki.value.filter(lot => lot.delivery_status === 'progress');
  
  // Логируем отфильтрованные лоты, чтобы проверить результат
  console.log('Лоты со статусом "progress":', postavkaProgressLots.value);
};



// Следим за изменениями в invoice2 и фильтруем лоты, когда данные загружены
watch(invoice2, (newData) => {
  if (newData.length > 0) {
    filterProgressLots(); // Фильтруем лоты только после того, как данные загрузятся
  }
});

watch(postavki, (newData) => {
  if (newData.length > 0) {
    filterProgressLotsPostavki(); // Фильтруем лоты только после того, как данные загрузятся
  }
});

// Функция для принятия поставки
const acceptDelivery = async (lot: any) => {
  console.log('Lot ID:', lot.lot_number); // Логируем перед отправкой

  // Если lot._id пустой, выходим из функции
  const lotId = lot.lot_number
  if (!lotId) {
    console.error('Lot ID is undefined');
    return;
  }

  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " "); // Форматируем текущую дату

  try {
    // Отправляем PUT запрос с использованием lotId
    const response = await axios.put(`${SERVER_URL}/api/lots/${lotId}`, {
      arrive: currentDate,
      status: 'sklad',
      roasting: false,
      lots_inside:lot.lots_inside,
      deliverId:lot.deliverId
    }, {
      withCredentials: true
    });

    // Фильтруем массив postavkaProgressLots, убирая лот с таким же lotId
    postavkaProgressLots.value = postavkaProgressLots.value.filter(l => l._id.toString() !== lotId);

    fetchWorkers();

    console.log('Лот обновлен:', response.data);

  } catch (error) {
    console.error('Ошибка при принятии поставки:', error);
  }
};




// interface Lot {
//   lotId: string;
//   name: string;
//   price: number;
//   volume: number;
// }

const props = defineProps({
  paginatedData: Array,
});

interface Lot {
  lotId: string;
  name: string;
  price?: number;
  volume?: number;
  // Дополнительные параметры товара
  [key: string]: any;
}

const addedLots = ref<Lot[]>([]);

const addLot = (lot: Lot) => {
  addedLots.value.push({ 
    ...lot,  // Подтягиваем все данные о лоте
    price: lot.price || 0, // Если цена не указана, ставим 0
    volume: lot.volume || 0, // Если объем не указан, ставим 0
  });
  console.log("Текущие добавленные лоты:", addedLots.value);
};


const submitDelivery = async () => {
  const deliveryData = {
    big_direct_kava: [
      {
        lots_inside: addedLots.value.map(lot => ({
          ...lot,  // Передаем все данные о товаре
          price: lot.price,
          volume: lot.volume,
        })),
        lot_number: generateLotNumber(),
        lot_name: generateLotName(),
        date: new Date().toISOString().split('T')[0], // текущая дата
        delivery_statius:"Progress",
      }
    ]
  };

  try {
    const { data } = await axios.post(`${SERVER_URL}/api/submit-delivery`, deliveryData, {
      withCredentials: true
    });
    fetchWorkers();
    fetchPostavki();
    filterProgressLots();
    filterProgressLotsPostavki();

    alert('Поставка успешно отправлена');
  } catch (error) {
    console.error(error);
    alert('Ошибка при отправке поставки');
  }
};

const generateLotNumber = () => {
  return Math.floor(Math.random() * 1000000); // случайный номер лота
};

const generateLotName = () => {
  return `Лот ${Math.floor(Math.random() * 1000)}`; // случайное имя лота
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
  fetchPostavki();
  filterProgressLots();
  filterProgressLotsPostavki();

})


</script>


<template>

    <div class="main_block">



  <div class="head_block">
    <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline"  class="btn_top">Створити поставку</Button>
    </DialogTrigger>
    
    <DialogContent class="sm:max-w-[855px] dia">
      <DialogHeader>
        <DialogTitle>Оформлення поставки</DialogTitle>
        <DialogDescription>
          Перед підтвердженням перевірте правильність заповнення усіх полей
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid gap-4 py-8 dia">
        <div class="lot-list">
          <div v-for="lot in paginatedData" :key="lot.lotId" class="lot-item">
            <span class="lot-name" style="font-weight: bold; margin: 2vw; text-align: left;">{{ lot.name }}</span>
            <Button variant="outline" @click="addLot(lot)">Додати</Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-bold">Наявна поставка</h3>
        <div v-if="addedLots.length" class="added-lots">
          <div v-for="lot in addedLots" :key="lot.lotId" class="lot-item">
            <span class="lot-name" style="font-weight: bold; margin-right: 2vw;">{{ lot.name }}:</span>
            <span>Вартість:</span>
            <input type="number" v-model.number="lot.price" placeholder="Цена" class="input-field" />
            <span>Об'єм:</span>
            <input type="number" v-model.number="lot.volume" placeholder="Объем" class="input-field" />
          </div>
        </div>
        <div v-else>
          <p>Нет добавленных товаров.</p>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="submitDelivery">Отправить</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  



  <Dialog>
    <DialogTrigger as-child>
      <!-- <Button variant="outline">
        Повторити поставку
      </Button> -->
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right">
            Name
          </Label>
          <Input id="name" default-value="Pedro Duarte" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="username" class="text-right">
            Username
          </Label>
          <Input id="username" default-value="@peduarte" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">
          Save changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" class="btn_top">
        Отримати поставку
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[725px]">
      <DialogHeader>
        <DialogTitle>Отримання поставки</DialogTitle>
      </DialogHeader>
      <div class="grid gap-6 py-4">
        <ScrollArea class="h-72 w-508 rounded-md border">
          <div class="p-14">
            <h4 class="mb-4 text-sm font-large leading-none"> 
              Оберіть лот для отримання
            </h4>

            <!-- Список лотов с кнопками для принятия поставки -->
            <div v-for="lot in postavkaProgressLots" :key="lot._id" class="arrive_lots">
  <div class="text-sm">
    <div>{{ lot.lot_name }}</div>
    <div>ID лота: {{ lot._id }}</div>
    <div>lotId: {{ lot.lotId }}</div> <!-- Добавь для отладки -->
  </div>

  <Button @click="acceptDelivery(lot)" variant="outline">
  Принять поставку
</Button>

</div>

          </div>
        </ScrollArea>
      </div> 
      <div></div>
    </DialogContent>
  </Dialog>
  
</div>

  <div class="table_block">
    <Table> 
      <TableCaption class="capt">
        <!-- Пагинация -->
        <div class="pagination" style="display: flex;">

          <Button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="pagitation_button">
            <ChevronLeft />
          </Button>

          <span class="block">
         {{ currentPage }} из {{ totalPagesPostavki }}
          </span>


          <Button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPagesPostavki" class="pagitation_button">
            <ChevronRight />
          </Button>

        </div>
      </TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px] tbl">Номер лоту</TableHead>
          <TableHead class="tbl">ID лоту</TableHead>
          <TableHead class="tbl">Назва лоту</TableHead>
          <TableHead class="tbl">Дата замовлення</TableHead>
          <TableHead class="tbl">Дата доставки</TableHead>
          <TableHead class="tbl">Статус</TableHead>
          <TableHead class="tbl">Інформація</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="invoice in paginatedDataPostavki"
          :key="invoice.lotId"
          class="cell"
        >
          <TableCell class="font-medium tbl">{{ invoice.lot_number }}</TableCell>
          <TableCell class="tbl">{{ invoice._id }}</TableCell>
          <TableCell class="tbl">{{ invoice.lot_name }}</TableCell>
          <TableCell class="tbl" >{{ invoice.date }}</TableCell>
          <TableCell class="tbl">{{ invoice.deliver_time }}</TableCell>
          <TableCell>
            <div :style="{ backgroundColor: invoice.delivery_status === 'sklad' ? 'rgba(0, 255, 156, 0.700)' : (invoice.delivery_status === 'progress' ? ' rgba(255, 230, 0, 0.700)' : '') }" class="truck" >
              <!-- <NuxtImg src="/truck.png" alt="" width="15px" /> -->
              <Truck style="width: 15px; color: white;" />
            </div>
          </TableCell>
          <TableCell class="text-right">
            <Dialog>
              <DialogTrigger as-child>
                <Button variant="outline" @click="openPostavkaInfo(invoice)" class="btn_info">
                  Інформація
                </Button>
              </DialogTrigger>
              <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Інформація про лот</DialogTitle>
                  <DialogDescription>
                    Тут ви можете побачити всі дані про лот.
                  </DialogDescription>
                </DialogHeader>

                <div class="grid gap-4 py-4">
                  <!-- <div>
                    <span><strong>Номер лоту:</strong> {{ selectedPostavka?.lots_inside }}</span>
                  </div> -->
                  <div v-for="lot in selectedPostavka?.lots_inside" :key="lot.lotId" class="lot-card">
  <p><strong>Название:</strong> {{ lot.name }}</p>
  <p><strong>Вес:</strong> {{ lot.global_weight }} кг</p>
  <p><strong>Объем:</strong> {{ lot.volume }}</p>
</div>

    <!-- <pre>{{ JSON.stringify(selectedPostavka, null, 2) }}</pre> -->
              

                </div>

                <DialogFooter>
                  <Button type="button" variant="outline">
                    Закрити
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

  .btn_top{
    border: none;
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    /* border-radius: 25px !important; */
    cursor: pointer;
    color: white;
    border-radius:10px ;
    margin-right: 3vw;
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
    justify-content: flex-start;
    max-width: 80vw;

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

  .table_block{
    min-width: 80vw;
    max-width: 80vw;
    max-height: 70vh;
    /* margin-top: 15vh; */
    /* margin-left: 5vh; */
    /* margin-top: 15vh;
    margin-left: 10vw; */

    padding: 2vh 5vh 5vh 5vh ;
    transform: translateX(0vw);
    transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;
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

  .tbl{
    min-width: 100px;
    text-align: center;
    color: white;
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

  .input-field{
    border: 1.5px solid black;
    border-radius: 20px;
    padding: .5vw;
    margin: 1vw;
  }
</style>
  