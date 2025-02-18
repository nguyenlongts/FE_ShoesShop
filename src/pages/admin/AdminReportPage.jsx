import { useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminReportPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data for revenue over time chart
  const revenueData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [2000, 2500, 2200, 3000, 2800, 2700, 2900],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  // Data for top 5 products chart
  const topProductsData = {
    labels: ['Shoe A', 'Shoe B', 'Shoe C', 'Shoe D', 'Shoe E'],
    datasets: [
      {
        label: 'Units Sold',
        data: [350, 300, 250, 200, 150],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      },
    ],
  };

  // Data for order cancellation rate chart
  const orderStatusData = {
    labels: ['Successful', 'Cancelled'],
    datasets: [
      {
        data: [85, 15],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
      },
    ],
  };

  // Data for growth comparison chart
  const growthData = {
    labels: ['Last Month', 'This Month'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [120000, 150000],
        backgroundColor: ['rgba(255, 159, 64, 0.5)', 'rgba(75, 192, 192, 0.5)'],
      },
    ],
  };

  return (
    <div className="p-6">
      {/* Date Range Picker */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date Range:
        </label>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-gray-100 rounded-md">
            Custom
          </button>
          <div className="flex items-center gap-2">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Today's Revenue</h3>
          <p className="text-2xl font-semibold">1200$</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Total Orders</h3>
          <p className="text-2xl font-semibold">125</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Cancellation Rate</h3>
          <p className="text-2xl font-semibold">8%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Successful Payment Rate</h3>
          <p className="text-2xl font-semibold">95%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Revenue Over Time</h3>
          <Line data={revenueData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Top 5 Best-Selling Products</h3>
          <Bar data={topProductsData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Order Cancellation and Success Rate</h3>
          <Pie data={orderStatusData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Growth Comparison: Last Month vs This Month</h3>
          <Bar data={growthData} />
        </div>
      </div>
    </div>
  );
};

export default AdminReportPage;