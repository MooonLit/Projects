<template>
  <div class="w-full max-w-lg mx-auto">
    <table class="min-w-full shadow-md rounded mt-10">
      <thead class="bg-gray-50 text-xl">
        <tr>
          <th class="p-4 text-left">Event Name</th>
          <th class="p-4 text-left">Event Date</th>
          <th class="p-4 text-left">Number of Attendees</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-300">
        <tr v-for="event in events" :key="event._id">
          <td class="p-2 text-left">{{ event.name }}</td>
          <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
          <td class="p-2 text-left">{{ event.attendees.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

// Define props to receive an array of events data
const props = defineProps({
  events: Array,
});

// Function to format a date string into MM/DD/YYYY format
const formatDate = (date) => {
  // Create a new Date object from the provided date
  const d = new Date(date);
  // Return formatted date string with day, month (0-indexed + 1), and year
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};
</script>
