<script setup lang="ts">
import { cn } from '@/utils'
import { MenubarTrigger, type MenubarTriggerProps, useForwardProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<MenubarTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <MenubarTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'flex cursor-default  items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:.update data-[state=open]:text-accent-foreground',
        props.class,
      )
    " class="update"
  >
    <slot />
  </MenubarTrigger>
</template>


<style>
.update{
  font-weight: 400;
  border-radius: 25px !important;
  transition: .1s ;
}
.update:hover,
.update[data-state="open"] {
  cursor: pointer;
  background-color: red !important;
  background: rgba(37, 37, 37, 0) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(0px) !important;
  -webkit-backdrop-filter: blur(0px) !important;
  border-radius: 25px !important;
  color: #FFE31A !important;
  transition: .1s ;


}

/* .update:hover,
.update[data-state="open"] {
  cursor: pointer;
  background-color: red !important;
  color: #FFE31A !important;
} */

.update:focus{
  cursor: pointer;
  background-color: red !important;
  background: rgba(12, 12, 12, 0.203) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(0px) !important;
  -webkit-backdrop-filter: blur(0px) !important;
  border-radius: 25px !important;
  color: #FFE31A !important;
  transition: .1s ease-in-out;
}

</style>
