<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Create New Event
      </h1>
    </div>
    <div class="px-10 py-20">
      <form @submit.prevent="handleSubmitForm">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Event Details</h2>

          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Event Name</span>
              <span style="color: #ff0000">*</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     v-model="event.name"/>
            </label>
          </div>

          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Date</span>
              <span style="color: #ff0000">*</span>
              <input
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  v-model="event.date" type="date"/>
            </label>
          </div>

          <div></div>
          <div></div>
          <div class="flex col-span-2 flex-col">
            <label class="block">
              <span class="text-gray-700">Description</span>
              <textarea
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  rows="2"
                  v-model="event.description"></textarea>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-10">
          <h2 class="text-2xl font-bold">Services Offered at Event</h2>
          <div class="flex flex-col col-span-3">
            <ul v-if="activeServices.length" class="space-y-2">
              <li v-for="service in activeServices" :key="service._id">
                <label class="block p-2">
                  <input type="checkbox" :id="service._id" :value="service._id"
                         v-model="event.services"
                         class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 mr-2">
                  {{ service.name }}
                </label>
              </li>
            </ul>
            <p v-else class="text-gray-600">No Active Services Available</p>
          </div>
        </div>

        <!-- grid container -->
        <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Address</h2>
          <!-- Address 1 input field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Address Line 1</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     placeholder v-model="event.address.line1"/>
            </label>
          </div>
          <!-- Address 2 input field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Address Line 2</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     placeholder v-model="event.address.line2"/>
            </label>
          </div>
          <!-- City input field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">City</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     placeholder v-model="event.address.city"/>
            </label>
          </div>
          <div></div>
          <!-- County input field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">County</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     placeholder v-model="event.address.county"/>
            </label>
          </div>
          <!-- Zip code field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Zip Code</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     placeholder v-model="event.address.zip"/>
            </label>
          </div>
        </div>

        <!--Add New Event submit button-->
        <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div></div>
          <div class="flex justify-between mr-20">
            <button class="bg-red-700 text-white rounded" type="submit">
              Add New Event
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script>
import {reactive, ref, computed, onMounted} from 'vue'; // Importing reactive utilities from Vue
import jwtDecode from 'jwt-decode'; // Import jwt-decode for decoding JWT tokens (not used in this script directly)
import {getServices, createEvent} from '@/api/api'; // Import API functions for services and event creation
import {useToast} from 'vue-toastification'; // Import toast notifications library
import router from "@/router"; // Import router for navigation
import {useLoggedInUserStore} from '@/store/loggedInUser'; // Import Vuex store for logged in user information

export default {
  setup() {
    const toast = useToast(); // Initialize toast notifications
    const loggedInUserStore = useLoggedInUserStore(); // Access the logged in user's store
    // Define the event object with reactive properties
    const event = reactive({
      org: loggedInUserStore.orgId, // Use orgId from the loggedInUser store
      name: '',
      description: '',
      date: '',
      services: [],
      address: {
        line1: '',
        line2: '',
        city: '',
        county: '',
        zip: ''
      },
    });

    const services = ref([]); // Define a ref to hold the services array

    // Computed property to filter active services from the list
    const activeServices = computed(() => {
      return services.value.filter(service => service.status.toLowerCase() === 'active');
    });

    // Function to run when the component is mounted
    onMounted(async () => {
      await loggedInUserStore.initializeUserFromToken(); // Initialize user data from token
      console.log('Org ID from store:', loggedInUserStore.orgId); // Debug: Log the organization ID

      try {
        const response = await getServices(); // Fetch services from the API
        services.value = response; // Set the services data
        console.log('Services fetched:', services.value); // Debug: Log fetched services
      } catch (error) {
        toast.error('Failed to fetch services: ' + error.message || "Unknown error"); // Show error toast if fetching fails
        console.error('Error fetching services:', error); // Log error details
      }
    });

    // Handler for submitting the form
    const handleSubmitForm = async () => {
      console.log('Selected services:', event.services); // Debug: Log selected services
      console.log('Submitting event data:', event); // Debug: Log event data being submitted

      if (!event.org) {
        toast.error('Organization ID is missing. Please log in again.'); // Show error toast if org ID is missing
        return;
      }

      try {
        const response = await createEvent(event); // Call API to create the event
        console.log('Event creation response:', response); // Debug: Log the response from the event creation
        toast.success("Event added successfully!"); // Show success toast
        await router.push("/"); // Navigate to the homepage
      } catch (error) {
        console.error("Error creating event:", error); // Log error details
        toast.error("Error creating event: " + (error.response?.data?.message || error.message || "Unknown error")); // Show error toast
        console.log('Error response data:', error.response?.data); // Debug: Log error response data
      }
    };

    // Return data and methods to be used in the component template
    return {
      event,
      activeServices,
      handleSubmitForm,
    };
  },
};
</script>
