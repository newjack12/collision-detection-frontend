import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

import Login from '../views/Login.vue'
import Layout from '../layout/Layout.vue'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import Families from '../views/Families.vue'
import SensorData from '../views/SensorData.vue'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: Users },
      { path: 'families', component: Families },
      { path: 'sensor', component: SensorData }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
