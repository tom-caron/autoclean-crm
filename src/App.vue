<template>
  <template v-if="$route.name === 'login'">
    <router-view />
  </template>

  <AdminLayout v-else>
    <router-view />
  </AdminLayout>
</template>

<script setup>
import AdminLayout from './components/AdminLayout.vue'
</script>