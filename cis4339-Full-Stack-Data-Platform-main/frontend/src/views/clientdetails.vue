<template>
  <main>
    <!--Header-->
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
      Client Details
    </h1>

    <div class="px-10 py-20">
      <div class="max-w-6xl mx-auto">
        <form @submit.prevent="submitUpdateClient" class="bg-white p-8 rounded shadow w-full">
          <h2 class="text-2xl font-semibold mb-8">Client Information</h2>

          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-4">Personal Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-medium mb-1">First Name*</label>
                <input type="text" id="firstName" v-model="client.firstName" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
              <div>
                <label for="middleName" class="block text-sm font-medium mb-1">Middle Name</label>
                <input type="text" id="middleName" v-model="client.middleName"
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium mb-1">Last Name*</label>
                <input type="text" id="lastName" v-model="client.lastName" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label for="email" class="block text-sm font-medium mb-1">Email*</label>
              <input type="email" id="email" v-model="client.email" required
                     class="w-full border-gray-300 rounded shadow-sm">
            </div>
            <div>
              <label for="primaryPhone" class="block text-sm font-medium mb-1">Phone Number*</label>
              <input type="tel" id="primaryPhone" v-model="client.phoneNumber.primary" required
                     class="w-full border-gray-300 rounded shadow-sm">
            </div>
          </div>

          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-4">Address Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label for="addressLine1" class="block text-sm font-medium mb-1">Address Line 1</label>
                <input type="text" id="addressLine1" v-model="client.address.line1" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
              <div>
                <label for="addressLine2" class="block text-sm font-medium mb-1">Address Line 2</label>
                <input type="text" id="addressLine2" v-model="client.address.line2"
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
              <div>
                <label for="city" class="block text-sm font-medium mb-1">City</label>
                <input type="text" id="city" v-model="client.address.city" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
              <div>
                <label for="county" class="block text-sm font-medium mb-1">County</label>
                <input type="text" id="county" v-model="client.address.county" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
              <div>
                <label for="zip" class="block text-sm font-medium mb-1">Zip</label>
                <input type="text" id="zip" v-model="client.address.zip" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
            </div>
          </div>

          <button @click="submitUpdateClient" type="submit"
                  class="w-full px-4 py-2 font-medium text-white bg-green-600 rounded hover:bg-blue-700"
                  v-if="store.role !== 'viewer'">
            Update Client
          </button>

          <br>
          <br>

          <button @click="submitDeleteClient" type="submit"
                  class="w-full px-4 py-2 font-medium text-white bg-red-600 rounded hover:bg-blue-700"
                  v-if="store.role !== 'viewer'">
            Delete Client
          </button>

          <br>
          <br>

          <button @click=this.$router.back() type="reset"
                  class="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
            Go back
          </button>
        </form>

      </div>

    </div>
    <hr class="mt-10 mb-10"/>

    <!-- Client Event Information -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mr-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">Events for Client</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>
      <div class="flex flex-col col-span-2">
        <table class="min-w-full shadow-md rounded">
          <thead class="bg-gray-50 text-xl">
          <tr>
            <th class="p-4 text-left">Event Name</th>
            <th class="p-4 text-left">Date</th>
            <th class="p-4"></th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
          <tr @click="navigateToEventDetails(event._id)" v-for="event in clientEvents" :key="event._id"
              class="cursor-pointer"
              :class="{ 'hoverRow': hoverId === event._id }" @mouseenter="hoverId = event._id"
              @mouseleave="hoverId = null">
            <td class="p-2 text-left">{{ event.name }}</td>
            <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
            <td class="p-2 text-right">
            <span class="remove-btn-wrapper">
              <span @click.stop="removeClientFromEvent(client._id, event._id)" v-if="hoverId === event._id">X</span>
            </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col">
        <!--MultiSelect to add client to events-->
        <VueMultiselect
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
            v-model="eventsSelected" :options="eventsFiltered" :custom-label="nameWithDate" :multiple="true"
            :close-on-select="true" placeholder="Select Events to be added" label="date" track-by="name"
            v-if="store.role !== 'viewer'"/>
        <div class="flex justify-between">
          <!--button to add client to events-->
          <button @click="addClientToEvent" type="submit" class="mt-5 bg-red-700 disabled:opacity-50 text-white rounded"
                  :disabled="eventsSelected.length === 0">
            Add Client to Selected Events
          </button>
        </div>
      </div>

    </div>

  </main>
</template>

<script>
// Import necessary hooks and components from Vue, Vue Router, and other libraries
import {ref, onMounted} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {useToast} from 'vue-toastification'; // For displaying notifications
import VueMultiselect from 'vue-multiselect'; // For multiselect dropdown components
import {
  deleteClientById, // API to delete a client
  deregisterAttendee, // API to deregister a client from an event
  getClientById, // API to fetch a single client by ID
  getClientEvents, // API to fetch events associated with a client
  getNonClientEvents, // API to fetch events not associated with the client
  registerAttendee, // API to register a client to an event
  updateClient // API to update client details
} from '@/api/api'; // Import APIs from a central API file
import {useLoggedInUserStore} from "@/store/loggedInUser"; // Vuex store to manage logged in user data

