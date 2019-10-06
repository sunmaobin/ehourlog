import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import axios from 'axios'
import VueAxios from 'vue-axios'

import 'normalize.css'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import LogList from './LogList.vue'
import LogCreate from './LogCreate.vue'
import Login from './Login.vue'

Vue.use(ElementUI)
Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(VueAxios, axios)

//携带cookie
axios.defaults.withCredentials = true

const store = new Vuex.Store({
    state : {
        token : localStorage.getItem('token')
    },
    mutations : {
        setToken(state,token){
            state.token = token;
            localStorage.setItem('token',token);
        }
    },
    getters : {
        getToken : (state) => () => {
            console.log('getters state=',JSON.parse(state.token));
            if(state.token){
                return JSON.parse(state.token).userToken;
            };
            return '';
        }
    }
});

const routes = [
    { path: '*', component: LogList },
    { path: '/create', component: LogCreate },
    { name :'login', path: '/login', component: Login }
];

const router = new VueRouter({
    //mode: 'history',
    routes
});

router.beforeEach((to, from, next) => {
    console.log('to=',to);
    console.log('token=',localStorage.getItem('token'));
    if(!localStorage.getItem('token') && to.name !== 'login') {
        next({
            name: 'login',
            query : {
                callback : to.path
            }
        });
        return;
    };
    next();
});

const app = new Vue({
    store,
    router
}).$mount('#app');
