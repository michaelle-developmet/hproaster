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




// Определение интерфейсов для User и Role
interface User {
    name: string;
    post: string;
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

const assignRoleToUser = async () => {
  if (!selectedUser.value || !selectedRole.value) return

  try {
    await axios.post(
  `${SERVER_URL}/api/assign-role`,
  {
    userId: selectedUser.value._id,
    role: selectedRole.value,
  },
  {
    withCredentials: true,
  }
);

    // Обновляем локально
    if (!selectedUser.value.own_roles) {
      selectedUser.value.own_roles = []
    }
    selectedUser.value.own_roles.push(selectedRole.value)

    selectedUser.value = null
    selectedRole.value = null
  } catch (err) {
    console.error('Ошибка при назначении роли:', err)
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

  fetchAllRolses();
  fetchWorkers();
  fetchAllStyles();
})

</script>

<template>
    <div class="main_block">

        <div class="button_line">
            <button class="type"  @click="selectCategory('visual')" >Налаштування візуалу</button>
          <button class="type"  @click="selectCategory('roles')" >Ролі</button>
          <button class="type"  @click="selectCategory('workers')" >Персонал</button>
        <!-- <button class="type" @click="selectCategory('workers')" >Персонал </button> -->

      <!-- <button class="type" @click="selectCategory('scotch')">Скотч</button>
      <button class="type" @click="selectCategory('other')">Інше</button> -->
    </div>

        <div class="personal">

            <div class="header visual" v-if="selectedCategory === 'visual'">
                <div class="counter">1</div>
                <span class="head_text">Візуальні налаштування</span>
            </div>
            <div class="header visual" v-if="selectedCategory === 'roles'">
                <div class="counter">2</div>
                <span class="head_text">Ролі</span>
            </div>

            <div class="header" v-if="selectedCategory === 'workers'">
                <div class="counter">3</div>
                <span class="head_text">Персонал</span>
            </div>




            <div class="content" v-if="selectedCategory === 'workers'">
    <div
      class="worker_plate"
      v-for="worker in user.alternative"
      :key="worker._id"
    >
      <Avatar>
        <AvatarImage src="https://github.com/radix-vue.png" :alt="worker.name" />
        <AvatarFallback>{{ worker.name?.slice(0, 2).toUpperCase() || '??' }}</AvatarFallback>
      </Avatar>
      <span class="name">{{ worker.name }}</span>

      <template v-if="worker.own_roles?.length">
        <span
          v-for="(role, index) in worker.own_roles"
          :key="index"
          class="badge"
        >
          {{ role.role_name }}
        </span>
      </template>

      <!-- Если нет ролей — показываем диалог с кнопкой "+" -->
      <Dialog v-if="!worker.own_roles || worker.own_roles.length < 3">
        <DialogTrigger as-child>
          <Button
            class="badge bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2"
            @click="() => selectedUser = worker"
          >
            +
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Призначити роль</DialogTitle>
            <DialogDescription>
              Виберіть роль для користувача <strong>{{ selectedUser?.name }}</strong>
            </DialogDescription>
          </DialogHeader>

          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="role-select" class="text-right">Роль</Label>
              <select
                id="role-select"
                v-model="selectedRole"
                class="col-span-3 border px-2 py-1 rounded"
              >
                <option disabled value="">-- Виберіть роль --</option>
                <option
                  v-for="role in user.boss.roles"
                  :key="role.role_id"
                  :value="role"
                >
                  {{ role.role_name }}
                </option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button @click="assignRoleToUser">Додати</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
          </div>



          

            <div class="content roles visual" v-if="selectedCategory === 'roles'">
                <ScrollArea class="scroll_roles">


                    <Dialog>
  <DialogTrigger as-child>
    <Button class="badje_customizing_button ">Додати роль</Button>
  </DialogTrigger>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Додати нову роль</DialogTitle>
      <DialogDescription>
        Доступи до сторінок налаштовуються після створення ролі
      </DialogDescription>
    </DialogHeader>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="role-name" class="text-right">Назва ролі</Label>
        <Input id="role-name" v-model="newRoleName" class="col-span-3" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="decorative" class="text-right">Декоративна роль</Label>
        <input id="decorative" type="checkbox" v-model="isDecorative" class="col-span-3" />
      </div>
    </div>
    <DialogFooter>
      <Button @click="submitNewRole">Зберегти</Button>
    </DialogFooter>
  </DialogContent>
                    </Dialog>
                    <button
      class="badje_customizing_button"
      v-for="role in allRoles"
      :key="role.role_id"
      @click="selectRole(role.role_id)"
    >
      {{ role.role_name }}
    </button>

                </ScrollArea >

                <ScrollArea class="customize_roles">
                    <!-- // green  -->
                    <div v-if="selectedRoleId && roleAccess" style="display: flex; flex-flow: column;" class="block_of_green">
                        <h3 class="head_text_of_category">Доступи  до зеленої кави : </h3>

