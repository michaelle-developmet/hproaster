<script setup lang="ts">
import { Calendar } from '@/components/ui/calendar'
import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'
import { useRouter } from 'vue-router'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type Ref, ref, onMounted } from 'vue'
import axios from 'axios'
import { format, parseISO } from 'date-fns'
import { uk } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'
import { SquareUser, User } from 'lucide-vue-next';
import { Calendar1 } from 'lucide-vue-next';
import { Trophy } from 'lucide-vue-next';
import { Clock5 } from 'lucide-vue-next';
import { AlignLeft } from 'lucide-vue-next';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { SERVER_URL } from '../utils/con.js';


const value = ref(today(getLocalTimeZone())) as Ref<DateValue>
const router = useRouter()

interface User {
  name: string
  post: string
}

interface Appointment {
  id: string
  whoisdoing: string
  from: string
  deadline: string
  priority: string
  description: string
  status?: string
  completeTime?: string
}

interface TeamResponse {
  boss: {
    appointments: Appointment[]
    workers: string[]
  }
  user: {
    name: string
  }
}

const openTaskDialog = ref(false)
const selectedTask = ref<Appointment | null>(null)

const openDialog = (task: Appointment) => {
  selectedTask.value = task
  openTaskDialog.value = true
}

const closeDialog = () => {
  openTaskDialog.value = false
}

const datas = ref<TeamResponse | null>(null)
const bossAppointments = ref<Appointment[]>([])
const filteredAppointments = ref<Appointment[]>([])
const currentUserName = ref<string>('')
const currentUserPost = ref<string>('')

const showForm = ref(false)

const taskForm = ref({
  whoisdoing: '',
  deadline: '',
  priority: 'default',
  description: ''
})

const timeZone = 'Europe/Kyiv'

const getPriorityRank = (priority: string) => {
  switch (priority) {
    case 'terminate': return 3
    case 'now': return 2
    default: return 1
  }
}

const formatDeadline = (deadline: string) => {
  const localDate = toZonedTime(deadline, timeZone)
  return format(localDate, 'yyyy-MM-dd HH:mm:ss', { locale: uk })
}

