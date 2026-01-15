<template>
  <el-card>
    <h2 style="margin:0 0 12px 0;">Collision Data (Line Chart + Table)</h2>

   
    <el-form :inline="true" style="margin-bottom: 10px;">
      <el-form-item label="userId">
        <el-input v-model.number="query.userId" style="width:120px;" placeholder="Optional" />
      </el-form-item>
      <el-form-item label="familyId">
        <el-input v-model.number="query.familyId" style="width:120px;" placeholder="Optional" />
      </el-form-item>

      <el-form-item label="Time range">
        <el-date-picker
          v-model="query.timeRange"
          type="datetimerange"
          range-separator="to"
          start-placeholder="Start Time"
          end-placeholder="End Time"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>

      <el-form-item label="Sort">
        <el-select v-model="query.order" style="width:110px;">
          <el-option label="Newest first" value="desc" />
          <el-option label="First and foremost" value="asc" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">Query</el-button>
        <el-button @click="reset">Reset</el-button>
      </el-form-item>
    </el-form>

   
    <div style="margin: 6px 0 12px 0;">
      <span style="margin-right:8px; color:#666;">Line Chart Metrics:</span>
      <el-checkbox-group v-model="selectedMetrics" @change="updateChart">
        <el-checkbox label="ax">ax</el-checkbox>
        <el-checkbox label="ay">ay</el-checkbox>
        <el-checkbox label="az">az</el-checkbox>
        <el-checkbox label="aMag">|a|</el-checkbox>
        <el-checkbox label="pressureValue">pressure</el-checkbox>
      </el-checkbox-group>
    </div>

   
    <div ref="chartRef" style="width: 100%; height: 360px; background: #fff; border:1px solid #eee;"></div>

    <el-table :data="list" v-loading="loading" style="margin-top:12px;">
      <el-table-column prop="id" label="id" width="80" />
      <el-table-column prop="userId" label="userId" width="90" />
      <el-table-column prop="sensorType" label="sensor" width="120" />
      <el-table-column prop="ax" label="ax" width="90" />
      <el-table-column prop="ay" label="ay" width="90" />
      <el-table-column prop="az" label="az" width="90" />
      <el-table-column prop="pressureValue" label="pressure" width="110" />
      <el-table-column prop="createdAt" label="Time" min-width="170" />
    </el-table>

    <div style="margin-top: 12px; display:flex; justify-content:flex-end;">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="changePage"
        @size-change="changeSize"
      />
    </div>
  </el-card>
</template>

<script setup>
import { onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import request from '../utils/request'

const query = reactive({
  userId: null,
  familyId: null,
  timeRange: null, //  ['yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss']
  order: 'desc'
})

const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const list = ref([])
const loading = ref(false)

const selectedMetrics = ref(['aMag', 'pressureValue'])

const chartRef = ref(null)
let chart = null

function buildParams() {
  const params = {
    page: page.value,
    size: pageSize.value,
    order: query.order
  }
  if (query.userId) params.userId = query.userId
  if (query.familyId) params.familyId = query.familyId
  if (query.timeRange && query.timeRange.length === 2) {
    params.startTime = query.timeRange[0]
    params.endTime = query.timeRange[1]
  }
  return params
}

async function loadData() {
  try {
    loading.value = true
    const res = await request.get('/admin/sensor-data', { params: buildParams() })
    total.value = res.data.total || 0
    list.value = res.data.list || []
    updateChart()
  } catch (e) {
    ElMessage.error('Query failed')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  loadData()
}

function reset() {
  query.userId = null
  query.familyId = null
  query.timeRange = null
  query.order = 'desc'
  page.value = 1
  pageSize.value = 20
  loadData()
}

function changePage(p) {
  page.value = p
  loadData()
}

function changeSize(s) {
  pageSize.value = s
  page.value = 1
  loadData()
}

function updateChart() {
  if (!chart) return

 
  let data = [...list.value]
  data.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))

  const times = data.map(item => item.createdAt)
  const axArr = data.map(item => item.ax ?? 0)
  const ayArr = data.map(item => item.ay ?? 0)
  const azArr = data.map(item => item.az ?? 0)
  const pressureArr = data.map(item => item.pressureValue ?? 0)

  const aMagArr = data.map((item) => {
    const ax = item.ax ?? 0
    const ay = item.ay ?? 0
    const az = item.az ?? 0
    return Math.sqrt(ax*ax + ay*ay + az*az)
  })

  const series = []
  const legends = []

  const m = selectedMetrics.value
  if (m.includes('ax')) { legends.push('ax'); series.push({ name:'ax', type:'line', data: axArr, smooth:true }) }
  if (m.includes('ay')) { legends.push('ay'); series.push({ name:'ay', type:'line', data: ayArr, smooth:true }) }
  if (m.includes('az')) { legends.push('az'); series.push({ name:'az', type:'line', data: azArr, smooth:true }) }
  if (m.includes('aMag')) { legends.push('|a|'); series.push({ name:'|a|', type:'line', data: aMagArr, smooth:true }) }
  if (m.includes('pressureValue')) { legends.push('pressure'); series.push({ name:'pressure', type:'line', data: pressureArr, smooth:true }) }

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: legends },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: times, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series
  }

  chart.setOption(option, true)
}

function handleResize() {
  chart && chart.resize()
}

onMounted(() => {
  chart = echarts.init(chartRef.value)
  window.addEventListener('resize', handleResize)
  loadData()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>
