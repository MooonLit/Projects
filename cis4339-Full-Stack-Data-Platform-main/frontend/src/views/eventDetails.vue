<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
      Event Details
    </h1>

    <div class="px-10 py-20">
      <div class="max-w-6xl mx-auto"> <!-- Adjusted max-width -->
        <form @submit.prevent="submitEventUpdate" class="bg-white p-8 rounded shadow w-full">
          <h2 class="text-2xl font-semibold mb-8">Event Information</h2>

          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-4">Event Details</h3>
            <div class="grid grid-cols-1 gap-6 mb-4">
              <div>
                <label for="eventName" class="block text-sm font-medium mb-1">Event Name*</label>
                <input type="text" id="eventName" v-model="event.name" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
              <div>
                <label for="eventDate" class="block text-sm font-medium mb-1">Event Date*</label>
                <input type="text" id="eventDate" v-model="formattedDate" placeholder="mm/dd/yyyy" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>
            </div>

            <div class="mb-8">
              <h3 class="text-lg font-semibold mb-4">Services Offered at Event</h3>
              <div class="grid grid-cols-1 gap-6">
                <div v-if="availableServices.length">
                  <ul class="space-y-2">
                    <li v-for="service in availableServices" :key="service._id"
                        class="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 transition-colors relative">
                      <label class="block w-full h-full">
                        <input type="checkbox" :id="service._id" :value="service._id"
                               :checked="isServiceChecked(service._id)" @change="toggleService(service._id)"
                               :disabled="service.status === 'Inactive'"
                               class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 mr-2">
                        <span class="font-medium">{{ service.name }}</span>
                      </label>
                    </li>
                  </ul>
                </div>
                <p v-else class="text-gray-600">No services available to add to the event.</p>
              </div>
            </div>
          </div>


          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-4">Address Details</h3>
            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="addressLine1" class="block text-sm font-medium mb-1">Address Line 1</label>
                <input type="text" id="addressLine1" v-model="event.address.line1" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>

              <div>
                <label for="addressLine2" class="block text-sm font-medium mb-1">Address Line 2</label>
                <input type="text" id="addressLine2" v-model="event.address.line2" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>

              <div>
                <label for="city" class="block text-sm font-medium mb-1">City*</label>
                <input type="text" id="city" v-model="event.address.city" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>

              <div>
                <label for="state" class="block text-sm font-medium mb-1">County*</label>
                <input type="text" id="state" v-model="event.address.county" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>

              <div>
                <label for="zip" class="block text-sm font-medium mb-1">State*</label>
                <input type="text" id="zip" v-model="event.address.zip" required
                       class="w-full border-gray-300 rounded shadow-sm">
              </div>

            </div>
          </div>

          <!-- Update Event Button -->
          <button type="submit"
                  class="w-full px-4 py-2 font-medium text-white bg-green-600 rounded hover:bg-blue-700"
                  v-if="store.role !== 'viewer'">
            Update Event
          </button>

          <!-- Delete Event Button -->
          <button @click="submitDeleteEvent" type="button"
                  class="w-full px-4 py-2 font-medium text-white bg-red-600 rounded hover:bg-blue-700 mt-4"
                  v-if="store.role !== 'viewer'">
            Delete Event
          </button>

          <!-- Go Back Button -->
          <button @click=this.$router.back() type="reset"
                  class="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700 mt-4">
            Go back
          </button>
        </form>

        <hr class="mt-10 mb-10"/>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div>
            <h2 class="text-2xl font-bold">List of Attendees</h2>
            <h3 class="italic">Click table row to view client details</h3>
          </div>
          <!-- Table showing the list of attendees for the selected event -->
          <div class="flex flex-col col-span-2">
            <table class="min-w-full shadow-md rounded">
              <thead class="bg-gray-50 text-xl">
              <tr>
                <th class="p-4 text-left">Name</th>
                <th class="p-4 text-left">City</th>
                <th class="p-4 text-left">Phone Number</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-gray-300">
              <tr v-for="client in AttendeeClients" :key="client._id"
                  @click="$router.push({ name: 'clientdetails', params: { id: client._id } })"
                  class="cursor-pointer"
                  :class="{ 'hover:bg-gray-100': hoverId === client._id }"
                  @mouseenter="hoverId = client._id"
                  @mouseleave="hoverId = null">
                <td class="p-2 text-left">
                  {{ client.firstName + ' ' + client.lastName }}
                </td>
                <td class="p-2 text-left">{{ client.address.city }}</td>
                <td class="p-2 text-left">{{ client.phoneNumber.primary }}</td>
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
// Importing reactive composition API utilities, computed properties and lifecycle hook
import {reactive, onMounted, computed} from 'vue';
import {
  getEventById, // API to fetch event details
  updateEvent, // API to update an event
  deleteEvent, // API to delete an event
  getServices, // API to fetch available services
  getClients, // API to fetch clients (note: not used in the setup)
  getEventAttendees, // API to fetch event attendees
  deleteClientById, // API to delete a client (note: not used in the setup)
} from '@/api/api'; // Importing API functions
import {useRouter} from 'vue-router'; // Importing useRouter for programmatic navigation
import {useToast} from 'vue-toastification'; // Importing toast notifications for user feedback
import {useLoggedInUserStore} from "@/store/loggedInUser"; // Using a Vuex store