// Группировка задач по дню
const groupAndSortAppointments = (appointments: any[]) => {
  const groups: Record<string, any[]> = {}

  appointments.forEach(task => {
    const localDate = toZonedTime(task.deadline, timeZone)
    const dayKey = format(localDate, 'yyyy-MM-dd')

    if (!groups[dayKey]) groups[dayKey] = []
    groups[dayKey].push({ ...task, localDate })
  })

  Object.keys(groups).forEach(day => {
    groups[day].sort((a, b) => {
      const priorityDiff = getPriorityRank(b.priority) - getPriorityRank(a.priority)
      if (priorityDiff !== 0) return priorityDiff
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
  })

  return groups
}

const assignTask = async () => {
  try {
    if (!datas.value) return

    const currentUser = datas.value.user.name

    await axios.post(
      `${SERVER_URL}/api/assign_task`,
      {
        ...taskForm.value,
        from: currentUser
      },
      {
        withCredentials: true
      }
    )

    showForm.value = false

    taskForm.value = {
      whoisdoing: '',
      deadline: '',
      priority: 'default',
      description: ''
    }

    fetchWorkers()
  } catch (e) {
    console.error('Ошибка при назначении задачи:', e)
  }
}

const filterAppointments = (mode: 'my' | 'issued' | 'done') => {
  if (!currentUserName.value || !bossAppointments.value) return

  let result = []
  switch (mode) {
    case 'my':
      result = bossAppointments.value.filter(task =>

        task.whoisdoing === currentUserPost.value && task.status !== 'complete'
      )
      break
    case 'issued':
      result = bossAppointments.value.filter(task =>
        task.from === currentUserName.value
      )
      break
    case 'done':
      result = bossAppointments.value.filter(task =>
        task.whoisdoing === currentUserName.value && task.status === 'complete'
      )
      break
  }

  // Преобразуем результат в массив задач
  filteredAppointments.value = Object.values(groupAndSortAppointments(result)).flat()
}

const fetchWorkers = async () => {
  try {
    const response = await axios.get<TeamResponse>(`${SERVER_URL}/api/team`, {
      withCredentials: true
    })

    datas.value = response.data
    bossAppointments.value = response.data.boss.appointments
    currentUserName.value = response.data.user.name
    currentUserPost.value = response.data.user.post

    console.log("Boss",bossAppointments.value)
    console.log("Username",currentUserPost.value)
    filterAppointments('my') // показываем по умолчанию "Мої задачі"
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error)
  }
}

const markComplete = async (taskId: string) => {
  try {
    const task = filteredAppointments.value.flat().find(t => t.id === taskId); // Находим задачу по ID

    if (!task) return;

   // Функция для получения данных о текущем пользователе

    // Создаем полезную нагрузку для отправки на сервер
    const payload = {
      taskId,
      userId: datas.value?.user,  // ID текущего пользователя
      status: 'complete',  // Новый статус задачи
      completeTime: new Date().toISOString(),  // Время завершения задачи
    };

    // Отправляем запрос на сервер
    await axios.put(`${SERVER_URL}/api/tasks/complete`, payload, { withCredentials: true });

    // Обновляем статус задачи на фронте
    task.status = 'complete';
    task.completeTime = new Date().toISOString();
    fetchWorkers()

  } catch (error) {
    console.error('Error completing task', error);
  }
};

onMounted(() => {
  const token = document.cookie.split('; ').find((row) => row.startsWith('token='))

  if (!token) {
    console.log('No token found, redirecting to login...')
    router.push('/login')
  } else {
    console.log('Token found:', token)
    fetchWorkers()
  }
})
</script>

<template>
  <div class="main_block">
    <div class="button_line">
      <button class="button" @click="filterAppointments('my'), showForm = false">Мої задачі</button>
      <button class="button" @click="filterAppointments('issued'), showForm = false">Видані задачі</button>
      <button class="button" @click="filterAppointments('done'), showForm = false" >Виконані задачі</button>
      <button @click="showForm = true; filteredAppointments = []" class="button">Призначити задачу</button>

    </div>

    <ScrollArea class="scroll">
      <div v-if="showForm" class="task-group">
        <h5 class="header_date"> Нова задача</h5>

        <div class="element">
          <label>Кому видати задачу:</label>
        <select v-model="taskForm.whoisdoing" class="date_sel">
          <option disabled value="">Оберіть користувача</option>
          <option v-for="workerId in datas?.boss?.workers || []" :key="workerId" :value="workerId">
            {{ workerId }}
          </option>
        </select>
        </div>


        <div class="element">
          <label>Кінцева дата та час:</label>
          <input type="datetime-local" v-model="taskForm.deadline" class="date_sel" />
        </div>


        <div class="element">
          <label>Пріоритет:</label>
        <select v-model="taskForm.priority" class="date_sel">
          <option value="default">Звичайний</option>
          <option value="now">Важливо</option>
          <option value="terminate">Терміново</option>
        </select>
        </div>
        <div class="element">

        <label>Опис задачі:</label>
        <textarea v-model="taskForm.description" rows="4" class="date_sel area" />

        </div>




        <button @click="assignTask" class="button">Надіслати</button>
      </div>

      <div v-for="(tasks, day) in groupAndSortAppointments(filteredAppointments)" :key="day" class="task-group">
        <h5 class="header_date">{{ format(parseISO(day), 'cccc dd', { locale: uk }).replace(/^./, (match) => match.toUpperCase()) }}:</h5>

        <div v-for="task in tasks" :key="task.id" class="task-card">
          
          <!-- // от кого -->
          <span class="task_text">  <SquareUser class="icon" /> {{ task.from }}</span>

          <!-- //до когда -->
          <span class="task_text clocker">
  <Calendar1 class="icon" />
  {{ format(parseISO(task.deadline), 'dd/mm/yyyy , HH:mm', { locale: uk }) }}
          </span>

          <!-- //описание -->
          <span class="task_text">    <AlignLeft class="icon" /> 
 <HoverCard>
    <HoverCardTrigger as-child>
      <Button variant="link" style="text-decoration: none; color: white;">
        Дивитись
      </Button>
    </HoverCardTrigger>
    <HoverCardContent class="w-80 clever_card" >
      <div class="flex justify-between space-x-4">
        <div class="space-y-1">
          <p class="text-sm">
            {{ task.description }}
          </p>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
           
          </span>

          <!-- // приоритет -->
          <span class="task_text">
            <Trophy class="icon" />

            <div :class="['priority_icon', task.priority]" v-if="task.priority">
              <!-- <Trophy class="icon" style="width: 15px; color: white;"/> -->
            </div>
  <!-- <span v-else>{{ task.status || 'not' }}</span> -->
          </span>

          <!-- // статус -->
          <span class="task_text">
  <Clock5 class="icon" />
  {{
    task.status === 'added'
      ? 'додано'
      : task.status === 'progress'
        ? 'робиться'
        : task.status === 'complete'
          ? 'виконано'
          : 'невідомо'
  }}
</span>


<button
  v-if="task.status === 'added'"
  @click="markComplete(task.id)"
  class="button--plus"
>
  +
</button>



          <!-- <p><strong>Опис:</strong> {{ task.description }}</p>
          <p><strong>Кому:</strong> {{ task.whoisdoing }}</p>


          <p><strong>Пріоритет:</strong> {{ task.priority }}</p>
          <p><strong>До:</strong> {{ formatDeadline(task.deadline) }}</p>
          <p><strong>Статус:</strong> {{ task.status || 'не призначено' }}</p> -->

        </div>
      </div>
    </ScrollArea>
  </div>
</template>

<style scoped>

.date_sel{
  margin-left: 2vw;
  padding: .5vw;
  color: white;
  transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 15px !important;
  
}

.area{
  width: 30vw;
  resize: none;
}

.element{
  display: flex;
  align-items: center;
  color: white;
  margin: 2vw 2vw 2vw 0;
}
.scroll{
    min-width: 80vw;
    max-width: 100vw;
    max-height: 60vh;

    margin-top: 2vh;

    /* padding: 3vh 3vh 3vh 3vh ; */
    padding: 0 1vw;
    transform: translateX(0vw);
    transition: transform 0.5s ease-in-out; /* Плавная анимация */
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;
}

.button{
    border: none;
    background: rgba(12, 12, 12, 0.332);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    border-radius: 25px !important;
    cursor: pointer;
    color: white;
    padding: 1.5vh;
    margin-right: 1vw;
    font-size: 1vw;
    transition: .3s;
}

.button:hover{

    background: rgba(12, 12, 12, 0.521);
    transition: .3s;

}

.main_block{
    display: flex;
    align-items: center;
    /* justify-content: center; */
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
    margin-top: 15vh;
    width: 80vw;
}
.header_date{
  color: white;
  font-size: 2vw;
}
.task-group{
  border-radius: 0px ;
  padding: 1vh;
}



.task-card{
  display: flex;
  margin: 2vw 0;
  align-items: center;
  height: 5vh;
}

.task_text{
  display: flex;
  color: white;
  font-size: 1vw;
  align-items: center;
  width: 13vw;
}

.clocker{
  width: 25vw;
}

.icon{
  color: #FFE31A;
  width: 20px;
  margin: 0 2vw 0 2vw;
}

.priority_icon {
  width: 65px;
    height: 25px;

    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.priority_icon.default {
  background-color:  rgba(0, 255, 156, 0.700);
}

.priority_icon.now {
  background-color: rgba(255, 230, 0, 0.700);
}

.priority_icon.terminate {
  background-color: rgba(200, 0, 255, 0.7);
}

.button--plus{
  width: 35px;
  height: 35px;
  border-radius: 5px;
  background-color: rgba(0, 255, 156, 0.700);
  backdrop-filter: blur(0px);
  color: white;
}
</style>