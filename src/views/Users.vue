<template>
  <el-card>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">User Management</h2>
      <el-button type="primary" @click="openCreate">Add User</el-button>
    </div>

    <el-table :data="users" v-loading="loading" style="margin-top:12px;">
      <el-table-column prop="userId" label="userId" width="80" />
      <el-table-column prop="username" label="Account" width="140" />
      <el-table-column prop="name" label="Name" width="120" />
      <el-table-column prop="tel" label="Telephone" width="140" />
      <el-table-column prop="carName" label="Vehicle" width="140" />
      <el-table-column prop="email" label="Email" min-width="180" />
      <el-table-column prop="familyId" label="familyId" width="110" />

      <el-table-column label="Status" width="120">
        <template #default="{ row }">
          <el-switch
            v-model="row.state"
            :active-value="1"
            :inactive-value="0"
            @change="(v) => changeState(row.userId, v)"
          />
        </template>
      </el-table-column>

      <el-table-column label="Operation" width="220">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">Edit</el-button>
          <el-button size="small" type="warning" @click="openResetPwd(row)">Change Password</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit User' : 'Add User'" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="Account" v-if="!isEdit">
          <el-input v-model="form.username" placeholder="username" />
        </el-form-item>
        <el-form-item label="Password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password placeholder="password" />
        </el-form-item>

        <el-form-item label="Name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Vehicle">
          <el-input v-model="form.carName" />
        </el-form-item>
        <el-form-item label="Telephone">
          <el-input v-model="form.tel" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="familyId">
          <el-input v-model.number="form.familyId" placeholder="For example 1001" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitUser">Save</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="pwdVisible" title="Change Password" width="420px">
      <el-form label-width="80px">
        <el-form-item label="userId">
          <el-input v-model="pwdUserId" disabled />
        </el-form-item>
        <el-form-item label="New Password">
          <el-input v-model="newPwd" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitPwd">Confirm</el-button>
      </template>
    </el-dialog>

  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const users = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const editUserId = ref(null)

const form = reactive({
  username: '',
  password: '',
  name: '',
  carName: '',
  tel: '',
  email: '',
  familyId: null
})

const pwdVisible = ref(false)
const pwdUserId = ref(null)
const newPwd = ref('')

function resetForm() {
  form.username = ''
  form.password = ''
  form.name = ''
  form.carName = ''
  form.tel = ''
  form.email = ''
  form.familyId = null
}

async function loadUsers() {
  try {
    loading.value = true
    const res = await request.get('/admin/users')
    const arr = res.data || []
    users.value = arr.map(u => ({ ...u, state: (u.state === null || u.state === undefined) ? 1 : u.state }))
  } catch (e) {
    ElMessage.error('Loading failed')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEdit.value = false
  editUserId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editUserId.value = row.userId
  resetForm()
  form.name = row.name || ''
  form.carName = row.carName || ''
  form.tel = row.tel || ''
  form.email = row.email || ''
  form.familyId = row.familyId ?? null
  dialogVisible.value = true
}

async function submitUser() {
  try {
    if (!isEdit.value) {
      if (!form.username || !form.password) {
        ElMessage.warning('Username and password are required')
        return
      }
      await request.post('/admin/users', {
        username: form.username,
        password: form.password,
        name: form.name,
        carName: form.carName,
        tel: form.tel,
        email: form.email,
        familyId: form.familyId
      })
      ElMessage.success('Added successfully')
    } else {
      await request.put(`/admin/users/${editUserId.value}`, {
        name: form.name,
        carName: form.carName,
        tel: form.tel,
        email: form.email,
        familyId: form.familyId
      })
      ElMessage.success('Saved successfully')
    }
    dialogVisible.value = false
    await loadUsers()
  } catch (e) {
    const msg = e.response?.data?.message || 'Operation failed'
    ElMessage.error(msg)
  }
}

async function changeState(userId, state) {
  try {
    await request.put(`/admin/users/${userId}/state`, { state })
    ElMessage.success('Status has been updated')
  } catch (e) {
    ElMessage.error('Update failed')
  }
}

function openResetPwd(row) {
  pwdUserId.value = row.userId
  newPwd.value = ''
  pwdVisible.value = true
}

async function submitPwd() {
  try {
    if (!newPwd.value) {
      ElMessage.warning('Please enter a new password')
      return
    }
    await request.put(`/admin/users/${pwdUserId.value}/password`, { password: newPwd.value })
    ElMessage.success('Password has been updated')
    pwdVisible.value = false
  } catch (e) {
    const msg = e.response?.data?.message || 'Modification failed'
    ElMessage.error(msg)
  }
}

onMounted(loadUsers)
</script>
