<template>
  <main class="py-10">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-red-700 mb-10 text-center">Find Client</h1>

      <div class="bg-white p-8 rounded-md shadow-md">
        <!-- Search Section -->
        <div class="flex flex-col md:flex-row md:items-end gap-6 mb-6">
          <div class="w-full">
            <label for="searchBy" class="block text-gray-700 text-sm font-bold mb-2">Search Service By</label>
            <select v-model="searchBy"
                    class="w-full rounded border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option value="name">Client Name</option>
              <option value="number">Client Number</option>
            </select>
          </div>

          <div class="w-full" v-if="searchBy === 'name'">
            <input type="text" v-model="firstName" @keyup.enter="handleSubmitForm" placeholder="Enter first name"
                   class="w-full rounded border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"/>
            <input type="text" v-model="lastName" @keyup.enter="handleSubmitForm" placeholder="Enter last name"
                   class="w-full rounded border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"/>
          </div>

          <div class="w-full" v-if="searchBy === 'number'">
            <input type="text" v-model="phoneNumber" @keyup.enter="handleSubmitForm"
                   placeholder="Enter Client Phone Number"
                   class="w-full rounded border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"/>
          </div>

          <div class="flex gap-4 mt-4 md:mt-0">
            <button @click="handleSubmitForm" class="bg-red-700 text-white rounded px-4 py-2">Search Client</button>
            <button @click="loadData" class="border border-red-700 bg-white text-red-700 rounded px-4 py-2">Clear
              Search
            </button>
          </div>
        </div>

        <!-- Clients Table -->
        <div class="mt-6">
          <div class="py-4 overflow-x-auto">
            <table class="min-w-full shadow rounded">
              <thead class="bg-gray-50 text-xl">
              <tr>
                <th class="p-4 text-left">Name</th>
                <th class="p-4 text-left">Phone number</th>
                <th class="p-4 text-left">City</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-gray-300">
              <tr v-for="client in clients" :key="client._id" @click="navigateToClientDetails(client._id)"
                  class="cursor-pointer">
                <td class="p-2 text-left">{{ client.firstName + ' ' + client.lastName }}</td>
                <td class="p-2 text-left">{{ client.phoneNumber.primary }}</td>
                <td class="p-2 text-left">{{ client.address.city }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import {ref, onMounted} from 'vue'; // Importing ref and onMounted utilities from Vue
import {getClients, getClientById, searchClients} from '@/api/api'; // Importing API functions for client operations
import {useToast} from 'vue-toastification'; // Import toast notifications library
import {useRouter} from 'vue-router'; // Import router for navigation

export default {
  setup() {
    const clients = ref([]); // A reactive reference for storing the list of clients
    const searchBy = ref('name'); // Reactive reference to control the search field (name or number)
    const firstName = ref(''); // Reactive reference for storing first name input
    const lastName = ref(''); // Reactive reference for storing last name input
    const phoneNumber = ref(''); // Reactive reference for storing phone number input
    const toast = useToast(); // Initialize toast notifications
    const router = useRouter(); // Initialize router for navigation

    onMounted(loadData); // Call loadData function when the component is mounted

    // Function to load initial client data
    async function loadData() {
      try {
        clients.value = await getClients(); // Fetch all clients and store them in the reactive reference
      } catch (error) {
        toast.error('Error loading clients: ' + error.message); // Display error toast if the fetch fails
      }
    }

    // Function to handle the form submission for searching clients
    async function handleSubmitForm() {
      try {
        let query = {}; // Initialize the query object
        if (searchBy.value === 'name') { // Check if the search is by name
          query = {
            searchBy: 'name',
            firstName: firstName.value,
            lastName: lastName.value
          };
        } else if (searchBy.value === 'number') { // Check if the search is by phone number
          query = {
            searchBy: 'number',
            phoneNumber: phoneNumber.value
          };
        }
        const response = await searchClients(query); // Perform the search with the query
        clients.value = response; // Store the result in the reactive reference
      } catch (error) {
        if (error.response && error.response.data) {
          toast.error('Error searching clients: ' + error.response.data); // Display error toast with server response
        } else {
          toast.error('Error searching clients. Please try again.'); // Display a generic error toast
        }
        console.error('Error details:', error); // Log error details to console
      }
    }

    // Function to navigate to client details
    function navigateToClientDetails(clientId) {
      router.push({name: 'clientdetails', params: {id: clientId}}); // Use router to navigate to client details page
    }

    // Return the reactive references and functions for use in the component template
    return {clients, searchBy, firstName, lastName, phoneNumber, loadData, handleSubmitForm, navigateToClientDetails};
  }
}
</script>
