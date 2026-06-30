<template>
  <div class="h-screen flex flex-col bg-psf-cream-100 overflow-hidden">
    <AppHeader />
    <main class="flex-1 overflow-hidden flex flex-col">
      <slot />
    </main>
  </div>
</template>