                        <div class="line_block">
                        <span class="subtext" >Поставки :</span>
                        <div style="display: flex;" class="button_row">

                            <button
                                :class="{'active': roleAccess.green_kava.postavka === 'hide'}"
                                @click="updateAccess('green_kava', 'postavka', 'hide')"
                                >
                                <EyeOff />
                            </button>

                            <button
                            :class="{'active': roleAccess.green_kava.postavka === 'show'}"
                            @click="updateAccess('green_kava', 'postavka', 'show')"
                            >
                                <Eye />
                            </button>

                            <button
                            :class="{'active': roleAccess.green_kava.postavka === 'use'}"
                            @click="updateAccess('green_kava', 'postavka', 'use')"
                            >
                                <Pencil />
                            </button>

                        </div>
                        </div>



                        <div class="line_block" >
                        <span class="subtext" >Робоча :</span>
                        <div class="button_row">
                            <button :class="{'active hide': roleAccess.green_kava.work === 'hide'}"@click="updateAccess('green_kava', 'work', 'hide')">
                            <EyeOff/>
                            </button>
                            <button
                            :class="{'active act': roleAccess.green_kava.work === 'show'}"
                            @click="updateAccess('green_kava', 'work', 'show')"
                            >
                            <Eye />
                            </button>
                            <button
                            :class="{'active use': roleAccess.green_kava.work === 'use'}"
                            @click="updateAccess('green_kava', 'work', 'use')"
                            >
                            <Pencil />
                            </button>
                        </div>
                        </div>


                        <div class="line_block" >
                        <span class="subtext">Склад зеленої кави :</span>
                        <div class="button_row">
                            <button class="btn_customize"
                            :class="{'active': roleAccess.green_kava.sklad === 'hide'}"
                            @click="updateAccess('green_kava', 'sklad', 'hide')"
                            >
                            <EyeOff/>
                            </button>
                            <button class="btn_customize"
                            :class="{'active': roleAccess.green_kava.sklad === 'show'}"
                            @click="updateAccess('green_kava', 'sklad', 'show')"
                            >
                            <Eye />
                            </button>
                            <button class="btn_customize"
                            :class="{'active': roleAccess.green_kava.sklad === 'use'}"
                            @click="updateAccess('green_kava', 'sklad', 'use')"
                            >
                            <Pencil />
                            </button>
                        </div>
                        </div>
                    </div>
<!-- roasted -->
                    <div v-if="selectedRoleId && roleAccess" style="display: flex; flex-flow: column;" class="block_of_green">
                        <h3 class="head_text_of_category">Доступи  до обсмаженої кави : </h3>

                        <div class="line_block">
                        <span class="subtext" >Робоча :</span>
                        <div style="display: flex;" class="button_row">

                            <button
                                :class="{'active': roleAccess.roasted.work === 'hide'}"
                                @click="updateAccess('roasted', 'work', 'hide')"
                                >
                                <EyeOff />
                            </button>

                            <button
                            :class="{'active': roleAccess.roasted.work === 'show'}"
                            @click="updateAccess('roasted', 'work', 'show')"
                            >
                                <Eye />
                            </button>

                            <button
                            :class="{'active': roleAccess.roasted.work === 'use'}"
                            @click="updateAccess('roasted', 'work', 'use')"
                            >
                                <Pencil />
                            </button>

                        </div>
                        </div>



                        <div class="line_block" >
                        <span class="subtext" >Склад :</span>
                        <div class="button_row">
                            <button :class="{'active hide': roleAccess.roasted.sklad === 'hide'}"@click="updateAccess('roasted', 'sklad', 'hide')">
                            <EyeOff/>
                            </button>
                            <button
                            :class="{'active act': roleAccess.roasted.sklad === 'show'}"
                            @click="updateAccess('roasted', 'sklad', 'show')"
                            >
                            <Eye />
                            </button>
                            <button
                            :class="{'active use': roleAccess.roasted.sklad === 'use'}"
                            @click="updateAccess('roasted', 'sklad', 'use')"
                            >
                            <Pencil />
                            </button>
                        </div>
                        </div>

                    </div>
<!-- packing -->
                    <div v-if="selectedRoleId && roleAccess" style="display: flex; flex-flow: column;" class="block_of_green">
                        <h3 class="head_text_of_category">Доступи  до фасування кави : </h3>

                        <div class="line_block">
                        <span class="subtext" >Робоча :</span>
                        <div style="display: flex;" class="button_row">

                            <button
                                :class="{'active': roleAccess.packing.work === 'hide'}"
                                @click="updateAccess('packing', 'work', 'hide')"
                                >
                                <EyeOff />
                            </button>

                            <button
                            :class="{'active': roleAccess.packing.work === 'show'}"
                            @click="updateAccess('packing', 'work', 'show')"
                            >
                                <Eye />
                            </button>

                            <button
                            :class="{'active': roleAccess.packing.work === 'use'}"
                            @click="updateAccess('packing', 'work', 'use')"
                            >
                                <Pencil />
                            </button>

