<template>
  <div>
    <canvas class="p-10" ref="attendanceChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
import { Colors } from "chart.js";

Chart.register(...registerables);
Chart.register(Colors);

export default {
  props: {
    // Array containing labels for the chart's x-axis
    label: {
      type: Array,
      required: true, // Enforce that labels are provided
    },
    // Array containing data points for the chart
    chartData: {
      type: Array,
      required: true, // Enforce that chart data is provided
    },
  },
  async mounted() {
    // Wait for the component to be mounted before creating the chart
    await this.$nextTick(); // Ensures DOM element is available

    // Create a new Chart.js instance using the reference to the canvas element
    new Chart(this.$refs.attendanceChart, {
      type: "bar", // Set chart type to bar chart
      data: {
        labels: this.label, // Assign prop values to chart data labels
        datasets: [
          {
            borderWidth: 1, // Set the width of the bar borders
            data: this.chartData, // Assign prop values to chart data points
          },
        ],
      },
      options: {
        scales: {
          y: {
            // Configuration for the y-axis
            ticks: {
              stepSize: 1, // Set the step size for y-axis ticks (1 unit per step)
            },
          },
          x: {
            // Configuration for the x-axis
            gridLines: {
              display: false, // Hide grid lines on the x-axis
            },
          },
        },
        plugins: {
          legend: {
            // Configuration for the legend
            display: false, // Hide the legend
          },
          title: {
            // Configuration for the chart title
            display: true, // Display the chart title
            text: "Attendance Chart", // Set the title text
          },
        },
        responsive: true, // Enable responsiveness for different screen sizes
        maintainAspectRatio: true, // Maintain the chart's aspect ratio
      },
    });
  },
};
</script>
