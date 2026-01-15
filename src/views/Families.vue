<template>
  <el-card>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">Home Management</h2>
      <el-button type="primary" @click="openCreate">Add Family</el-button>
    </div>

    <el-table :data="families" v-loading="loading" style="margin-top:12px;">
      <el-table-column prop="familyId" label="familyId" width="120" />
      <el-table-column prop="name" label="Family Name" />
      <el-table-column label="Operation" width="160">
        <template #default="{ row }">
          <el-button size="small" @click="viewMembers(row.familyId)">Member</el-button>
        </template>
      </el-table-column>
    </el-table>

    
    <el-dialog v-model="dialogVisible" title="Add Family" width="420px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="familyId">
          <el-input v-model.number="form.familyId" placeholder="For example 1001" />
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" @click="submitFamily">Save</el-button>
      </template>
    </el-dialog>

    
    <el-dialog v-model="memberVisible" title="Family members" width="650px">
      <el-table :data="members" style="width:100%;">
        <el-table-column prop="userId" label="userId" width="90" />
        <el-table-column prop="name" label="Name" width="140" />
        <el-table-column prop="carName" label="Vehicle" width="140" />
        <el-table-column prop="tel" label="Telephone" width="150" />
        <el-table-column prop="state" label="Safety Status" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.state === 1" type="success">Enable</el-tag>
            <el-tag v-else type="danger">Disabled</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const families = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const form = reactive({ familyId: null, name: '' })

const memberVisible = ref(false)
const members = ref([])

async function loadFamilies() {
  try {
    loading.value = true
    const res = await request.get('/admin/families')
    families.value = res.data || []
  } catch (e) {
    ElMessage.error('Loading failed')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.familyId = null
  form.name = ''
  dialogVisible.value = true
}

async function submitFamily() {
  try {
    if (!form.familyId) {
      ElMessage.warning('familyId Required')
      return
    }
    await request.post('/admin/families', { familyId: form.familyId, name: form.name })
    ElMessage.success('Added successfully')
    dialogVisible.value = false
    await loadFamilies()
  } catch (e) {
    const msg = e.response?.data?.message || 'Addition failed'
    ElMessage.error(msg)
  }
}

async function viewMembers(familyId) {
  try {
    const res = await request.get(`/admin/families/${familyId}/members`)
    members.value = res.data || []
    memberVisible.value = true
  } catch (e) {
    ElMessage.error('Failed to get members')
  }
}

onMounted(loadFamilies)
</script>
