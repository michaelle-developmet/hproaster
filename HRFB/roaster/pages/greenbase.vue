<script setup lang="ts">
// <-- Импорты -->
import { ref , computed , onMounted , watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'

// <-- Импорты иконок -->
import { ChevronRight , ChevronLeft , Truck} from 'lucide-vue-next';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'



import { Plus } from 'lucide-vue-next';
import { ListFilter } from 'lucide-vue-next';
import { Settings2 } from 'lucide-vue-next';
import { Info } from 'lucide-vue-next';



import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from 'lucide-vue-next'

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
const itemsPerPage = 8;





// Текущий лот для отображения
const selectedInvoice = ref<any | null>(null);

// Открыть модал с информацией о лоте
const openInvoiceInfo = (invoice: any) => {
  selectedInvoice.value = invoice;
};
// Закрыть модал с информацией о товаре
const closeInvoiceInfo = () => {
  selectedInvoice.value = null;
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
        // boss = response.data.boss;

        console.log(invoice2)
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
    const response = await axios.put(`http://3.70.45.39:5011/api/lots/${lot.lotId}`, {
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
      }
    ]
  };

  try {
    const { data } = await axios.post('http://3.70.45.39:5011/api/submit-delivery', deliveryData, {
      withCredentials: true
    });
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
  filterProgressLots();
})


</script>


<template>

    <div class="main_block">



  <div class="head_block">


        <div class="searching_plate">
            <Input style="padding: 1vw;margin: 1vw;" type="email" placeholder="Пошук товару" />
            <Dialog v-model:open="postavkaDialog">
            <DialogTrigger as-child>
            <Button variant="outline" class="add_tovar">
                <Plus class="plus" />
            </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[855px] dia">
            <DialogHeader>
                <DialogTitle>Оформлення поставки</DialogTitle>
                <DialogDescription>
                Перед підтвердженням перевірте правильність заповнення усіх полей
                </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-8 dia">

                    <form @submit.prevent="submitForm" class="collection">
                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="name" class="text-right">Назва лоту</Label>
                            <Input id="name" v-model="formData.name" class="col-span-3" placeholder="Введіть назву лоту" />
                        </div>


                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="country" class="text-right">Країна</label>
                            <Input id="country" v-model="formData.country" class="col-span-3" placeholder="Введіть країну" />
                        </div>


                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="region" class="text-right">Регіон</label>
                            <Input id="region" v-model="formData.region" class="col-span-3" placeholder="Введіть регіон" />
                        </div>

                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="processing" class="text-right">Обробка</label>
                            <Input id="processing" v-model="formData.processing" class="col-span-3" placeholder="Введіть регіон" />
                        </div>

                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="varaiti" class="text-right">Вараїті</label>
                            <Input id="varaiti" v-model="formData.varaiti" class="col-span-3" placeholder="Введіть регіон" />
                        </div>

                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="price" class="text-right">Вартість</label>
                            <Input id="price" v-model="formData.price" class="col-span-3" placeholder="Введіть регіон" />
                        </div>

                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="comment" class="text-right">Коментар</label>
                            <Input id="comment" v-model="formData.comment" class="col-span-3" placeholder="Введіть регіон" />
                        </div>

                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="packing" class="text-right">Фасовка</label>
                            <Input id="packing" v-model="formData.packing" class="col-span-3" placeholder="Введіть регіон" />
                        </div>

                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="volume" class="text-right">Об'єм</label>
                            <Input id="volume" v-model="formData.volume" class="col-span-3" placeholder="Введіть регіон" />
                        </div>

                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="maybearrive" class="text-right">Відсоток сировини</label>
                            <Input id="maybearrive" v-model="formData.maybearrive" class="col-span-3" placeholder="Введіть регіон" />
                        </div>
                        

                        
            <!-- добавьте остальные поля формы по аналогии -->
            <!-- <button type="submit" >Отправить</button> -->
            <Button
            type="submit"
        style="margin-top: 30px">
        Отправить
        </Button>

        </form>


            </div>
            </DialogContent>
        </Dialog>
            <Button variant="outline" class="add_tovar" >  <ListFilter class="plus" /></Button>
        </div>



  </div>
  <ScrollArea class="rounded-md border area">
    <div class="p-4">
      <h4 class="mb-4 text-sm font-medium leading-none">
        Товары
      </h4>

      <!-- Список товаров -->
      <div v-for="invoice in paginatedData" :key="invoice.lotId" class="uniq_position">
        <!-- Номер заказа -->
        <span>{{ invoice.lotNumber }}</span>
        <!-- ID лота -->
        <span>{{ invoice.lotId }}</span>
        <!-- Название товара -->
        <span>{{ invoice.name }}</span>

        <!-- Кнопка 1 (пока не трогаем) -->
        <Button variant="outline" class="add_tovar">
          <Settings2 class="plus" />
        </Button>

        <!-- Кнопка 2 - открывает подробную информацию -->
        <Button variant="outline" class="add_tovar" @click="openInvoiceInfo(invoice)">
          <Info class="plus" />
        </Button>

        <!-- Диалоговое окно с подробной информацией -->
        <Dialog v-if="selectedInvoice && selectedInvoice.lotId === invoice.lotId">
          <DialogTrigger as-child>
            <Button variant="outline" @click="openInvoiceInfo(invoice)">
              Інформація
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Інформація про товар</DialogTitle>
              <DialogDescription>
                Тут ви можете побачити всі дані про товар.
              </DialogDescription>
            </DialogHeader>

            <div class="grid gap-4 py-4">
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
                <span><strong>Відсоток сировини:</strong> {{ selectedInvoice?.maybearrive }}</span>
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" @click="closeInvoiceInfo">
                Закрити
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </ScrollArea>


    </div>


</template>

<style scoped>

.uniq_position{
    border: 1.5px solid black;
    border-radius: 10px;
    padding: 0;
    margin: 1vw 0 1vw 0;
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.area{
    width: 65%;
    height: 60vh;
}

.main_block{
    width: 100%;
    height: 100%;
    border: 1px solid red;
    display: flex;
    flex-flow: column;
    align-items: center;
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
    display: flex;
  }

  .searching_plate{
    display: contents;
    align-items:center;
    justify-content: space-between;
    margin: 2vw;
    padding: 1vw;
  }

  .table_block{
    min-width: 90vw;
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


  .block{
    border: 1px solid gray;
    border-radius: 10px;
    min-width: 5vw;
    min-height: 5vh;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
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

  .add_tovar{
    border: 1px solid black;
    background-color: black;
    margin: 1vw 1vw 1vw 0;
    border-radius: 25px;
    color: white;
    font-weight: bold;
  }

  .plus{
    stroke-width: 4px;
  }
</style>
  