                        </div>
                        </div>



                        <div class="line_block" >
                        <span class="subtext" >Склад :</span>
                        <div class="button_row">
                            <button :class="{'active hide': roleAccess.packing.sklad === 'hide'}"@click="updateAccess('packing', 'sklad', 'hide')">
                            <EyeOff/>
                            </button>
                            <button
                            :class="{'active act': roleAccess.packing.sklad === 'show'}"
                            @click="updateAccess('packing', 'sklad', 'show')"
                            >
                            <Eye />
                            </button>
                            <button
                            :class="{'active use': roleAccess.packing.sklad === 'use'}"
                            @click="updateAccess('packing', 'sklad', 'use')"
                            >
                            <Pencil />
                            </button>
                        </div>
                        </div>

                    </div>
<!-- addition -->
                    <div v-if="selectedRoleId && roleAccess" style="display: flex; flex-flow: column;" class="block_of_green">
                        <h3 class="head_text_of_category">Доступи  до додаткових поставок : </h3>

                        <div class="line_block">
                        <span class="subtext" >Робоча :</span>
                        <div style="display: flex;" class="button_row">

                            <button
                                :class="{'active': roleAccess.addition.work === 'hide'}"
                                @click="updateAccess('addition', 'work', 'hide')"
                                >
                                <EyeOff />
                            </button>

                            <button
                            :class="{'active': roleAccess.addition.work === 'show'}"
                            @click="updateAccess('addition', 'work', 'show')"
                            >
                                <Eye />
                            </button>

                            <button
                            :class="{'active': roleAccess.addition.work === 'use'}"
                            @click="updateAccess('addition', 'work', 'use')"
                            >
                                <Pencil />
                            </button>

                        </div>
                        </div>



                        <div class="line_block" >
                        <span class="subtext" >Склад :</span>
                        <div class="button_row">
                            <button :class="{'active hide': roleAccess.addition.sklad === 'hide'}"@click="updateAccess('addition', 'sklad', 'hide')">
                            <EyeOff/>
                            </button>
                            <button
                            :class="{'active act': roleAccess.addition.sklad === 'show'}"
                            @click="updateAccess('addition', 'sklad', 'show')"
                            >
                            <Eye />
                            </button>
                            <button
                            :class="{'active use': roleAccess.addition.sklad === 'use'}"
                            @click="updateAccess('addition', 'sklad', 'use')"
                            >
                            <Pencil />
                            </button>
                        </div>
                        </div>

                    </div>

                </ScrollArea >
            </div>

            <div class="content visual" v-if="selectedCategory === 'visual'">
                


                <div class="themese_choise" >
                    <h3 class="head_text_of_category">Теми </h3>
                    <ScrollArea class=" rounded-md w-96 whitespace-nowrap themese_choise">
    <div class="flex p-4 space-x-4 w-max">
          <!-- Выбранная тема -->
  <div class="theme selected">
    <img src="../public/back.jpg" alt="Theme" class="theme-image" />
    <div class="theme-title">Темна Тема</div>
    <div class="theme-indicator"></div>
  </div>

        <div class="theme">
    <img src="../public/back.jpg" alt="Theme" class="theme-image" />
    <div class="theme-title">Світла Тема</div>
    <div class="theme-indicator"></div>
  </div>
  <div class="theme">
    <img src="../public/back.jpg" alt="Theme" class="theme-image" />
    <div class="theme-title">Світла Тема</div>
    <div class="theme-indicator"></div>
  </div>
  <div class="theme">
    <img src="../public/back.jpg" alt="Theme" class="theme-image" />
    <div class="theme-title">Світла Тема</div>
    <div class="theme-indicator"></div>
  </div>
  <div class="theme">
    <img src="../public/back.jpg" alt="Theme" class="theme-image" />
    <div class="theme-title">Світла Тема</div>
    <div class="theme-indicator"></div>
  </div>
  <div class="theme">
    <img src="../public/back.jpg" alt="Theme" class="theme-image" />
    <div class="theme-title">Світла Тема</div>
    <div class="theme-indicator"></div>
  </div>
  <div class="theme">
    <img src="../public/back.jpg" alt="Theme" class="theme-image" />
    <div class="theme-title">Світла Тема</div>
    <div class="theme-indicator"></div>
  </div>
  <div class="theme">
    <img src="../public/back.jpg" alt="Theme" class="theme-image" />
    <div class="theme-title">Світла Тема</div>
    <div class="theme-indicator"></div>
  </div>
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
                </div>

                


            </div>
        </div>


    </div>
</template>


<style scoped>

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
    background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column;
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


.block_of_green{
    margin: 2vw 1vw;
}

    .personal{
        width: 80vw;
        height: 65vh;
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




    .badge{
        background: rgba(12, 12, 12, 0.085);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        padding: 5px 15px;
        margin: 0 .5vw;
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


</style>