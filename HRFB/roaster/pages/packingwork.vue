<script setup lang="ts">
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const user: any = ref(null)

const selectedCategory = ref<string>('list')
const selectedLotId = ref<number | null>(null)
const selectedVolume = ref<number | null>(null) // в кг
const selectedPackId = ref<number | null>(null)
const selectedStickerId = ref<number | null>(null)
const manualPackCount = ref<number | null>(null)
const manualStickerCount = ref<number | null>(null)

const roasted = ref([])
const weightToPack = computed(() => selectedVolume.value ? +selectedVolume.value.toFixed(2) : null)

const selectedLot = computed(() =>
  user.value?.datas?.green_kava_work?.find((lot: any) => lot.lotId === selectedLotId.value)
)
const selectedPack = computed(() =>
  user.value?.datas?.additions?.packs?.find((p: any) => p.packId === selectedPackId.value)
)
const selectedSticker = computed(() =>
  user.value?.datas?.additions?.stickers?.find((s: any) => s.stickerId === selectedStickerId.value)
)

const maxVolume = computed(() =>
  selectedLot.value?.globalRoastWeight ? +selectedLot.value.globalRoastWeight.toFixed(2) : 0
)

const packCount = computed(() => {
  if (!weightToPack.value || !selectedPack.value?.volume) return 0
  const grams = weightToPack.value * 1000
  const perPack = Number(selectedPack.value.volume)
  return Math.ceil(grams / perPack)
})

const stickerCount = computed(() => packCount.value)

// Выборки
const lotOptions = computed(() => user.value?.datas?.green_kava_work || [])
const packOptions = computed(() => user.value?.datas?.additions?.packs || [])
const stickerOptions = computed(() => user.value?.datas?.additions?.stickers || [])

// Получение данных
const fetchRoast = async () => {
  try {
    const { data } = await axios.get('http://3.70.45.39:5011/api/get_roasted_kava', {
      withCredentials: true
    })
    roasted.value = data.user
    console.log(roasted.value)
  } catch (error) {
    console.error('Ошибка при загрузке обжарки:', error)
  }
}

const fetchWorkers = async () => {
  try {
    const { data } = await axios.get('http://3.70.45.39:5011/api/team', {
      withCredentials: true
    })
    user.value = data.boss
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error)
  }
}

// Проверка токена
onMounted(() => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))
  if (!token) router.push('/login')

  fetchRoast()
  fetchWorkers()
})

// Отправка на сервер
// const sendPackingData = () => {
//   if (
//     !selectedLotId.value ||
//     !selectedVolume.value ||
//     !selectedPackId.value ||
//     !selectedStickerId.value
//   ) {
//     alert("Заповніть всі поля!")
//     return
//   }

//   const payload = {
//     lotId: selectedLotId.value,
//     volume: selectedVolume.value,
//     packId: selectedPackId.value,
//     stickerId: selectedStickerId.value,
//     packCount: manualPackCount.value ?? packCount.value,
//     stickerCount: manualStickerCount.value ?? stickerCount.value
//   }

//   console.log("Готово до відправки:", payload)
// }



// Состояние для выбранной категории
// const selectedCategory = ref<string>('work');

// Функция для выбора категории
const selectCategory = (category: string) => {
  selectedCategory.value = category;
};


const sendPackingData = async () => {
  if (
    !selectedLotId.value ||
    !selectedVolume.value ||
    !selectedPackId.value ||
    !selectedStickerId.value
  ) {
    alert("Заповніть всі поля!");
    return;
  }

  const payload = {
    lotId: selectedLotId.value,
    volume: selectedVolume.value,
    packId: selectedPackId.value,
    stickerId: selectedStickerId.value,
    packCount: manualPackCount.value ?? packCount.value,
    stickerCount: manualStickerCount.value ?? stickerCount.value,
    createdAt: new Date().toISOString(), // например для истории
  };

  try {
    const response = await axios.post('http://3.70.45.39:5011/api/submit_packing', payload, {
      withCredentials: true,
    });

    console.log("Успешно отправлено:", response.data);
    alert("Фасовку оформлено успішно!");
    
    // очистка полей
    selectedLotId.value = null;
    selectedVolume.value = null;
    selectedPackId.value = null;
    selectedStickerId.value = null;
    manualPackCount.value = null;
    manualStickerCount.value = null;

  } catch (error) {
    console.error("Помилка при відправці:", error);
    alert("Помилка при відправці фасовки.");
  }
};


</script>

<template>
    <div class="main_block">

        <div class="button_line">
            <button class="type" @click="selectCategory('list')" >Замовлення на фасовку</button>
            <button class="type" @click="selectCategory('work')" >Фасування</button>

    </div>

    
        <ScrollArea class="container">

            <div class="packing_order" v-if="selectedCategory === 'work'">
  <label>
    Оберіть лот:
    <select v-model="selectedLotId">
      <option disabled value="">-- Виберіть лот --</option>
      <option
        v-for="lot in lotOptions"
        :key="lot.lotId"
        :value="lot.lotId"
      >
        {{ lot.name }} (ID: {{ lot.lotId }}, Доступно: {{ lot.globalRoastWeight }} кг)
      </option>
    </select>
  </label>

  <label v-if="selectedLotId">
    Оберіть обʼєм:
    <input
      type="number"
      v-model.number="selectedVolume"
      :max="maxVolume"
      min="0.1"
      step="0.1"
    />
    <span v-if="selectedVolume > maxVolume" style="color: red;">
      Обʼєм перевищує доступний!
    </span>
  </label>

  <label>Оберіть упаковку:</label>
  <select v-model="selectedPackId">
    <option
      v-for="pack in user?.datas?.additions?.packs"
      :key="pack.packId"
      :value="pack.packId"
    >
      {{ pack.name }} / {{ pack.volume }}г
    </option>
  </select>

  <label>Оберіть наліпку:</label>
  <select v-model="selectedStickerId">
    <option
      v-for="sticker in user?.datas?.additions?.stickers"
      :key="sticker.stickerId"
      :value="sticker.stickerId"
    >
      {{ sticker.name }} / {{ sticker.size }}
    </option>
  </select>

  <!-- Автоматический расчёт -->
  <div v-if="selectedVolume && selectedPack">
    <p><b>Потрібно упаковок:</b> {{ packCount }}</p>
    <p><b>Потрібно наліпок:</b> {{ stickerCount }}</p>
  </div>

  <!-- Ручной ввод (с предзаполнением из расчёта) -->
  <label>Кількість упаковок:</label>
  <input
    v-model.number="packCount"
    type="number"
    min="1"
  />

  <label>Кількість наліпок:</label>
  <input
    v-model.number="stickerCount"
    type="number"
    min="1"
  />

  <Button @click="sendPackingData">Оформити фасовку</Button>
</div>




            <div class="packing_work" v-if="selectedCategory === 'list'">
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
    <TableRow v-for="(item, index) in roasted" :key="index">
      <TableCell class="font-medium tbl">{{ index + 1 }}</TableCell>
      <TableCell class="tbl">{{ item.name }}</TableCell>
      <TableCell class="tbl">—</TableCell> <!-- Здесь вставь дату если появится -->
      <TableCell class="tbl">{{ item.globalRoastWeight }} кг</TableCell> <!-- Здесь вставь вес если появится -->
      <TableCell class="tbl">
        <button class="btn">Дія</button>
      </TableCell>
    </TableRow>
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