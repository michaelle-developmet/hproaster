<script lang="ts" setup></script>

<template>
    <section class="grid" style="min-height: 100vh;">
        <LayoutHeaderGlass class="header"/>
        <!-- <LayoutSidebar/> -->
        <LayoutFooter />
        <!-- Slot для рендера контента страницы -->
        <slot />
    </section>
</template>

<style scoped>


/* .grid {
    display: grid;
    grid-template-columns: 1.5fr 6fr;
} */
</style>
