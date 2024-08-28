<!--Code-->

<template>
  <div>
    <!--Header-->
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Welcome</h1>
    <!--Form-->
    <form @submit.prevent="login" novalidate="true">
      <div class="flex justify-center mt-10">
        <label>
          <span class="text-gray-700">Username</span>
          <span style="color: #ff0000">*</span>
          <input type="text"
                 class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                 placeholder v-model="username"/>
        </label>
      </div>
      <div class="flex justify-center mt-10">
        <label>
          <span class="text-gray-700">Password</span>
          <span style="color: #ff0000">*</span>
          <input type="password"
                 class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                 placeholder v-model="password"/>
        </label>
      </div>
      <!--Login button-->
      <div class="flex justify-center mt-10">
        <button class="bg-red-700 text-white rounded" type="submit">Login</button>
      </div>
    </form>
  </div>
</template>

<script>
import {ref} from 'vue';
import {useLoggedInUserStore} from "@/store/loggedInUser";
import {useRouter} from 'vue-router'; // Importing Vue Router to programatically navigate after login

export default {
  setup() {
    const username = ref("");
    const password = ref("");
    const store = useLoggedInUserStore();
    const router = useRouter(); // Router instance to control navigation

    const login = async () => {
      try {
        await store.login(username.value, password.value);
      } catch (error) {
        console.error(error);
      }
    };

    return {
      username,
      password,
      login
    }
  }
}
</script>