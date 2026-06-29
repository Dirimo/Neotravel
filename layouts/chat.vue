<template>
  <div class="h-screen flex flex-col bg-white overflow-hidden">
    <AppHeader />
    <main class="flex-1 pt-16 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
