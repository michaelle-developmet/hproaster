<script setup lang="ts">
// <-- Импорты -->
import { ref , computed , onMounted , watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'


// import { useToast } from '@/components/ui/toast/use-toast'


// <-- Импорты shadecn -->
import { Separator, ScrollArea, Button } from '@/components/ui';
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger,} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Sticker } from 'lucide-vue-next';



const router = useRouter()


// // Массив который хранит все лоты
// const invoice2 = ref<any[]>([]);

let user:any = ref<User[]>

interface User {
    name: string;
    post: string;
}

interface Pack {
  packId: string
  name: string
  photo: string
  author: string
  createdAt: string
  count: number
  volume:number
}

interface Sticker {
  stickerId: string
  name: string
  photo: string
  author: string
  createdAt: string
  count: number
  size:string
}

// упаковки которые приходят с сервера
const packs = ref<Pack[]>([])
// стикеры которые приъодят с сервера
const stickers = ref<Sticker[]>([])

// каунтер для доп упаковок
const addedCount = ref(0)
// каунтер для доп стикеров
const addedStickerCount = ref(0)


// выбранная упаковка
const selectedPackId = ref('')
//выбранный стикер
const selectedStickerId = ref('')


const packName = ref('')
const packVolume = ref('')
const selectedFile = ref<File | null>(null)


// Диалог состояние открытия добавления упаковки
const dialogOpen = ref(false);

//Диалог состояние открытия  добавления количества упаковки
const dialogPackOpen = ref(false);


const stickerName = ref('')
const stickerSize = ref('')
const stickerdFile = ref<File | null>(null)

// Диалог состояние открытия добавления стикеров
const dialogSticker = ref(false);

//Диалог состояние открытия  добавления количества стикеров
const dialogStickerCounter = ref(false);


const openDialog = (packId: string) => {
  selectedPackId.value = packId
  addedCount.value = 0
}

const stickerDialog = (stickerId: string) => {
  selectedStickerId.value = stickerId
  addedStickerCount.value = 0
}







const fetchWorkers = async () => {
    try {
        const response = await axios.get('http://3.70.45.39:5011/api/team', {
            withCredentials: true, // Отправляем куки с запросом
        });
        user = response.data.user;

        // invoice2.value = response.data.boss.datas.green_kava_work;
        // boss = response.data.boss;
        //stickerId
    // сохраняем упаковки
    packs.value = response.data.boss.datas.additions?.packs || []
    stickers.value = response.data.boss.datas.additions?.stickers || []
        // console.log("invocice",invoice2)
    } catch (error) {
        console.error('Ошибка при загрузке работников:', error);
    }
};








// Управление состоянием видимости блоков
const isWorkVisible = ref(false);
const selectedWork = ref<string>('');



// Открытие рабочего блока
const openWork = (work: string) => {
  selectedWork.value = work;
  isWorkVisible.value = true;
};

// Закрытие рабочего блока
const closeWork = () => {
  isWorkVisible.value = false;
  selectedWork.value = '';
};


const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleStickerFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    stickerdFile.value = file
  }
}


