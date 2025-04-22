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

import { Lock } from 'lucide-vue-next';

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
                         
                         <NuxtLink to="/assorti">Асортимент</NuxtLink> <MenubarShortcut>  <Lock style="width: 12px; color: #FFE31A;" /></MenubarShortcut>
                     </MenubarItem>
                    <MenubarItem>
                         
                        <NuxtLink to="/green">Замовлення</NuxtLink> <MenubarShortcut>  <Lock style="width: 12px; color: #FFE31A;" /></MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                            <NuxtLink to="/greensklad">Склад</NuxtLink>
                    </MenubarItem>
                </MenubarContent>
                
                </MenubarMenu>
                
                <MenubarMenu>
                <MenubarTrigger>Обсмажка</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        
                         

                        <NuxtLink to="/roastingwork">Робоча</NuxtLink>
                    </MenubarItem>
                    <MenubarItem>
                        
                        <NuxtLink to="/roastingsklad">Склад</NuxtLink>
                            
                    </MenubarItem>
                </MenubarContent>
                
                </MenubarMenu>
                    
                <MenubarMenu>
                <MenubarTrigger>Фасофка</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                         
                        <NuxtLink to="/packingwork">Робоча</NuxtLink>

                    </MenubarItem>
                    <MenubarItem>
                        <NuxtLink to="/packingsklad">Склад</NuxtLink>
                            
                    </MenubarItem>
                </MenubarContent>
                
                </MenubarMenu>

                <MenubarMenu>
                <MenubarTrigger>Додаткові поставки</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        
                        <NuxtLink to="/addition">Робоча</NuxtLink>
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
