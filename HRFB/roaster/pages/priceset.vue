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

        <ScrollArea class="border_div" v-if="complete_packs.length">
            <div class="head_of_scroll">
                <span class="lot_number">Номер</span>
                <span class="lot_name">Назва лоту</span>
                <span class="lot_global_items">Різговид грамовки</span>
                <span class="btn_block">Змінити вагу</span>
            </div>
    <div
      v-for="(lot, index) in complete_packs"
      :key="lot.lotId"
      class="lot_card"
    >
      <div class="lot_number ">
        {{ index + 1 }}  
      </div>

      <div class="lot_name">
        {{ lot.lotName }}
      </div>


      <div class="lot_global_items">
        <div
        v-for="(item, idx) in lot.lots_inside"
        :key="idx"
        class="lot_item "
      >


    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" class="hover_card_text"> {{ item.volume }} грам</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Вартість товару для <span style="color:  #FFE31A;">{{ item.volume }}</span> грам </h4>
            <p className="text-sm" style="display: flex;">
                <div
        v-for="(priceObj, pIdx) in item.lots_price"
        :key="pIdx"
        class="inline_block"
    >

        <template v-for="(price, name) in priceObj">
            <div class="options_block"> 
                <span  class="badge ">{{ name }}</span>
                <span class="option"> {{ price }} грн</span>
            </div>


        </template>




                </div>
                <img :src="`http://localhost:5011/api/${item.actual_sticker_photo}`" alt="pack_photo" class="sticker_photo" >
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>



      </div>
      </div>


        <div class="btn_block">
            <Dialog>
  <DialogTrigger as-child>
    <Button
      @click="showLotInfo(lot)"
      variant="outline"
      class="btn_info"
      style="color: black; width: 220px;"
    >
      Дивитись
    </Button>
  </DialogTrigger>

  <DialogContent class="sm:max-w-[525px]">
    <DialogHeader>
      <DialogTitle>Інформація</DialogTitle>
      <DialogDescription>
        Тут ви можете побачити всі дані про товар.
      </DialogDescription>
    </DialogHeader>

    <div class="all_prices_block" v-if="selectedLot">
      <div
        class="price_block"
        v-for="(item, idx) in selectedLot.lots_inside"
        :key="idx"
      >
        <h3>Вага: {{ item.volume }} гр</h3>

        <!-- ✅ Если есть хотя бы одна цена -->
        <template
          v-if="item.lots_price.length && Object.keys(item.lots_price[0]).length"
        >
          <div
            v-for="(value, priceKey) in item.lots_price[0]"
            :key="priceKey"
            style="display: flex; align-items: center; margin-bottom: 8px;"
          >
            <template v-if="editStates[idx]?.[priceKey]">
                <input
    v-model="editStates[idx].editItems[priceKey].newKey"
    style="margin-right: 5px;"
  />
              <input
    v-model="editStates[idx].editItems[priceKey].newValue"
    type="number"
    style="margin-right: 5px;"
  />
              <button
                @click="savePrice(item, idx, priceKey, item.lots_price[0][priceKey])"
              >
                Зберегти
              </button>
            </template>

            <template v-else>
              <span style="width: 100px;">{{ priceKey }}</span>
              <span style="width: 80px; margin-right: 8px;">{{ value }}</span>
              <button @click="editPrice(idx, priceKey)">Змінити</button>
            </template>
          </div>
        </template>

        <!-- ❌ Если цен нет вообще -->
        <template v-else>
          <p>Цін ще нема</p>
          <!-- <button @click="addPriceField(idx)">Додати ціну</button> -->
        </template>

        <!-- Новые цены -->
        <div v-if="editStates[idx]?.newPrices?.length">
          <div
            v-for="(priceObj, pIdx) in editStates[idx].newPrices"
            :key="pIdx"
            style="display: flex; gap: 8px; margin-top: 6px;"
          >
            <input
              v-model="priceObj.key"
              placeholder="Назва ціни (наприклад: Акційна)"
              style="width: 150px;"
            />
            <input
              v-model="priceObj.value"
              type="number"
              placeholder="Значення"
              style="width: 100px;"
            />
            <button
              @click="saveNewPrice(item, idx, priceObj.key, priceObj.value, pIdx)"
            >
              Зберегти
            </button>
          </div>
        </div>

        <!-- Кнопка "Додати ціну", если ещё можно -->
        <div
          v-if="
            item.lots_price.length === 0 ||
            Object.keys(item.lots_price[0]).length < 3
          "
        >
          <button @click="addPriceField(idx)" style="margin-top: 8px;">
            Додати ціну
          </button>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button type="button" variant="outline">
        Закрити
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

        
            </div>

    </div>
  </ScrollArea>

<!-- номер лоту    назва лоту  зображення  грамовка / ціни  грамовка / ціни грамовка / ціни  змінити -->
<!--  лот и внтури лота как   -->
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
    /* border: 1px solid red; */
    width: 150px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.sticker_photo{
    width: 35%;
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


</style>