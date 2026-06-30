<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { init: initLang } = useLang()
onMounted(() => initLang())
</script>
