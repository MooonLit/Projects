<template>
  <div class="w-1/2">
    <canvas class="p-10" ref="zipChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
import { ref, onMounted } from "vue";

Chart.register(...registerables);

export default {
  props: {
    label: {
      type: Array,
      required: true, // Enforce that labels are provided
    },
    chartData: {
      type: Array,
      required: true, // Enforce that chart data is provided
    },
  },
  setup(props) {
    // Reactive reference to the canvas element
    const zipChart = ref(null);

    // Function to generate an array of colors based on data count
    const generateColors = (count) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        // Create color strings using HSL color space
        colors.push(`hsl(${(360 * i) / count}, 70%, 70%)`);
      }
      return colors;
    };

    onMounted(() => {
      if (props.chartData && props.chartData.length) {
        // Only create the chart if data is available
        const backgroundColors = generateColors(props.chartData.length);

        // Create a new Chart.js instance using the reference to the canvas element
        const chart = new Chart(zipChart.value, {
          type: "doughnut", // Set chart type to doughnut chart
          data: {
            labels: props.label, // Assign prop values to chart data labels
            datasets: [
              {
                borderWidth: 1, // Set the width of the bar borders
                data: props.chartData, // Assign prop values to chart data points
                backgroundColor: backgroundColors, // Set background colors for data slices
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                // Configuration for the legend
                display: false, // Hide the legend
              },
              title: {
                // Configuration for the chart title
                display: true, // Display the chart title
                text: "Clients by Zip Code", // Set the title text
              },
            },
            responsive: true, // Enable responsiveness for different screen sizes
            maintainAspectRatio: true, // Maintain the chart's aspect ratio
          },
        });

        // Cleanup function to destroy the chart instance when the component unmounts
        return () => {
          chart.destroy();
          // This ensures proper cleanup to prevent memory leaks
        };
      }
    });

    return { zipChart };
  },
};
</script>
