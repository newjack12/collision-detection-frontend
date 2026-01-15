<template>
  <div style="height:100vh; display:flex; align-items:center; justify-content:center; background:#f5f5f5;">
    <el-card style="width: 360px;">
      <template #header>
        <div style="font-weight:bold;">Administrator Login</div>
      </template>

      <el-form :model="form" label-width="80px">
        <el-form-item label="Account">
          <el-input v-model="form.username" placeholder="admin" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="form.password" type="password" show-password placeholder="admin123" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" style="width:100%;" @click="doLogin">Login</el-button>
        </el-form-item>

        <div style="color:#999; font-size:12px;">
          Default account：admin / admin123（Backend automatically creates on startup）
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '../utils/request'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: 'admin123'
})

async function doLogin() {
  try {
    loading.value = true
    const res = await request.post('/login', form)
    //  {token, username}
    auth.setLogin(res.data.token, res.data.username)
    ElMessage.success('Login successful')
    router.push('/dashboard')
  } catch (e) {
    const msg = e.response?.data?.message || 'Login failed'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>
