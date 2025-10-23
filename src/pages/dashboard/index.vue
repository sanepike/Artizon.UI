<template>
  <div class="dashboard-container">
    <VendorDashboard v-if="isVendor" />
    <CustomerDashboard v-else />
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue'
  import { useAuthStore } from '../../stores/auth'
  import CustomerDashboard from './CustomerDashboard.vue'
  import VendorDashboard from './VendorDashboard.vue'

  export default defineComponent({
    name: 'DashboardPage',
    components: {
      VendorDashboard,
      CustomerDashboard,
    },
    setup () {
      const auth = useAuthStore()
      const isVendor = computed(() => auth.isVendor)

      return {
        isVendor,
      }
    },
  })
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
