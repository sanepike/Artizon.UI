<template>
  <div class="app-layout">
    <AppHeader />
    <v-main class="main-content">
      <router-view />
    </v-main>
  </div>
</template>

<script lang="ts" setup>
  import AppHeader from '../components/AppHeader.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 0;
}
</style>
