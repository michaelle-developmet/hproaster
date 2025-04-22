<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <tr :class="cn('border-b transition-colors  data-[state=selected]:bg-muted', props.class)" class="table_row_update">
    <slot />
  </tr>
</template>



<style>
.table_row_update{
  margin-top: 100px;
  border-radius: 15px !important;
}
  .table_row_update:hover{
    background: rgba(37, 37, 37, 0) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(0px) !important;
  -webkit-backdrop-filter: blur(0px) !important;
  border-radius: 15px !important;

  }
</style>