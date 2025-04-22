<script setup lang="ts">
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
    import { Label } from '@/components/ui/label'
    import { Plus } from 'lucide-vue-next';
    import { MoveUpRight } from 'lucide-vue-next';
    import { Share } from 'lucide-vue-next';
    import { Pen } from 'lucide-vue-next';
    import { Cake } from 'lucide-vue-next';
    import { Star } from 'lucide-vue-next';
    import { MoveRight } from 'lucide-vue-next';
    
    import { Switch } from '@/components/ui/switch'
    import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    } from '@/components/ui/card'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Separator } from '@/components/ui/separator'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';



interface Worker {
    name: string;
    post: string;
}

interface User {
  name: string
}

// Типизация для доступа
interface AccessGroup {
  label?: {
    first?: string;
    second?: string;
    third?: string;
  };
  first: boolean;
  second: boolean;
}

const workers = ref<Worker[]>([]); // Типизация массива работников
  const user = ref<User>({
  name: ''
})


const fetchWorkers = async () => {
    try {
        const response = await axios.get('http://localhost:5011/team', {
            withCredentials: true, // Отправляем куки с запросом
        });
        workers.value = response.data.workers; // Убедитесь, что сервер возвращает массив объектов с name и post
        user.value = response.data.user

        console.log(user.value)
    } catch (error) {
        console.error('Ошибка при загрузке работников:', error);
    }
};

// Загружаем список работников при монтировании компонента

const router = useRouter()

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
    fetchWorkers();
  } else {
    console.log("No token found, redirecting to login...");
  }

  if (!token) {
    // Если токен отсутствует, перенаправляем на страницу логина
    router.push('/login')
  }
})

// Функция обработки изменений чекбокса
// const toggleAccess = (groupKey: string, accessKey: string) => {
//   if (currentUserAccess.value[groupKey]) {
//     currentUserAccess.value[groupKey][accessKey] = !currentUserAccess.value[groupKey][accessKey];
//   }
// };

// Получение данных о доступах работника
const fetchUserAccess = async (workerPost: string) => {
  try {
    const response = await axios.post(
      'http://localhost:5011/user/access',
      { post: workerPost },
      { withCredentials: true }
    );
    currentUserAccess.value = response.data.access || {}; // Заполняем состояние данными
  } catch (error) {
    console.error('Ошибка получения доступов:', error);
  }
};

// Обновление доступов
const updateUserAccess = async (workerPost: string) => {
  try {
    await axios.post(
      'http://localhost:5011/user/update-access',
      { post: workerPost, updatedAccess: currentUserAccess.value },
      { withCredentials: true }
    );
    alert('Доступы успешно обновлены');
  } catch (error) {
    console.error('Ошибка обновления доступов:', error);
  }
};


const currentUserAccess = ref<Record<string, AccessGroup>>({
  five: {
    first: false,
    second: false,
    label: {
      first: 'Робоча',
      second: 'Склад',
      third: 'Додаткові поставки'
    }
  },
  // другие группы доступа
});





const colorMode = useColorMode()


</script>

<template>
    <div class="main_block">
        <div class="content">
            <div class="left">
                <div class="profile">


                <div class="head">

                  <Avatar>
                    <AvatarImage src="https://github.com/radix-vue.png" alt="@radix-vue" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>

                  <span style="font-weight: bold;">{{user.name}}</span>
                </div>

                <span class="badge act">Roaster 🔥</span>

                <div class="birthday">
                  <Cake />
                  <span style="color: white; margin-left: 1vw;">  24.05.1992</span>
                </div>

                <div class="rate">
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                </div>




                </div>
                
                <div class="profile ad">

                    <h2>Додаткові можливості</h2>
                    <div class="plan">
                      <span>Basic</span>
                      <button class="next">  <MoveRight /></button>
                    </div>
                    <div class="plan">
                      <span>Master</span>

                      <button class="next">  <MoveRight /></button>
                    </div>
                    <div class="plan">
                      <span>Roaster</span>
                      <button class="next">  <MoveRight /></button>
                    </div>



                </div>
            </div>

  

            <div class="members">
                <Card style="margin-bottom: 25px;" class="first_card">
                  <CardHeader>
                    <CardTitle>Ви з нами вже 27 днів! Так тримати 🎉</CardTitle>
                  </CardHeader>
                </Card>

                <Card class="first_card">
                  <CardContent>
                      <div class="frist_line" >
                        <Avatar class="avatar">
                            <AvatarImage src="https://github.com/radix-vue.png" alt="@radix-vue" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h5>Катерина</h5>
                        <span class="badge">Roaster 🔥</span>
                        <span class="badge">Красуня 🪷</span>
                        <span class="badge">Зірочка 🌟</span>
                      </div>
                      <div class="second_line">
                        <span>
                          Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis reprehenderit nesciunt praesentium ex earum numquam error soluta corrupti vel maxime sapiente mollitia voluptatibus suscipit pariatur saepe, est natus eum in!
                          Sapiente nihil commodi facilis cum laborum odio tempora ea fugiat optio labore earum et a error quae voluptates eum distinctio ipsa, neque provident! Nemo qui accusantium reprehenderit, fugiat pariatur a.
                          In alias ducimus beatae sapiente officiis expedita fuga unde quis dolores earum hic ipsam molestiae, impedit asperiores numquam mollitia sunt! Corrupti, illo quidem! Nesciunt tempore, nam architecto non deleniti quidem.
                          Officiis ex necessitatibus dolore maiores eum ipsam, ipsa tempore, illum adipisci beatae qui nobis in nemo impedit eligendi sed ut architecto! Vitae accusamus hic dolor quis deleniti optio nisi quo.
                          Ullam ipsam autem, ipsa est, ducimus ipsum facere natus eius dicta mollitia, possimus at. Cumque consectetur tempore tenetur accusamus quidem ea deserunt perferendis, ex nulla mollitia necessitatibus, quaerat voluptatibus? Libero?
                        </span>
                      </div>
                      <div class="last_line" >
                        <span>Кава надихає — вона пробуджує думки, що змінюють світ. ☕</span>
                        <div>
                          <button>  <Share /></button>
                          <button>    <Pen /></button>
                        </div>

                      </div>
                  </CardContent>
                </Card>
            </div>


        </div>
    </div>
