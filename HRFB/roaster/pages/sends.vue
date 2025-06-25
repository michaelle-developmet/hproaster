<!-- ITS WORKFNFKJEKFNJKANKJNSKJNJKGNSA -->

<script setup lang="ts">
// ауцьауцацу
// UI компоненты
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

import { Separator, ScrollArea, Button } from '@/components/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Логика
import { useRouter } from 'vue-router';
import axios from 'axios';

// Иконки
import { EyeOff, Eye, Pencil } from 'lucide-vue-next';
import { SERVER_URL } from '../utils/con.js';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"




// Определение интерфейсов для User и Role
interface User {
    name: string;
    post: string;

}

interface LotPrice {
  [label: string]: number; // например: "партнерська ціна": 200
}
interface LotsInsideItem {
  packId: string;
  stickerId: string;
  packCount: number;
  stickerCount: number;
  weight: number;
  createdAt: string;
  author: string;
  packsKavaId: number;
  actual_photo?: string;
  volume?: number;
  actual_sticker_photo?: string;
  lotId?: number;
  lotName?: string;
  lots_price: LotPrice;
}


interface CompletePack {
  lotId: number;
  lotName: string;
  lots_inside: LotsInsideItem[];
  globalPackWeight?: number;
  _id?: string;
}

interface Role {
    role_name: string;
    role_id: string;
    decorative: boolean;
    author: string;
    access: Record<string, any>;
}

interface Artwork {
  id: string
  artist: string
  src: string
}

interface UserThemeSettings {
  background_color: string;
  main_text_color: string;
  secondary_text_color: string;
  head_text_color: string;
  senders: boolean;
}

const works: Artwork[] = [
  {
    id: '1',
    artist: 'Ornella Binni',
    src: '../public/back.jpg',
  },
  {
    id: '2',
    artist: 'Tom Byrom',
    src: 'https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '3',
    artist: 'Vladimir Malyavko',
    src: 'https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80',
  },
]

// Реактивные состояния
const router = useRouter()

// Массив пользователей
let user = ref<User[]>([])
    
let complete_packs = ref<CompletePack[]>([])

// Массив ролей
const allRoles = ref<Role[]>([]);

//Массив стилей

const allStyles = ref<UserThemeSettings>({
  background_color: 'basic',
  main_text_color: 'basic',
  secondary_text_color: 'basic',
  head_text_color: 'basic',
  senders: true,
});

// Состояние для выбранной категории
const selectedCategory = ref<string>('roles')

const cart = ref([]);

function addToCart(pack) {
  cart.value.push({
    ...pack,
    selectedInside: null,
    selectedPriceKey: null,
    selectedPriceValue: null,
    quantity: 1,
  });
}

// Состояние для нового имени роли и параметра декоративности
const newRoleName = ref('')
const isDecorative = ref(false)

// Состояние для хранения выбранного role_id
const selectedRoleId = ref<string | null>(null)

// Состояние для хранения доступов выбранной роли
const roleAccess = ref<Record<string, any> | null>(null)

const selectedUser = ref(null)
const selectedRole = ref(null)

// Функция для выбора категории
const selectCategory = (category: string) => {
    selectedCategory.value = category
}




const submitNewRole = async () => {
  try {
    await axios.post(`${SERVER_URL}/api/add_role`, {
      role_name: newRoleName.value,
      decorative: isDecorative.value,
    }, { withCredentials: true });

    newRoleName.value = '';
    isDecorative.value = false;

    // если есть — обновить список ролей
    fetchWorkers();
  } catch (err) {
    console.error('Помилка при створенні ролі:', err);
    alert('Не вдалося створити роль');
  }
};


const fetchWorkers = async () => {
    try {
        const response = await axios.get(`${SERVER_URL}/api/team`, {
            withCredentials: true, // Отправляем куки с запросом
        });
        user = response.data;
        console.log("invocice",user)
    } catch (error) {
        console.error('Ошибка при загрузке работников:', error);
    }
};

