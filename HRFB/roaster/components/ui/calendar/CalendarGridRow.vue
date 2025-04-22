<script lang="ts" setup>
import { cn } from '@/utils'
import { CalendarGridRow, type CalendarGridRowProps, useForwardProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<CalendarGridRowProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarGridRow :class="cn('flex', props.class)" v-bind="forwardedProps" class="head">
    <slot />
  </CalendarGridRow>
</template>


<style scoped>
.head{
  width: 90vw;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>