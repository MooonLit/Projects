<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Services
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Service By</h2>
        <div class="flex flex-col">
          <select
              class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="searchBy">
            <option value="name">Service Name</option>
            <option value="description">Service Description</option>
          </select>
        </div>
        <div class="flex flex-col" v-if="searchBy === 'name'">
          <label class="block">
            <input type="text"
                   class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                   v-model="name" @keyup.enter="handleSubmitForm" placeholder="Enter service name"/>
          </label>
        </div>
        <div class="flex flex-col" v-if="searchBy === 'description'">
          <label class="block">
            <input type="text"
                   class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                   v-model="description" @keyup.enter="handleSubmitForm" placeholder="Enter service description"/>
          </label>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="submit">
            Clear Search
          </button>
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">Search Service</button>
        </div>
      </div>
    </div>
    <hr class="mt-10 mb-10"/>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Services</h2>
        <h3 class="italic">Click table row to view service details</h3>
      </div>
      <div class="flex flex-col col-span-2">
        <table class="min-w-full shadow-md rounded">
          <thead class="bg-gray-50 text-xl">
          <tr>
            <th class="p-4 text-left" style="width: 25%;">Service Name</th>
            <th class="p-4 text-left" style="width: 75%;">Service Description</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
          <tr v-for="service in services" :key="service._id" @click="goToServiceDetails(service._id)"
              class="cursor-pointer">
            <td class="p-4 text-left">{{ service.name }}</td>
            <td class="p-4 text-left text-sm">{{ service.description }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script>
import {ref, onMounted} from 'vue'; // Importing reactive references and the onMounted lifecycle hook from Vue
import {useToast} from 'vue-toastification'; // Import toast notifications for user feedback
import {useRouter} from 'vue-router'; // Import router for navigation
import {getServices, searchServices} from '@/api/api'; // Import API functions for services

export default {
  setup() {
    const services = ref([]); // Reactive reference to store the list of services
    const searchBy = ref('name'); // Reactive reference to control the search criterion
    const name = ref(''); // Reactive reference for service name input
    const description = ref(''); // Reactive reference for service description input
    const toast = useToast(); // Initialize toast notifications
    const router = useRouter(); // Initialize router for programmatic navigation

    // Function to load initial service data when the component is mounted
    const loadData = async () => {
      try {
        services.value = await getServices(); // Fetch all services and store them
      } catch (error) {
        toast.error('Error loading services: ' + error.message); // Display error toast if the fetch fails
      }
    }

    // Function to handle the form submission for searching services
    const handleSubmitForm = async () => {
      try {
        // Construct the query based on the selected search criterion
        const query = searchBy.value === 'name' ? {searchBy: 'name', name: name.value} : {
          searchBy: 'description',
          description: description.value
        };
        const servicesData = await searchServices(query); // Perform the search
        services.value = servicesData; // Update the services list with the search results
      } catch (error) {
        // Extract and display error message appropriately
        const message = error.response?.data?.message || 'Failed to search services.';
        toast.error(message); // Display error toast with the error message
        console.error('API error:', error.response || error); // Log detailed error information
      }
    };

    // Function to navigate to service details page
    function goToServiceDetails(serviceId) {
      router.push({name: 'servicedetails', params: {id: serviceId}}); // Navigate using router with service ID
    }

    // Call loadData on component mount to fetch initial data
    onMounted(loadData);

    // Return all reactive references and methods to be used within the component
    return {
      services,
      searchBy,
      name,
      description,
      loadData,
      handleSubmitForm,
      goToServiceDetails
    }
  },
}

</script>