const fetchPacks = async () => {
  try {
    const response = await axios.get(`${SERVER_URL}/api/get_complete_packs`, {
      withCredentials: true,
    });
    complete_packs.value = response.data.complete_packs;
    console.log("resp", complete_packs.value);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
}

const buyerType = ref('')
const buyerData = reactive({
  name: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  companyName: '',
  paymentTerms: ''
})


const fetchAllRolses = async ()=>{

    try {
        const res = await axios.get(`${SERVER_URL}/api/get_all_roles`,{
            withCredentials: true, // Отправляем куки с запросом
        });
        console.log("response",res)
        allRoles.value = res.data.roles

        console.log("Roles",allRoles.value)
        
    } catch (error) {
        
    }
}

const fetchAllStyles= async ()=>{

try {
    const res = await axios.get(`${SERVER_URL}/api/get_all_styles`,{
        withCredentials: true, // Отправляем куки с запросом
    });
    console.log("response",res)
    // allRoles.value = res.data.roles

    allStyles.value = res.data;
    console.log("allStyles",allStyles.value)
    
} catch (error) {
    
}
}

const postNewPrice= async (dataToSend)=>{

try {
    const res = await axios.post(`${SERVER_URL}/api/submit_price`,dataToSend, {
        withCredentials: true, // Отправляем куки с запросом
    });
    console.log("response",res)
    // allRoles.value = res.data.roles

    
} catch (error) {
    console.log("response",error)
}
}



// Слежение за изменением selectedRoleId и извлечение доступов
watch(selectedRoleId, (newRoleId) => {
  if (newRoleId) {
    const selectedRole = allRoles.value.find(role => role.role_id === newRoleId)
    if (selectedRole) {
      roleAccess.value = selectedRole.access
    } else {
      roleAccess.value = null
    }
  }
})


// Функция для обработки клика по кнопке
const selectRole = (roleId: string) => {
  selectedRoleId.value = roleId
  console.log("RolesId",roleId)
  
  console.log("Roles",allRoles)
}

const updateAccess = (category: string, accessType: string, newAccess: 'use' | 'show' | 'hide') => {
  if (!roleAccess.value) return;

  roleAccess.value = {
    ...roleAccess.value,
    [category]: {
      ...roleAccess.value[category],
      [accessType]: newAccess,
    },
  };

  sendUpdatedAccess();
};

// Функция для отправки обновленных данных на сервер
const sendUpdatedAccess = async () => {
  if (!selectedRoleId.value || !roleAccess.value) return;

  const updatedAccess = {
    role_id: selectedRoleId.value,
    access: roleAccess.value,
  };

  try {
    await axios.put(`${SERVER_URL}/api/update_role_access`, updatedAccess, {
      withCredentials: true,
    });
    console.log('Access updated');
    fetchAllRolses();
    sendUpdatedAccess();
  } catch (error) {
    console.error('Ошибка при обновлении доступа:', error);
  }
};

const selectedLot = ref(null)
// Храним редактируемые состояния по индексам
const editStates = reactive({})


function showLotInfo(lot) {
    selectedLot.value = lot
  console.log('Інформація про лот:', lot);
}

// Переводим элемент в режим редактирования
function editPrice(index, priceKey) {
  if (!editStates[index]) editStates[index] = {}
  if (!editStates[index].editItems) editStates[index].editItems = {}

  const value = selectedLot.value.lots_inside[index].lots_price[0][priceKey]

  editStates[index].editItems[priceKey] = {
    originalKey: priceKey,
    originalValue: value,
    newKey: priceKey,
    newValue: value,
  }

  editStates[index][priceKey] = true
}


function savePrice(item, index, oldKey) {
  const editItem = editStates[index]?.editItems?.[oldKey]
  if (!editItem) return

  const { newKey, newValue, originalKey, originalValue } = editItem

  // Удаляем старый ключ, если название было изменено
  if (newKey !== originalKey) {
    delete item.lots_price[0][originalKey]
  }

  // Добавляем новый ключ со значением
  item.lots_price[0][newKey] = Number(newValue)

  // Очищаем состояние
  delete editStates[index][oldKey]
  delete editStates[index].editItems[oldKey]

  console.log('Було:', originalKey, originalValue)
  console.log('Стало:', newKey, newValue)
}


// Добавление новой цены
function addPriceField(index) {
  if (!editStates[index]) editStates[index] = {}
  if (!editStates[index].newPrices) editStates[index].newPrices = []
  if (editStates[index].newPrices.length < 3) {
    editStates[index].newPrices.push({ key: '', value: '' })
  }
  
}

async function saveNewPrice(item, index, newPrice, newValue, idx) {
  if (!item.lots_price.length) item.lots_price.push({})
  item.lots_price[0][newPrice] = Number(newValue)
  // удалим из newPrices
  editStates[index].newPrices.splice(idx, 1);

  let dataToSend = {
    newPrice,
    newValue,
    item
  }

  await postNewPrice(dataToSend);


  console.log( newPrice , newValue,item)
  console.log(dataToSend)
}


const submitOrder = async () => {
  if (!buyerType.value) {
    alert('Оберіть тип покупця');
    return;
  }

  // Валідація
  if (buyerType.value === 'client') {
    const { name, phone, email, city, address } = buyerData;
    if (!name || !phone || !email || !city || !address) {
      alert('Заповніть всі поля для клієнта');
      return;
    }
  }

  if (buyerType.value === 'partner') {
    const { companyName, city, address, paymentTerms, phone } = buyerData;
    if (!companyName || !city || !address || !paymentTerms || !phone) {
      alert('Заповніть всі поля для партнера');
      return;
    }
  }

  const order_items = cart.value.map(item => {
    return {
      objectName: item.lotName,
      count: item.quantity,
      volume: item.selectedInside.volume, // фасовка
      price: {
        [item.selectedPriceKey]: item.selectedInside.lots_price[0][item.selectedPriceKey]
      }
    };
  });

  const total_price = order_items.reduce((sum, obj) => {
    const key = Object.keys(obj.price)[0];
    return sum + obj.price[key] * obj.count;
  }, 0);

  const payload = {
    client_type: buyerType.value,
    total_price,
    order_items
  };

  // Додаткові дані покупця
  if (buyerType.value === 'client') {
    payload.client_info = {
      name: buyerData.name,
      phone: buyerData.phone,
      email: buyerData.email,
      city: buyerData.city,
      address: buyerData.address
    };
  }

  if (buyerType.value === 'partner') {
    payload.partner_info = {
      companyName: buyerData.companyName,
      city: buyerData.city,
      address: buyerData.address,
      paymentTerms: buyerData.paymentTerms,
      phone: buyerData.phone // ← Додали
    };
  }

  try {
    const res = await axios.post(`${SERVER_URL}/api/create_order`, payload, {
      withCredentials: true
    });
    console.log('Заказ оформлен:', res.data);
    alert('Замовлення успішно оформлено!');
    cart.value.length = 0;
  } catch (err) {
    console.error('Помилка при оформленні:', err);
    alert('Сталася помилка при створенні замовлення');
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

  fetchAllRolses();
  fetchWorkers();
  fetchAllStyles();
  fetchPacks();
})

</script>

<template>
    <div class="main_block">


        <div class="state">
            <!-- <button @click="showCart = true">🛒 Cart ({{ cart.length }})</button> -->

        </div>
        <Dialog  style="border: 1px solid red;">
    <DialogTrigger as-child>
      <Button variant="outline">🛒 Cart ({{ cart.length }})</Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-[950px] max-h-[100vh] overflow-y-auto"  >
      <DialogHeader>
        <DialogTitle>Корзина</DialogTitle>
      </DialogHeader>

      <div v-if="cart.length">
        <div
          v-for="(item, index) in cart"
          :key="index"
          class="border-b pb-4 mb-4 frame_time"
        >
          <h3 class="font-semibold text-lg mb-1">{{ item.lotName }}</h3>

          <!-- Выбор фасовки -->
          <select v-model="item.selectedInside" class="mb-2 w-full">
            <option disabled value="">Оберіть фасовку</option>
            <option v-for="inside in item.lots_inside" :value="inside">
              {{ inside.volume }} мл
            </option>
          </select>

          <!-- Показ доступного количества -->
          <p v-if="item.selectedInside">Доступно: {{ item.selectedInside.packCount }}</p>

          <!-- Выбор типа ціни -->
          <select
            v-if="item.selectedInside && item.selectedInside.lots_price.length"
            v-model="item.selectedPriceKey"
            class="mb-2 w-full"
          >
            <option disabled value="">Оберіть тип ціни</option>
            <option
              v-for="(value, key) in item.selectedInside.lots_price[0]"
              :key="key"
              :value="key"
            >
              {{ key }} — {{ value }} грн
            </option>
          </select>
          <!-- Кількість -->
          <div class="flex items-center gap-2 mt-2">
            <label>Кількість:</label>
            <input
              type="number"
              v-model.number="item.quantity"
              :min="1"
              :max="item.selectedInside?.packCount || 1"
              class="border px-2 py-1 w-20"
            />
          </div>

          <!-- Підсумок -->
          <p class="mt-2 font-medium">
            Сума: {{
              item.selectedInside && item.selectedPriceKey
                ? item.quantity * item.selectedInside.lots_price[0][item.selectedPriceKey]
                : 0
            }} грн
          </p>
        </div>
      </div>
      <div v-else>
        <p>Корзина порожня.</p>
      </div>

      <!-- Загальний підсумок -->
<div class="text-right text-lg font-semibold mb-4">
  Загальна сума: {{
    cart.reduce((total, item) => {
      if (
        item.selectedInside &&
        item.selectedPriceKey &&
        item.quantity &&
        item.selectedInside.lots_price?.[0]?.[item.selectedPriceKey]
      ) {
        return (
          total +
          item.quantity * item.selectedInside.lots_price[0][item.selectedPriceKey]
        );
      }
      return total;
    }, 0)
  }} грн
</div>

<!-- Загальна сума -->
<p class="text-right font-bold text-lg mt-4">
  Загальна сума: {{
    cart.reduce((sum, item) =>
      item.selectedInside && item.selectedPriceKey
        ? sum + item.quantity * item.selectedInside.lots_price[0][item.selectedPriceKey]
        : sum
    , 0)
  }} грн
</p>

<!-- Тип покупця -->
<div class="mt-6">
  <label class="block mb-2 font-medium">Тип покупця:</label>
  <select v-model="buyerType" class="w-full border p-2 rounded">
    <option disabled value="">Оберіть тип</option>
    <option value="client">Клієнт</option>
    <option value="partner">Партнер</option>
    <option value="establishment">Заведение</option>
  </select>
</div>

<!-- Форма по типу -->
<div class="mt-4 space-y-3">
  <!-- Клієнт -->
  <template v-if="buyerType === 'client'">
    <input v-model="buyerData.name" placeholder="ПІБ" class="input_field" />
    <input v-model="buyerData.phone" placeholder="Номер телефону" class="input_field" />
    <input v-model="buyerData.email" placeholder="Пошта" class="input_field" />
    <input v-model="buyerData.city" placeholder="Місто" class="input_field" />
    <input v-model="buyerData.address" placeholder="Адреса доставки" class="input_field" />
  </template>

  <!-- Партнер -->
  <template v-else-if="buyerType === 'partner'">
  <input v-model="buyerData.companyName" placeholder="Назва компанії" class="input_field" />
  <input v-model="buyerData.phone" placeholder="Номер телефону" class="input_field" />
  <input v-model="buyerData.city" placeholder="Місто" class="input_field" />
  <input v-model="buyerData.address" placeholder="Адреса доставки" class="input_field" />
  <input v-model="buyerData.paymentTerms" placeholder="Термін оплати" class="input_field" />
</template>

  <!-- Заведение — ничего -->
</div>


      <DialogFooter>
        <Button variant="outline" @click="submitOrder">Оформити</Button>

      </DialogFooter>
    </DialogContent>
  </Dialog>

        <ScrollArea class="border_div" v-if="complete_packs.length">

            <div class="packs_collector">
                <div
    v-for="(pack, index) in complete_packs"
    :key="index"
    class="pack_block"
    style="border: 1px solid #ccc; padding: 12px; margin-bottom: 12px; border-radius: 8px;"
  >


    <!-- Фото из первого lots_inside -->
    <!-- <div v-if="pack.lots_inside.length && pack.lots_inside[0].actual_sticker_photo"> -->

      <img :src="`http://localhost:5011/api/${pack.lots_inside[0].actual_sticker_photo}`" alt="pack_photo" class="sticker_photo" >
    <!-- </div> -->

    <h3 style="font-size: 20px; margin-bottom: 8px;" class="lot_name">{{ pack.lotName }}</h3>
    <!-- Загальна кількість -->
    <p class="lot_name"><strong>Всього на складі:</strong>
      {{
        pack.lots_inside.reduce((total, inside) => total + Number(inside.packCount || 0), 0)
      }}
    </p>

    <button @click="addToCart(pack)">Додати</button>

    <!-- Додаткова інформація -->
    <!-- <div class="lots_inside_block" style="margin-top: 10px;">
      <h4>Варіанти фасування:</h4>
      <div
        v-for="(inside, idx) in pack.lots_inside"
        :key="idx"
        class="inside_item"
        style="margin-left: 20px;"
      >
        <p>Вага: {{ inside.packCount }} г</p>
        <p>Обʼєм: {{ inside.volume }}</p>
        <p>packsKavaId: {{ inside.packsKavaId }}</p>
      </div>
    </div> -->
                </div>
            </div>



        </ScrollArea>


    </div>
</template>


<style scoped>


.options_block{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
}
.btn_set{
    width: 200px;
    background-color: blue;
    color: white;
}
.hover_card_text{
    color: white;
    font-size: 1vw;
}

.lot_name{
color: white;
}

.sticker_photo{
    width: 55%;
    height: auto;
    margin-left: 20px;
}

.head_of_scroll{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 15px;
}

.head_of_scroll > span{
display: flex;
color: white;
justify-content: center;
padding: 10px 0;
}

.lot_number{
    min-width: 100px;
}

.btn_block{

    width: 250px;
    /* border: 1px solid green; */
}


.lot_item{
    /* border: 1px solid green; */
    display: flex;
    flex-flow: column;
    height: 5vh;
    width: 200px;
}


.text_base{
    display: flex;
    flex-flow: column;
    align-items: center;
}

.inline_block{
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-flow: column;
}


.lot_global_items{
    /* border: 1px solid blue; */
    display: flex;
    min-width: 600px;
}
.head_text_of_category{
    font-size: 2vw;
    color: white;

}
.line_block{
    display: flex;
    font-size: 1.3vw;
    justify-content: space-between;
    align-items: center;
    margin: 1vw;

}
.subtext{
    margin-left: 3vw;
}
.button_row{
    display: flex;
    /* border: 1px solid yellow; */
    margin-right: 10vw;
}

.btn_customize{
    width: 3vw;
    height: 3vw;
}
.main_block{
    /* background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%); */

    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column;
    /* https://grabient.com/HQNgHATANMAsYFYYQrKBaADMAzARjA2wgE4QZMJC5YSYEB2TCsZiYMhqPYTBN3BBxA/ */

/* https://grabient.com/HQNgrAnANKk+1hgIwCYZgAxg5g7DACzIHCFgAcMAzHjsqMslKsKvlA5qmEA/ */

background: linear-gradient(90deg, rgba(68, 202, 255, 1.000) 0.000%, rgba(113, 141, 255, 1.000) 16.667%, rgba(168, 86, 244, 1.000) 33.333%, rgba(223, 50, 198, 1.000) 50.000%, rgba(255, 40, 148, 1.000) 66.667%, rgba(255, 59, 100, 1.000) 83.333%, rgba(255, 102, 63, 1.000) 100.000%)
}


button.active {
  color: white;
  opacity: 1 !important;
}

.button_row > button{
    width: 3vw;
    height: 3vw;
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(0px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 15px !important;
    margin: 0 1vw;
    opacity: .5;
    display: flex;
    align-items: center;
    justify-content: center;
}

.badge{
        background: rgba(12, 12, 12, 0.085);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        padding: 5px 15px;
    }


.block_of_green{
    margin: 2vw 1vw;
}

    .personal{
        width: 80vw;
        height: 75vh;
        background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        padding: 1vw;
        margin: 1vw;
        overflow: hidden;
    }

    .header{
        display: flex;
        align-items: center;
        color: white;
        margin: .5vw 0;
    }

    .header > .counter{
        width: 1vw;
        height: 1vw;
        background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        padding: 1.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .header > .head_text{
        font-size: 1vw;
        margin-left: 1vw;
    }

    .content{
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: .1vw;
        overflow: hidden;
        position: relative;
    }




    .button_line{
    margin-top: 0vh;
    width: 80vw;
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


    .worker_plate{
        margin: 1vw;
        display: flex;
        background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        padding: 15px;
        align-items: center;
        color: white;
    }

    .worker_plate > .name{
        margin: 0 1vw;
    }


    .state{
        z-index: 200;
        position: absolute;
        left: 0;
        top: 0;
    }




    .scroll_roles{
        width: 14vw;
        height: 50vh;
        /* background-color: red; */
        background: rgba(12, 12, 12, 0.085);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        /* border: 1px solid red; */
    }


    .badje_customizing_button{
        width: 10vw;
        background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        color: white;
        margin: 1vw 2vw .5vw 2vw;
        padding: 10px;
    }

    .add_role{
        color: #3F5EFB;
    }


    .frame_time{
        display: flex;
        align-items: center;
        border: 1px solid red;
    }
    .customize_roles{
        width: 50vw;
        height: 50vh;
        background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        color: white;
        margin-right: 5vw;
    }

    .act{
        background-color: #3F5EFB;
    }


    .visual {
    transform: translateX(70vw);
    /* margin-top: 35vh; */
    /* opacity: 0; */
    animation: slideInFade .5s ease-out forwards;
}

@keyframes slideInFade {
    0% {
        transform: translateX(70vw);
        /* opacity: 0; */
    }
    100% {
        transform: translateX(0vw);
        opacity: 1;
    }
}

.themese_choise{
    width: 75vw;
    /* border: 1px solid red; */
}
.themes_list{
    display: flex;
    /* border: 1px solid red; */
    width: 100vw;
    overflow: scroll;
}
.theme {
  width: 18vw;
  height: 16vw;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  transition: border-color 0.3s;
  cursor: pointer;
  margin-right: 2vw;
}

.theme-image {
  width: 80%;
  height: 70%;
  object-fit: cover;
  margin: 1vw;
  border-radius: 15px ;
}

.theme-title {
  margin-top: 1vw;
  font-size: 1vw;
  color: white;
  text-align: center;
}

.theme-indicator {
  position: absolute;
  bottom: 0.8vw;
  right: 0.8vw;
  width: 1.2vw;
  height: 1.2vw;
  border-radius: 50%;
  border: 2px solid white;
  background-color: transparent;
  transition: background-color 0.3s;
}

.theme.selected {
  border-color: #3F5EFB;
}

.theme.selected .theme-indicator {
  background-color: #3F5EFB;
}


.border_div{
    width: 80vw;
    height: 70vh;
    margin-top: 2vh;
    transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;

}

.lot_card{

    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    border-bottom: 1px solid white;
    margin: 15px 15px;
}


.pack_block{
    width: 400px;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
}

.packs_collector{
    display: flex;
}


</style>