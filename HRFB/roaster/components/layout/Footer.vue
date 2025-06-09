<script setup lang="ts">
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'

import { Lock, Eye } from 'lucide-vue-next';
import { SERVER_URL } from '../../utils/con';

function fetchOwnAccessCheck(SERVER_URL: any, cacheKey = 'own_access_check_cache', cacheDurationMs = 15 * 60 * 1000) {
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < cacheDurationMs) {
        return Promise.resolve(parsed.data);
      }
    } catch (e) {
      console.warn('Ошибка при парсинге кэша:', e);
    }
  }

  const url = `${SERVER_URL}/api/own_acces_check`;

  return fetch(url, {
    method: 'GET',
    credentials: 'include', // 👈 Вот сюда
  })
    .then(res => {
      if (!res.ok) throw new Error('Ошибка сети');
      return res.json();
    })
    .then(data => {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
      return data;
    });
}

const accessData = ref(null);
const error = ref<string | null>(null);


function getAccessLevel(path: string): 'hide' | 'show' | 'use' {
  const access = accessData.value?.access || {};
  const [section, sub] = path.split('.');

  if (sub) {
    return access?.[section]?.[sub] || 'hide';
  }

  return access?.[section] || 'hide';
}

const AccessLink = defineComponent({
  props: {
    to: { type: String, required: true },
    label: { type: String, required: true },
    access: { type: String as PropType<'hide' | 'show' | 'use'>, required: true },
  },
  setup(props) {
    return () => {
      if (props.access === 'hide') {
        return h('span', {
          style: 'opacity: 0.5; pointer-events: none; display: flex; align-items: center; gap: 4px;',
        }, [
          props.label,
          h(Lock, { style: 'width: 12px; color: #FFE31A;' }),
        ]);
      }

      return h('div', {
        style: 'display: flex; align-items: center; gap: 4px;',
      }, [
        h(resolveComponent('NuxtLink'), { to: props.to }, () => props.label),
        props.access === 'show'
          ? h(Eye, { style: 'width: 12px; color: #FFE31A;' })
          : null,
      ]);
    };
  }
});


onMounted(() => {
  fetchOwnAccessCheck(SERVER_URL)
    .then(data => {
      accessData.value = data;
    })
    .catch(err => {
      error.value = err.message || 'Ошибка получения доступа';
    });
});


</script>


<template>
    <div class="footer_block">
        <div class="holder">
            <Menubar class="menubar">
                <MenubarMenu>
                <MenubarTrigger>Керування</MenubarTrigger>
                <MenubarContent class="menu_contnet">
                    <MenubarItem>
                        

                        <NuxtLink to="/">Головна</NuxtLink>

                    </MenubarItem>
                    <MenubarItem>
                    Статистика 
                    </MenubarItem>
                    <MenubarItem >
                        <NuxtLink to="/profile">Профіль</NuxtLink>
                    
                    </MenubarItem>
                    <MenubarItem >
                    
                    <NuxtLink to="/settings">Налаштування</NuxtLink>
                    </MenubarItem>
                    <MenubarItem >
                        
                    
                    <NuxtLink to="/workcalc">Задачі</NuxtLink>
                    </MenubarItem>
                </MenubarContent>
                </MenubarMenu>
                
                <MenubarMenu>
                <MenubarTrigger>Зелена кава</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                            <AccessLink
                                :to="'/assorti'"
                                label="Асортимент"
                                :access="getAccessLevel('green_kava.postavka')"
                            />
                         
                     </MenubarItem>
                    <MenubarItem>
                         
                         
                        <AccessLink
    :to="'/green'"
    label="Замовлення"
    :access="getAccessLevel('green_kava.work')"
  />
                    </MenubarItem>
                    <MenubarItem>

                            <AccessLink
    :to="'/greensklad'"
    label="Склад"
    :access="getAccessLevel('green_kava.sklad')"
  />
                    </MenubarItem>
                </MenubarContent>
                
                </MenubarMenu>
                
                <MenubarMenu>
                <MenubarTrigger>Обсмажка</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        
                         


                        <AccessLink
                                :to="'/roastingwork'"
                                label="Робоча"
                                :access="getAccessLevel('roasted.work')"
                            />
                    </MenubarItem>
                    <MenubarItem>
                        



                        <AccessLink
                                :to="'/roastingsklad'"
                                label="Склад"
                                :access="getAccessLevel('roasted.sklad')"
                            />
                            
                    </MenubarItem>
                </MenubarContent>
                
                </MenubarMenu>
                    
                <MenubarMenu>
                <MenubarTrigger>Фасофка</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                         


                        <AccessLink
                                :to="'/packingwork'"
                                label="Робоча"
                                :access="getAccessLevel('packing.work')"
                            />


                    </MenubarItem>
                    <MenubarItem>
                            
                        <AccessLink
                                :to="'/packingsklad'"
                                label="Склад"
                                :access="getAccessLevel('packing.sklad')"
                            />

                    </MenubarItem>
                </MenubarContent>
                
                </MenubarMenu>

                <MenubarMenu>
                <MenubarTrigger>Додаткові поставки</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        


                        <AccessLink
                                :to="'/addition'"
                                label="Робоча"
                                :access="getAccessLevel('addition.work')"
                            />
                        
                    </MenubarItem>
                    <MenubarItem>
                            Склад
                    </MenubarItem>
                </MenubarContent>
                
                </MenubarMenu>


            </Menubar>
        </div>

    </div>
</template>

<style scoped>

.menubar{
    background-color: transparent;
    color: #FFE31A;
    border: none;
    font-weight: 100;
    font-weight: lighter;
}

.footer_block{
    /* position: absolute; */
    width: 60vw;
    height: 7vh;
    /* background-color: black; */
    border-radius: 50px;
    bottom: 4vh;

    position: absolute;
    margin: 0 auto;
    left: 0;
    right: 0;
    text-align: center;
    display: flex;
    z-index: 20;
font-weight: lighter;

    background: rgba(12, 12, 12, 0.332);
    /* border-radius: 16px; */
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    /* border: 1px solid #FFE31A */
}
.holder{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    font-weight: lighter;
    justify-content: center;
}

</style>
