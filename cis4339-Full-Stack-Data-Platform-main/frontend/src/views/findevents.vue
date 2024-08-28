<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        List of Events
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Event By</h2>
        <!-- Displays Event Name or Event Date selection -->
        <div class="flex flex-col">
          <select
              class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="searchBy">
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>
        <!--Displays event name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Event Name'">
          <label class="block">
            <input type="text"
                   class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                   v-model="name" @keyup.enter="handleSubmitForm" placeholder="Enter event name"/>
          </label>
        </div>
        <!-- Displays event date search field -->
        <div class="flex flex-col" v-if="searchBy === 'Event Date'">
          <input
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              type="date" v-model="eventDate" @keyup.enter="handleSubmitForm"/>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <!--Clear Search button-->
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="submit">
            Clear Search
          </button>
          <!--Search Event button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
            Search Event
          </button>
        </div>
      </div>
    </div>


    <hr class="mt-10 mb-10"/>
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <!--Table showing List of Events-->
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
          <tr @click="$router.push({name: 'eventdetails', params: { id: event._id } })"
              v-for="event in events" :key="event._id" class="cursor-pointer"
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
import {ref, onMounted} from 'vue'; // Import ref for reactive references and onMounted lifecycle hook
import {getEvents, searchEvents} from '@/api/api'; // Import API functions for fetching and searching events
import {useToast} from 'vue-toastification'; // Import toast notifications library

export default {
  setup() {
    // Define reactive references for form inputs and event data
    const searchBy = ref(''); // Reference for selecting the search criterion
    const name = ref(''); // Reference for event name input
    const events = ref(''); // Reference for storing the list of events
    const eventDate = ref(''); // Reference for event date input
    const address = ref(''); // Reference for event address input (not used in the form submission logic)
    const hoverId = ref(null); // Reference for tracking hover state over list items (not used in this script)
    const toast = useToast(); // Initialize toast notifications

    // Define a method to format dates in MM/DD/YYYY format
    const formatDate = ref((date) => {
      const isoDate = new Date(date);
      const year = isoDate.getUTCFullYear();
      const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(isoDate.getUTCDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    });

    // Method to load initial data when the component is mounted
    const loadData = async () => {
      searchBy.value = '';
      name.value = '';
      eventDate.value = '';
      address.value = '';

      try {
        const response = await getEvents(); // Fetch all events
        events.value = response; // Store fetched events
      } catch (error) {
        toast.error('loadData error', error); // Display error if fetch fails
      }
    }

    // Method to handle the form submission for searching events
    const handleSubmitForm = async () => {
      if (searchBy.value === 'Event Name' && name.value) { // Check if search by name
        try {
          const query = {searchBy: 'name', name: name.value} // Define search query
          const response = await searchEvents(query); // Perform search
          events.value = response; // Update events with the search result
        } catch (error) {
          toast.error('Error searching events', error); // Display error toast if search fails
        }
      } else if (searchBy.value === 'Event Date' && eventDate.value) { // Check if search by date
        try {
          const eventDateFormatted = new Date(eventDate.value).toISOString().substring(0, 10); // Format the date input to ISO string
          const query = {searchBy: 'date', eventDate: eventDateFormatted} // Define search query
          const response = await searchEvents(query); // Perform search
          events.value = response; // Update events with the search result
        } catch (error) {
          toast.error('Error searching events:', error); // Display error toast if search fails
        }
      }
    }

    // Call loadData on component mount to fetch initial events
    onMounted(() => {
      loadData();
    });

    // Return all reactive references and methods for use within the component
    return {
      events,
      searchBy,
      name,
      eventDate,
      formatDate,
      loadData,
      handleSubmitForm
    }
  },
}
</script>