</template>


<style scoped>

.plan{
  background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        color: white;
        width: fit-content;
        justify-content: space-around;
        padding: 10px 15px;
        display: flex;
        align-items: center; 
        width: fit-content;   
        width: 10vw;
        transition: .4s; 
        cursor: pointer; 
}

.plan:hover{
  width: 15vw; 
  transition: .4s;   
}

.frist_line{
  display: flex;
  align-items: center;
  margin: 2vw 0;
}
.rate{
  display: flex;
  align-items: center;
  color: white;

  
}

.next{

    border: none;
    border-radius: 150px;
    background: rgba(12, 12, 12, 0.203) !important;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    cursor: pointer;
    width: 2.5vw;
    height: 2.5vw;
    color: #FFE31A;
    display: flex;
    align-items: center;
    justify-content: center;
}

.frist_line > .avatar{
margin-right: 2vw;
}

.frist_line > h5{
margin-right: 2vw;
font-size: 1.5vw;
font-weight: bold;
}
 .act{
  background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;

        color: white;
        width: fit-content;
        padding: 5px 15px;
        margin: 1vw 0;

}
.birthday{
  color: #FFE31A;
  display: flex;
  align-items: center;
  height: 2vw;
  font-size: 1vw;
  margin: 1vw 0;
}
.frist_line > .badge{
  background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        padding: 5px 15px;
        margin: 0 .5vw;
}

.second_line{
  margin: 2vw 0;
  display: flex;
}

  .last_line{
    color: rgba(255, 255, 255, 0.684);
  display: flex;
  align-items: center;
  justify-content: space-between;
  }

  .last_line > div{
    display: flex;
  }
  .last_line > div> button{
    padding: 10px;
    border: none;
    border-radius: 150px;
    background: rgba(12, 12, 12, 0.203) !important;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(0px) !important;
    cursor: pointer;
    width: 2.5vw;
    height: 2.5vw;
    color: #FFE31A;
    display: flex;
    align-items: center;
    justify-content: center;
  
  }
.marg{
    margin-top: 25px;
}
    .main_block{
        display: flex;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
        
    }

    .left{
        width: 20vw;
    }
    .content{
        display: flex;

        width: 80vw;
        height: 80vh 
    }
    .profile{
        height: 25vh;
        background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 25px !important;
        width: 20vw;
        border: none;
        display: flex;
        flex-flow: column;
        justify-content: space-around;
        /* padding-left: 15px; */
        margin-top: 1vw;
        padding: 15px;
    }

    .first_card{
      background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 15px !important;
        border: none;
        color: white;
    }

    .members{
        width: 70vw;
        height: 80vh;

        padding: 20px;
        display: flex;
        flex-flow: column;
        
    }

    .head{
        display: flex;
        align-items: center;
    }

    .phone{
        color: white;
        margin-bottom: 25px;
    }



    .inp{
        color: white;
        border: 1px solid grey;
        border-radius: 10px;
        padding: 10px;
        width: 300px;
    }

    button{
        border-radius: 5px;
        background-color: white;
        color: black;
        font-weight: 400;
        padding: 8px;
        margin: 0 10px;
    }

    .status{
        color: white;
        font-weight: bold;
        font-size: 2vw;
    }

    .head{
        color: white;
        font-size: 1.2vw;
    }

    .head > span{
        margin-right: 25px;
    }
.ad{
    height: 32.5vh;
    margin-top: 2vw;
    background: rgba(12, 12, 12, 0.332);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(0px) !important;
        -webkit-backdrop-filter: blur(0px) !important;
        border-radius: 15px !important;
        border: none;
        color: white;
    /* border: 1px solid black; */
}

.white{
    color: black;
}

.button_block{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
}

.button_block > Button:hover{
    color: white
}

.mess:hover{
    color: white  
}

.add{
    height: auto;
    width: 60vw;
}

.redaction{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr
}

.swh{
    margin-top: 20px;
}

.headl{
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.headl > p{
    border: 1px solid black;
    padding: 10px;
    border-radius: 20px;
}

.headl > button{
    border-radius: 100px;
    border: none;
}

.medium{

font-size: 4vw;
font-weight: bold;
display: flex;
align-items: center;
justify-content: center
}

.last{
    display: flex;
    font-size: xx-small;
    position: relative;
}

.last >button{
    display: flex;
    font-size: small;
    border-radius: 100px;
    border: 5px white solid;
    background-color: transparent;
    position: absolute;
    right: -12px;
    bottom: -23px;
}


</style>