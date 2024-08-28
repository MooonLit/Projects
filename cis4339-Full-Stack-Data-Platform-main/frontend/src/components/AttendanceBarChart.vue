<template>
  <div class="attendance-chart-container">
    <canvas ref="attendanceChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components needed for a bar chart
Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  // Array containing event data (name and attendee count)
  eventData: Array,
});

const attendanceChart = ref(null);

onMounted(async () => {
  // Wait for the next DOM update cycle to ensure the canvas is available
  await nextTick();

  // Check if the canvas element exists in the DOM
  if (attendanceChart.value) {
    const ctx = attendanceChart.value.getContext("2d");

    // Create a new Chart.js instance
    new Chart(ctx, {
      type: "bar", // Set chart type to bar chart
      data: {
        labels: props.eventData.map((event) => event.name), // Extract event names from props
        datasets: [
          {
            label: "Number of Attendees", // Label for the data series
            data: props.eventData.map((event) => event.attendees.length), // Extract attendee count from props
            backgroundColor: "rgba(75, 192, 192, 0.5)", // Set bar color with transparency
            borderColor: "rgba(75, 192, 192, 1)", // Set bar border color
            borderWidth: 1, // Set bar border width
          },
        ],
      },
      options: {
        responsive: true, // Enable responsiveness for different screen sizes
        plugins: {
          title: {
            display: true, // Display the chart title
            text: "Attendees Per Event over Time", // Set the title text
            padding: {
              top: 10, // Add padding above the title
              bottom: 30, // Add padding below the title
            },
            font: {
              size: 18, // Set title font size
              weight: "bold", // Set title font weight
            },
          },
          legend: {
            display: true, // Display the legend
            position: "top", // Position the legend at the top
          },
        },
        scales: {
          y: {
            beginAtZero: true, // Ensure y-axis starts at zero
          },
        },
      },
    });
  } else {
    console.warn("Canvas element is not ready or missing in the DOM.");
  }
});
</script>

<style scoped>
.attendance-chart-container {
  max-width: 800px; /* Set a maximum width for the chart container */
  margin: auto; /* Center the chart container horizontally */
}
</style>
