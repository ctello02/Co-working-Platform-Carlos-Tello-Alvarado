import './assets/base.css'
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App);

app.use(router);
app.use(vuetify);
app.use(Toast, {
    position: POSITION.TOP_RIGHT,
    containerClassName: 'custom-toast-container',
    timeout: 2500,
    closeOnClick: true,
    pauseOnHover: true,
    transition: "Vue-Toastification__fade",
});
app.use(pinia);

app.mount('#app');
