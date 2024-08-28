<!-- This is the main frontend file. It displxays a navigation bar and rendered components. -->
<!--code-->
<template>
  <main class="flex flex-row">
    <div id="_container" class="min-h-screen">
      <header class="w-full">
        <section class="text-center">
          <img class="m-auto" src="@/assets/DanPersona.svg"/>
          <br>
          <div v-if="isLoggedIn">
            <h1>Welcome {{ username }} !</h1>
          </div>
          <div v-if="isLoggedIn">
            <p>Role: {{ role }}</p>
          </div>
        </section>
        <!--Navigation bar-->
        <nav class="mt-10">
          <ul class="flex flex-col gap-4">
            <!-- Dashboard link -->
            <li>
              <router-link to="/">
                <span class="material-icons" style="position: relative; top: 6px">dashboard</span>
                Dashboard
              </router-link>
            </li>
            <li v-if="!isLoggedIn">
              <router-link to="/login">
                <span class="material-icons" style="position: relative; top: 6px">login</span>
                Login
              </router-link>
            </li>
            <!--Logout link - Link only shows if user is logged in-->
            <li v-if="isLoggedIn" @click.prevent="logout" style="cursor: pointer">
              <span class="material-icons" style="position: relative; top: 6px">logout</span>
              Logout
            </li>

            <template v-if="role === 'editor' ?? isLoggedIn">
              <li>
                <router-link to="/clientform">
                  <span class="material-icons" style="position: relative; top: 6px">person_add</span>
                  Client Form
                </router-link>
              </li>
              <li>
                <router-link to="/eventform">
                  <span class="material-icons" style="position: relative; top: 6px">event</span>
                  Event Form
                </router-link>
              </li>
              <li>
                <router-link to="/serviceform">
                  <span class="material-icons" style="position: relative; top: 6px">build</span>
                  Service Form
                </router-link>
              </li>
            </template>


            <template v-if="isLoggedIn ?? isLoggedIn">
              <li>
                <router-link to="/findclient">
                  <span class="material-icons" style="position: relative; top: 6px">search</span>
                  Find Client
                </router-link>
              </li>
              <li>
                <router-link to="/findevents">
                  <span class="material-icons" style="position: relative; top: 6px">search</span>
                  Find Events
                </router-link>
              </li>
              <li>
                <router-link to="/findservice">
                  <span class="material-icons" style="position: relative; top: 6px">search</span>
                  Find Service
                </router-link>
              </li>
            </template>
          </ul>
        </nav>
      </header>
    </div>
    <div class="grow w-4/5">
      <section class="justify-end items-center h-24 flex"
               style="background: linear-gradient(250deg, #c8102e 70%, #efecec 50.6%)">
        <h1 class="mr-20 text-3xl text-white">{{ orgName }}</h1>
      </section>
      <div>
        <router-view></router-view>
      </div>
    </div>
  </main>
</template>


<script>
import {useLoggedInUserStore} from "./store/loggedInUser";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia";

//Notifications
const toast = useToast();

export default {
  setup() {
    const userStore = useLoggedInUserStore();
    const {isLoggedIn, role, orgName, username} = storeToRefs(userStore);

    // Method to handle logout - could also be moved here if needed
    const logout = async () => {
      await userStore.logout();
    };

    return {isLoggedIn, role, orgName, username, logout};
  }
};
</script>


<style scoped>
#_container {
  background-color: #c8102e;
  color: white;
  padding: 18px;
}
</style>