export default {
  setup() {
    const router = useRouter(); // Initialize the router
    const availableServices = reactive([]); // Reactive array for available services
    const store = useLoggedInUserStore(); // Accessing Vuex store
    const AttendeeClients = reactive([]); // Reactive array for attendees
    const toast = useToast(); // Initialize toast notifications
    // Reactive state for event details
    const event = reactive({
      name: '',
      date: '',
      description: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        county: '',
        zip: ''
      },
      attendees: [],
      services: [] // Initialized to an empty array
    });

    // Computed property for formatted date for easy input/output manipulation
    const formattedDate = computed({
      get: () => formatDate(event.date), // Getter converts the date to a human-readable format
      set: (newValue) => event.date = parseDate(newValue) // Setter converts the date back to ISO format for storage
    });

    // Fetch event data on component mount
    onMounted(async () => {
      try {
        const eventData = await getEventById(router.currentRoute.value.params.id);
        Object.assign(event, eventData); // Assign fetched data to the event reactive object

        if (!event.services) event.services = [];
        if (!event.clients) event.clients = [];

        const servicesData = await getServices(); // Fetch available services
        const clients = await getEventAttendees(event._id); // Fetch attendees
        console.log('Services Received:', servicesData);
        console.log('Clients Received:', clients);

        availableServices.push(...servicesData); // Populate available services
        AttendeeClients.push(...clients); // Populate event attendees

        event.services.forEach(serviceId => { // Mark services associated with this event
          const service = availableServices.find(service => service._id === serviceId);
          if (service) service.checked = true;
        });

        event.clients.forEach(clientId => { // Mark clients associated with this event
          const client = AttendeeClients.find(client => client._id === clientId);
          if (client) client.checked = true;
        });

      } catch (error) {
        toast.error('Error fetching event details: ' + error.message); // Display error message
      }
    });

    // Check if a service is checked/selected
    function isServiceChecked(serviceId) {
      return event.services.includes(serviceId);
    }

    // Toggle a service's selection status
    const toggleService = (serviceId) => {
      const index = event.services.indexOf(serviceId);
      if (index === -1) {
        event.services.push(serviceId); // Add to the list if not already included
      } else {
        event.services.splice(index, 1); // Remove from the list if already included
      }
    };

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

    // Submit the updated event data
    const submitEventUpdate = async () => {
      try {
        console.log('Attempting to update event with data:', event);
        await updateEvent(event._id, event); // Call API to update the event
        toast.success('Event updated successfully'); // Display success message
        await router.push('/findevents'); // Navigate to events listing
      } catch (error) {
        console.error('Error updating event:', error);
        toast.error('Error updating event: ' + error.message || 'An unknown error occurred');
      }
    };

    // Submit request to delete the event
    async function submitDeleteEvent() {
      try {
        if (window.confirm('Are you sure you want to delete this event?')) { // Confirm before deletion
          await deleteEvent(event._id);
          await router.push('/findevents'); // Navigate back to the events list
          toast.success('Event deleted successfully');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
        toast.error('Error deleting event: ' + errorMessage); // Display error message
      }
    }

    // Return all data and methods to the template
    return {
      event,
      store,
      availableServices,
      AttendeeClients,
      isServiceChecked,
      toggleService,
      formattedDate,
      submitEventUpdate,
      submitDeleteEvent
    };
  }
}
</script>


