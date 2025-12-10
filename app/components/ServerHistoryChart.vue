<template>
  <div class="w-full h-full">
    <Line v-if="history && history.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="flex justify-center items-center h-full text-gray-400 text-sm">
      No history data available
    </div>
  </div>
</template>

<script setup lang="ts">
import 'chartjs-adapter-date-fns'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { computed } from 'vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
)

const props = defineProps<{
  history: { timestamp: string; playerCount: number; maxPlayers: number }[]
}>();

const chartData = computed(() => {
  if (!props.history) return { datasets: [] };
  
  const data = props.history.map(h => ({
    x: h.timestamp,
    y: h.playerCount
  }));

  return {
    datasets: [
      {
        label: 'Players',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(79, 70, 229, 0.5)'); // Indigo-600
          gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');
          return gradient;
        },
        borderColor: '#4F46E5', // Indigo-600
        borderWidth: 2,
        pointRadius: 0,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4F46E5',
        data: data,
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = computed(() => {
  const maxPlayers = props.history.length > 0
    ? Math.max(...props.history.map(h => h.maxPlayers))
    : 0;
    
  // Calculate 24h range
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)', // Gray-900
        titleColor: '#fff',
        bodyColor: '#e5e7eb', // Gray-200
        borderColor: 'rgba(75, 85, 99, 0.5)', // Gray-600
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => `Players: ${context.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        min: yesterday.toISOString(),
        max: now.toISOString(),
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm'
          }
        },
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF', // Gray-400
          maxTicksLimit: 8,
          maxRotation: 0
        }
      },
      y: {
        min: 0,
        max: maxPlayers > 0 ? maxPlayers : undefined,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)' // Gray-600 low opacity
        },
        ticks: {
          color: '#9CA3AF', // Gray-400
          stepSize: 1,
          precision: 0
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
})
</script>