export default {
  components: {
    VueMultiselect // Declare the multiselect component for use in the template
  },
  setup() {
    const route = useRoute(); // Access to the route parameters
    const router = useRouter(); // Access to the router for navigation
    const toast = useToast(); // Set up toasts for notifications
    const store = useLoggedInUserStore(); // Use the store
    const client = ref({ // Reactive reference for client details
      _id: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: {primary: '', alternate: ''},
      address: {line1: '', line2: '', city: '', county: '', zip: ''}
    });
    const clientEvents = ref([]); // Reactive reference for client's events
    const eventsSelected = ref([]); // Reactive reference for selected events
    const eventsFiltered = ref([]); // Reactive reference for available events not yet registered by the client
    const hoverId = ref(null); // Reactive reference for ID of the hovered event

    // Function to execute once component is mounted
    onMounted(async () => {
      if (route.params.id) { // Check if there is an ID in the route parameters
        try {
          const clientDetails = await getClientById(route.params.id);
          if (clientDetails) {
            client.value = clientDetails; // Set client data if found
          } else {
            throw new Error('No client details received'); // Throw error if no client data is received
          }

          const registeredEvents = await getClientEvents(route.params.id);
          clientEvents.value = registeredEvents || []; // Set registered events, default to empty array if none

          const availableEvents = await getNonClientEvents(route.params.id);
          eventsFiltered.value = availableEvents || []; // Set available events, default to empty array if none
        } catch (error) {
          console.error('Fetching data error:', error); // Log error to console
          toast.error('Error fetching data: ' + error.message); // Show error as toast notification
        }
      }
    });

    // Navigate to event details
    function navigateToEventDetails(eventId) {
      router.push({name: 'eventdetails', params: {id: eventId}});
    }

    // Format a date string into MM/DD/YYYY format
    function formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return ((date.getMonth() + 1) + '').padStart(2, '0') + '/'
          + (date.getDate() + '').padStart(2, '0') + '/'
          + date.getFullYear();
    }

    // Parse a date from MM/DD/YYYY to ISO string
    function parseDate(dateString) {
      if (!dateString) return '';
      const [month, day, year] = dateString.split('/').map(Number);
      const newDate = new Date(year, month - 1, day);
      return newDate.toISOString();
    }

    // Submit the form to update client details
    const submitForm = async () => {
      try {
        await updateClient(route.params.id, client.value);
        toast.success('Client details updated successfully');
        await router.push('/findclient'); // Redirect to the clients list or dashboard
      } catch (error) {
        toast.error('Error updating client: ' + error.message);
      }
    };

    // Submit updates to a client's details
    async function submitUpdateClient() {
      try {
        // Call the API to update the client
        const response = await updateClient(client.value._id, client.value);

        // Display success message
        toast.success('Client updated successfully');

        // Wait for the toast to be shown before redirecting
        setTimeout(() => {
          router.push('/findclient');
        }, 1500); // Waits for 1.5 seconds
      } catch (error) {
        // Display error message
        toast.error('Error updating client: ' + error.message);
      }
    }

    // Method to delete a client
    async function submitDeleteClient() {
      try {
        // Show confirmation before delete operation
        if (window.confirm('Are you sure you want to delete this client?')) {
          // Call the API to delete the client
          await deleteClientById(client.value._id);
          // Display success message
          toast.success('Client deleted successfully');
          await router.push('/findclient'); // navigate to another route or perform further actions
          // Optionally navigate to another route or perform further actions
        }
      } catch (error) {
        // Display error message
        toast.error('Error deleting client: ' + error.message);
      }
    }

    // Remove a client from an event
    async function removeClientFromEvent(clientId, eventId) {
      try {
        // Sending event ID and client ID as query parameters
        await deregisterAttendee(eventId, clientId);
        toast.success('Client successfully removed from event.');
        await router.push('/findclient');
      } catch (error) {
        toast.error(`Error deregistering attendee: ${error.message}`);
        return;  // Stop further execution in case of error
      }

      // Refresh the list of client events without error handling
      clientEvents.value = await getClientEvents(client._id);
      console.log('Client events:', clientEvents.value);

      try {
        eventsFiltered.value = await getNonClientEvents(client._id);
        console.log('Events filtered:', eventsFiltered.value);
      } catch (error) {
        toast.error(`Error fetching non-client events: ${error.message}`);
      }
    }


    // Add a client to selected events
    async function addClientToEvent() {
      try {
        const clientId = client.value._id;
        const eventIds = eventsSelected.value.map(event => event._id);
        const promises = eventIds.map(eventId => registerAttendee(eventId, clientId));

        await Promise.all(promises);

        toast.success('Client added to selected events successfully');
        clientEvents.value = await getClientEvents(route.params.id);
        eventsFiltered.value = await getNonClientEvents(route.params.id);
        eventsSelected.value = [];
      } catch (error) {
        toast.error('Error adding client to events: ' + error.message);
      }
    }

    // Combine event name with formatted date for display
    function nameWithDate(event) {
      return `${event.name} (${formatDate(event.date)})`;
    }

    // Return all data and methods to the template
    return {
      client,
      store,
      clientEvents,
      eventsSelected,
      eventsFiltered,
      hoverId,
      formatDate,
      submitDeleteClient,
      addClientToEvent,
      submitUpdateClient,
      submitForm,
      removeClientFromEvent,
      navigateToEventDetails,
      nameWithDate
    };

  }
}
</script>


<!--Style for multiselect-->
<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style scoped>
.remove-btn-wrapper {
  display: inline-block;
  position: relative;
}

.remove-btn:hover {
  color: black;
}
</style>
