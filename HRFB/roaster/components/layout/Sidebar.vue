<script lang="ts" setup></script>

<template>
    <aside class="sidebar">
        <NuxtLink to="/">
            <NuxtImg src="/logo.png" alt="" width="100px" class="mx-auto img_uniq"/>
        </NuxtLink>


        <!-- <Button>Send</Button> -->

        <Accordion type="single" collapsible class="sidebar_menu">
            <AccordionItem value="item-1">
                <AccordionTrigger><NuxtImg src="/home.svg" alt="" width="25px" style="color: green;"/>Керування</AccordionTrigger>

                <AccordionContent>
                    Головна
                </AccordionContent>
                <AccordionContent>
                    Статистика
                </AccordionContent>
                <AccordionContent>
                    Профіль
                </AccordionContent>
                <AccordionContent>
                    Налаштування
                </AccordionContent>
                <AccordionContent>
                    Задачі
                </AccordionContent>
                <AccordionContent>
                    Переоблік
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger><NuxtImg src="/green.svg" alt="" width="25px" style="color: green;"/>Зелена Кава</AccordionTrigger>

                <AccordionContent>
                    Замовлення 
                </AccordionContent>
                <AccordionContent>
                    Асортимент 
                </AccordionContent>
                <AccordionContent>
                    Склад
                </AccordionContent>

            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger><NuxtImg src="/fire.png" alt="" width="25px" style="color: green;"/>Обсмажка</AccordionTrigger>

                <AccordionContent>
                    Робоча 
                </AccordionContent>
                <AccordionContent>
                    Склад
                </AccordionContent>

            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger><NuxtImg src="/pack.png" alt="" width="25px" style="color: green;"/> Фасофка</AccordionTrigger>

                <AccordionContent>
                    Робоча 
                </AccordionContent>
                <AccordionContent>
                    Склад
                </AccordionContent>

            </AccordionItem>
            <AccordionItem value="item-6">
                <AccordionTrigger><NuxtImg src="/truck.png" alt="" width="25px" style="color: green;"/>Поставки</AccordionTrigger>

                <AccordionContent>
                    Робоча 
                </AccordionContent>
                <AccordionContent>
                    Склад
                </AccordionContent>

            </AccordionItem>
    </Accordion>
        
    </aside>
</template>

<style scoped>
.sidebar_menu{
    padding: 13px;
}

.img_uniq{
    margin-top:  50px ;
    margin-bottom: 50px;
}

.sidebar{
    border: 1px solid red
}
</style>