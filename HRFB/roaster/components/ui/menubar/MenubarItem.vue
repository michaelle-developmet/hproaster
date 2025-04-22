<script setup lang="ts">
import { cn } from '@/utils'
import {
  MenubarItem,
  type MenubarItemEmits,
  type MenubarItemProps,
  useForwardPropsEmits,
} from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<MenubarItemProps & { class?: HTMLAttributes['class'], inset?: boolean }>()

const emits = defineEmits<MenubarItemEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <MenubarItem
    v-bind="forwarded"
    style="cursor: pointer;"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus: focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      props.class,
    )" class="item_update"
  >
    <slot />
  </MenubarItem>
</template>


<style>
.item_update{
  /* background: rgba(12, 12, 12, 0.203) !important; */
  /* box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(0px) !important;
  -webkit-backdrop-filter: blur(0px) !important; */
  color: #FFE31A !important;
  border: none;
  border-radius: 15px;

}

.item_update:hover,
.item_update[data-state="open"] {
  cursor: pointer;
  background: rgba(37, 37, 37, 0) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(0px) !important;
  -webkit-backdrop-filter: blur(0px) !important;
  border-radius: 25px !important;
  color: #FFE31A !important;
  transition: .1s ;
}
</style>