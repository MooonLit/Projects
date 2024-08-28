<template>
  <main>
    <div class="text-center mt-10">
      <h1 class="font-bold text-4xl text-red-700 tracking-widest">Dashboard</h1>

      <div class="table-container">
        <h3 class="font-bold text-3xl text-red-700 tracking-widest text-center mt-10">
          Events Attendance
        </h3>
        <div class="table-container">
          <div v-if="!recentEvents.length" class="flex justify-center mt-10">No events found.</div>
          <table-chart v-if="recentEvents.length" :events="recentEvents"/>
        </div>
        <br>
        <attendance-bar-chart
            v-if="recentEvents && recentEvents.length"
            :event-data="recentEvents"
        />
      </div>

      <div v-if="loading">Loading data...</div>
      <div v-if="error" class="text-red-500">{{ error.message }}</div>
      <br>
      <br>
      <!--      <h3 class="font-bold text-3xl text-red-700 tracking-widest text-center mt-10">-->
      <!--        Clients By ZipCode-->
      <!--      </h3>-->
      <div v-if="chartData.length || !isLoggedIn" class="chart-container">
        <canvas ref="dataChart"></canvas>
      </div>
      <div v-else>No data available. Please log in to view the data.</div>
    </div>
  </main>
</template>

<script>
import {ref, onMounted, nextTick} from 'vue';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import {getClientsByZipCode, getEvents} from "@/api/api";
import {useLoggedInUserStore} from "@/store/loggedInUser";
import {storeToRefs} from "pinia";
import TableChart from "@/components/tableChart.vue";
import AttendanceBarChart from "@/components/AttendanceBarChart.vue";

// Register the components needed for a doughnut chart
Chart.register(
    DoughnutController,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default {
  components: {AttendanceBarChart, TableChart},
  setup() {
    const userStore = useLoggedInUserStore();
    const {isLoggedIn} = storeToRefs(userStore);

    const loading = ref(false);
    const error = ref(null);
    const recentEvents = ref([]);
    const chartData = ref([]);
    const dataChart = ref(null); // ref for the canvas

    onMounted(async () => {
      if (isLoggedIn.value) {
        loading.value = true;
        try {
          const data = await getClientsByZipCode();
          recentEvents.value = await getEvents();
          if (data && data.length) {
            chartData.value = data;
            await nextTick(); // Wait for Vue to update the DOM
            initChart();
          } else {
            error.value = {message: "No data available"};
          }
        } catch (err) {
          error.value = {message: "Failed to fetch data: " + err.message};
        } finally {
          loading.value = false;
        }
      } else {
        initChart(); // Initialize the chart possibly with placeholder data or empty
      }
    });

    function initChart() {
      if (dataChart.value) {
        const ctx = dataChart.value.getContext('2d');

        // Define colors for when data is present
        const dataColors = [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ];

        // Define a single color for when there's no data
        const noDataColor = ['rgba(255, 192, 203, 0.2)']; // Light pink color

        // Choose the color set based on whether there is data
        const backgroundColors = chartData.value.length ? dataColors : noDataColor;

        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: chartData.value.map(item => item._id),
            title: 'Attendees over Time',
            datasets: [{
              label: 'Number of Clients by Zip Code',
              data: chartData.value.length ? chartData.value.map(item => item.count) : [1], // If no data, use a dummy value to show the "no data" state
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => color.replace('0.2', '1')), // Set border colors to a darker version of the background colors
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: chartData.value.length > 0, // Only display the legend if there's data
                position: 'top'
              },
              title: {
                display: true,
                text: 'Clients by Zip Code',
                padding: {
                  top: 10,
                  bottom: 30
                },
                font: {
                  size: 20
                }
              }
            }
          }
        });
      } else {
        console.error('Canvas element is not available');
      }
    }


    return {
      loading,
      error,
      chartData,
      recentEvents,
      dataChart
    };
  }
};
</script>

<style>
.chart-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>

