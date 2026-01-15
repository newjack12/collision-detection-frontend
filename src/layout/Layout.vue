<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" style="border-right: 1px solid #eee;">
      <div style="padding: 16px; font-weight: bold;">Collision Admin</div>
      <el-menu :default-active="active" @select="onSelect" router>
        <el-menu-item index="/dashboard">Home</el-menu-item>
        <el-menu-item index="/users">User Management</el-menu-item>
        <el-menu-item index="/families">Home Management</el-menu-item>
        <el-menu-item index="/sensor">Collision data</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #eee;">
        <div>Welcome:{{ auth.username }}</div>
        <el-button type="danger" size="small" @click="logout">Exit</el-button>
      </el-header>

      <el-main style="background:#fafafa;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const active = computed(() => route.path)

function onSelect(path) {
  router.push(path)
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>
