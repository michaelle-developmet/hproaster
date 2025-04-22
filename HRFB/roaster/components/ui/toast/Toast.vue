<script setup lang="ts">
import { cn } from '@/utils'
import { ToastRoot, type ToastRootEmits, useForwardPropsEmits } from 'radix-vue'
import { computed } from 'vue'
import { type ToastProps, toastVariants } from '.'

const props = defineProps<ToastProps>()

const emits = defineEmits<ToastRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const onOpenChange = (open: boolean) => {
  if (open) {
    console.log('Тост сработал!');
  }
}
</script>

<template>
  <ToastRoot
    v-bind="forwarded"
    :class="cn(toastVariants({ variant }), props.class, 'toast-z-index')"
    @update:open="onOpenChange"
  >
    <slot />
  </ToastRoot>
</template>

<style scoped>
.toast-z-index {
  z-index: 9999; /* Устанавливаем высокий z-index для тоста */
}
</style>
