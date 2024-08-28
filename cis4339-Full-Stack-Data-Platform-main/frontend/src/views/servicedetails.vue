<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Service Details</h1>
    <div class="px-10 py-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Edit Service Details</h2>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Service Name:</span>
            <input type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" v-model="service.name" />
          </label>
        </div>
        <div class="flex flex-col">
          <label>
            <span class="text-gray-700">Description:</span>
            <textarea class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" v-model="service.description"></textarea>
          </label>
        </div>
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Status:</span>
            <select v-model="service.status" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
        <div class="flex justify-between mt-10">
          <button class="bg-green-700 text-white rounded" @click="submitServiceUpdate" v-if="store.role !== 'viewer'">Update Service</button>
          <button class="bg-red-700 text-white rounded" @click="submitDeleteService" v-if="store.role !== 'viewer'">Delete Service</button>
          <!--          <button class="border border-red-700 bg-white text-red-700 rounded" @click="$router.back()">Go Back</button>-->
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <!--List of Events table-->
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>
      <div class="flex flex-col col-span-2">
        <table class="min-w-full shadow-md rounded">
          <thead class="bg-gray-50 text-xl">
          <tr>
            <th class="p-4 text-left">Event Name</th>
            <th class="p-4 text-left">Event Date</th>
            <th class="p-4 text-left">Event Address</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
          <tr @click="navigateToEventDetails(event._id)" v-for="event in events" :key="event._id" class="cursor-pointer"
              :class="{ 'hoverRow': hoverId === event._id }" @mouseenter="hoverId = event._id"
              @mouseleave="hoverId = null">
            <td class="p-2 text-left">{{ event.name }}</td>
            <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
            <td class="p-2 text-left">{{ event.address.line1 }}</td>
          </tr>

          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue'; // Import ref for creating reactive references and onMounted for lifecycle hook
import { useRouter, useRoute } from 'vue-router'; // Import useRouter and useRoute for routing capabilities
import {getServiceById, updateService, deleteService, getEventsByServiceId} from '@/api/api'; // Import API functions for service operations
import { useToast } from 'vue-toastification'; // Import useToast for displaying notifications
import router from "@/router"; // Import router instance
import {useLoggedInUserStore} from "@/store/loggedInUser"; // Import Vuex store for logged in user data

export default {
  methods: {
    router() { // Method to expose the router instance
      return router;
    }
  },
  setup() {
    const route = useRoute(); // Hook to access the current route
    const router = useRouter(); // Hook to access Vue router for navigation
    const store = useLoggedInUserStore(); // Access Vuex store instance for user data
    const service = ref({ name: '', description: '', status: '' }); // Reactive reference for storing service details
    const toast = useToast(); // Initialize toast notifications
    const events = ref([]); // Reactive reference to store events associated with the service
    const hoverId = ref(null); // Reactive reference to track hover state (not used in current logic)

    // Async function to fetch service details and associated events
    const fetchServiceDetails = async () => {
      try {
        const response = await getServiceById(route.params.id); // API call to fetch service details by ID
        service.value = response; // Set fetched service details

        const response2 = await getEventsByServiceId(route.params.id); // API call to fetch events associated with the service
        events.value = response2; // Set fetched events
      } catch (error) {
        toast.error('Error fetching service details: ' + error.message); // Display error toast
      }
    }

    // Function to navigate to event details page
    const navigateToEventDetails = (eventId) => {
      router.push({name: 'eventdetails', params: {id: eventId}}); // Use router to navigate
    };

    // Function to format dates to MM/DD/YYYY format
    function formatDate(date) {
      const isoDate = new Date(date);
      const year = isoDate.getUTCFullYear();
      const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(isoDate.getUTCDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    }

    // Async function to submit service updates
    const submitServiceUpdate = async () => {
      try {
        const serviceToUpdate = { // Prepare updated service data
          ...service.value,
          status: service.value.status.toLowerCase(), // Ensure the status is in lowercase
        };

        const response = await updateService(route.params.id, serviceToUpdate); // API call to update the service
        toast.success('Service updated successfully'); // Display success toast
      } catch (error) {
        console.error('Error during service update:', error); // Log error details
        toast.error('Error updating service: ' + (error.response?.data?.message || error.message)); // Display error toast
      }
    };

    // Async function to delete a service
    const submitDeleteService = async () => {
      try {
        await deleteService(route.params.id); // API call to delete the service
        toast.success('Service deleted successfully'); // Display success toast
        await router.push('/findservice'); // Navigate to the service listing page
      } catch (error) {
        console.error('Error during service deletion:', error); // Log error details
        toast.error('Error deleting service: ' + (error.response?.data?.message || error.message)); // Display error toast
      }
    };

    onMounted(fetchServiceDetails); // Call fetchServiceDetails when component is mounted

    // Return reactive data and methods to be used in the component template
    return {
      service,
      store,
      submitServiceUpdate,
      submitDeleteService,
      hoverId,
      events,
      formatDate,
      navigateToEventDetails,
    };
  },
}
</script>
