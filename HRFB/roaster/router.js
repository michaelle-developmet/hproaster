import DefaultLayout from './layouts/default.vue';

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('./pages/Home.vue')
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('./pages/login.vue'),
        meta: { hideHeader: true }
      },
      {
        path: 'registration',
        name: 'Registration',
        component: () => import('./pages/registration.vue'),
        meta: { hideHeader: true }
      },
    ]
  }
];
