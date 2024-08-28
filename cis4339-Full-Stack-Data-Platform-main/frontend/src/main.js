import {createApp, markRaw} from "vue";
import router from "./router";
import App from "./App.vue";
import "./index.css";
import Toast from "vue-toastification";
// Import the CSS or use your own!

import "vue-toastification/dist/index.css";
//state management library
import {createPinia} from 'pinia'
import {useLoggedInUserStore} from "@/store/loggedInUser";

const app = createApp(App);


//create a pinia root store
const pinia = createPinia();
//pinia should be able to use router - has to be setup as plugin
pinia.use(({store}) => {
    store.$router = markRaw(router)
});

//add pinia object to our instance
app.use(pinia)
app.use(router);

const options = {
    position: 'bottom-right'
};
app.use(Toast, options);

const loggedInUserStore = useLoggedInUserStore();
loggedInUserStore.$subscribe((mutation, state) => {
    if (state.isLoggedIn) {
        // Whenever the user's logged-in state changes and is logged in, ensure auth headers are set
        setAuthHeader(state.token);  // Ensure this method is available to set the auth header
    }
});

// Ensure user is initialized on app start
loggedInUserStore.initializeUserFromToken();
app.mount("#app");