const submitPack = async () => {
  if (!packName.value || !selectedFile.value || !packVolume.value) {
    alert('Будь ласка, заповніть усі поля')
    return
  }

  const formData = new FormData()
  formData.append('name', packName.value)
  formData.append('volume', packVolume.value)
  formData.append('photo', selectedFile.value)
  //packVolume


  try {
    const res = await axios.post('http://3.70.45.39:5011/api/add_pack', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    dialogOpen.value = false
    packName.value = ''
    packVolume.value = ''
    selectedFile.value = null
    dialogPackOpen.value = false

    fetchWorkers();
  } catch (err) {
    console.error('Помилка:', err)
    alert('Помилка при додаванні упаковки')
  }
}

const submitPackCount = async () => {
  try {
    await axios.post('http://3.70.45.39:5011/api/update_pack_count', {
      packId: selectedPackId.value,
      countToAdd: Number(addedCount.value),
    }, { withCredentials: true })
    // обновление списка упаковок, если нужно
    fetchWorkers();
    // Закрываем диалог
    dialogPackOpen.value = false
  } catch (err) {
    console.error('Помилка при оновленні кількості:', err)
  }
}



const submitSticker = async () => {
  if (!stickerName.value || !stickerSize.value || !stickerdFile.value) {
    alert('Будь ласка, заповніть усі поля')
    return
  }

  const formData = new FormData()
  formData.append('name', stickerName.value)
  formData.append('size', stickerSize.value)
  formData.append('photo', stickerdFile.value)
  //packVolume


  try {
    const res = await axios.post('http://3.70.45.39:5011/api/add_sticker', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    dialogSticker.value = false
    stickerName.value = ''
    stickerSize.value = ''
    stickerdFile.value = null
    dialogStickerCounter.value = false

    fetchWorkers();
  } catch (err) {
    console.error('Помилка:', err)
    alert('Помилка при додаванні упаковки')
  }
}


const submitStickerCount = async () => {
  try {
    await axios.post('http://3.70.45.39:5011/api/update_sticker_count', {
      stickerId: selectedStickerId.value,
      addedStickerCount: Number(addedStickerCount.value),
    }, { withCredentials: true })
    // обновление списка упаковок, если нужно
    fetchWorkers();
    // Закрываем диалог
    dialogStickerCounter.value = false
  } catch (err) {
    console.error('Помилка при оновленні кількості:', err)
  }
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


  fetchWorkers();

})


// Состояние для выбранной категории
const selectedCategory = ref<string>('packs');

// Функция для выбора категории
const selectCategory = (category: string) => {
  selectedCategory.value = category;
};

</script>

<template>
    <div class="main_block">


      <div class="button_line">
      <button class="type" @click="selectCategory('packs')">Упаковки</button>
      <button class="type" @click="selectCategory('stickers')">Наліпки</button>
      <!-- <button class="type" @click="selectCategory('scotch')">Скотч</button>
      <button class="type" @click="selectCategory('other')">Інше</button> -->
    </div>

      <ScrollArea class="container">
        <div class="packs_block" v-if="selectedCategory === 'packs'">
          <Dialog v-model:open="dialogOpen">

            <DialogTrigger as-child>

              <Button variant="outline" class="add_new_pack_position">Додати упаковку</Button>

            </DialogTrigger>

            <DialogContent class="sm:max-w-[425px]">

                <DialogHeader>
                  <DialogTitle>Додавання нової упаковки</DialogTitle>
                </DialogHeader>

                <div class="grid gap-4 py-4">

                  <div class="grid grid-cols-4 items-center gap-4">

                    <Label for="pack-name" class="text-right">Назва</Label>
                    <Input id="pack-name" v-model="packName" class="col-span-3" />

                  </div>

                  <div class="grid grid-cols-4 items-center gap-4">

                    <Label for="pack-volume" class="text-right">Об'єм</Label>
                    <Input id="pack-volume" v-model="packVolume" class="col-span-3" />

                  </div>

                  <div class="grid grid-cols-4 items-center gap-4">

                    <Label for="pack-photo" class="text-right">Фото упаковки</Label>
                    <Input id="pack-photo" type="file" @change="handleFileChange" class="col-span-3" />

                  </div>

                </div>

                <DialogFooter>

                  <Button @click="submitPack">Зберегти</Button>

                </DialogFooter>

            </DialogContent>

          </Dialog>
          
          <div class="paks_list">

            <div class="pack_block" v-for="pack in packs" :key="pack.packId">

              <img :src="`http://3.70.45.39:5011/${pack.photo}`" alt="pack_photo" class="pack_photo" >

              <span class="name_of_pack">
                {{ pack.name }}
              </span>

              <span class="name_of_pack">
                {{ pack.volume }} г
              </span>

              <div class="sticker_count_block">
                <span class="volume_of_pack">
                {{ pack.count }} шт
              </span>

              <Dialog v-model:open="dialogPackOpen">
    <DialogTrigger as-child>
      <Button variant="outline" class="add_pack" @click="openDialog(pack.packId)">+</Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-[425px]" ref="dialogContent">
      <DialogHeader>
        <DialogTitle>Додавання кількості упаковок</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="pack-count" class="text-right">Додана кількість</Label>
          <Input id="pack-count" v-model="addedCount" class="col-span-3" type="number" />
        </div>
      </div>

      <DialogFooter>
        <Button @click="submitPackCount">Зберегти</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
              </div>


            </div>

          </div>
        </div>


        <div class="packs_block" v-if="selectedCategory === 'stickers'">
          <Dialog v-model:open="dialogSticker">

            <DialogTrigger as-child>

              <Button variant="outline" class="add_new_pack_position">Додати стікер</Button>

            </DialogTrigger>

            <DialogContent class="sm:max-w-[425px]">

                <DialogHeader>
                  <DialogTitle>Додавання нового стікеру</DialogTitle>
                </DialogHeader>

                <div class="grid gap-4 py-4">

                  <div class="grid grid-cols-4 items-center gap-4">

                    <Label for="sticker-name" class="text-right">Назва</Label>
                    <Input id="sticker-name" v-model="stickerName" class="col-span-3" />

                  </div>

                  <div class="grid grid-cols-4 items-center gap-4">

                    <Label for="sticker-size" class="text-right">Розмір</Label>
                    <Input id="sticker-size" v-model="stickerSize" class="col-span-3" />

                  </div>

                  <div class="grid grid-cols-4 items-center gap-4">

                    <Label for="sticker-photo" class="text-right">Фото стікера</Label>
                    <Input id="sticker-photo" type="file" @change="handleStickerFileChange" class="col-span-3" />

                  </div>

                </div>

                <DialogFooter>

                  <Button @click="submitSticker">Зберегти</Button>

                </DialogFooter>

            </DialogContent>

          </Dialog>
          
          <div class="stickers_list">

            <div class="sticker_block" v-for="sticker in stickers" :key="sticker.stickerId">

              <img :src="`http://3.70.45.39:5011/${sticker.photo}`" alt="pack_photo" class="sticker_photo" >

              <span class="name_of_sticker">
                {{ sticker.name }}
              </span>

              <span class="name_of_sticker">
                {{ sticker.size }} см
              </span>

              <div class="sticker_count_block">
                <span class="volume_of_pack">
                {{ sticker.count }} шт
              </span>

              <Dialog  v-model:open="dialogStickerCounter" >

                <DialogTrigger as-child>

                  <Button variant="outline" class="add_pack" @click="stickerDialog(sticker.stickerId)">+</Button>

                </DialogTrigger>

                <DialogContent class="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Додавання кількості стікерів</DialogTitle>
                  </DialogHeader>
                  <div class="grid gap-4 py-4">
                    <div class="grid grid-cols-4 items-center gap-4">
                      <Label for="sticker-count" class="text-right">Додана кількість</Label>
                      <Input id="sticker-count" type="number" v-model="addedStickerCount" class="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button @click="submitStickerCount">Зберегти</Button>
                  </DialogFooter>
                </DialogContent>

              </Dialog>
              </div>


            </div>

          </div>
        </div>

      </ScrollArea >

    </div>
</template>


<style scoped>

  .main_block {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-flow: column;
    overflow: hidden;
    align-items: center;
    background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);

  }

  .container{
    width: 80vw;
    height: 65vh;
    margin-top: 2vh;
    transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;
  }

  .button_line{
    margin-top: 10vh;
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

  .type:hover{
    background: rgba(12, 12, 12, 0.521);
    transition: .3s;
  }

  .packs_block{

    width: 100%;
    height: auto;
  }

  .paks_list{
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    justify-content: space-between;
  }
  .pack_block{
    width: 15vw;
    height: 33vh;
    transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 45px !important;
    display: flex;
    flex-flow: column;
    color:  white;
    align-items: center;
    margin: 1vw 1vw;
    
  }

  .add_pack{
    width: 35px;
    height: 35px;
    border-radius: 35px;
    background-color: transparent;
    backdrop-filter: blur(0px);
    color: white;
    border: none;
    border: 1px solid white;
  }

  .add_new_pack_position{
    transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 45px !important;
    display: flex;
    color:  white;
    padding: 1.5vh 2.5vh;
    margin: 2vh 0;
    border: none;
  }

  .pack_photo{
    width: 10vw;
    height: 10vw;
    border-radius: 5px;

    margin: 1vw;
  }


  .sticker_block{
    width: 15vw;
    height: 33vh;
    transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 45px !important;
    display: flex;
    flex-flow: column;
    color:  white;
    align-items: center;
    margin: 1vw 1vw;
    
  }

  .sticker_photo{
    width: 10vw;
    height: 10vw;
    border-radius: 5px;

    margin: 1vw;

  }

  .stickers_list{
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    justify-content: space-between;

  }

  .sticker_count_block{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 2vw;
  }

  .name_of_sticker{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 2vw;
  }

  .name_of_pack{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 2vw;
  }
</style>
