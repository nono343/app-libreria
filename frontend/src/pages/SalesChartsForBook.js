import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import 'chart.js/auto';

function SalesChartsForBook() {
  const { isbn } = useParams();
  const [weeklyComparisonData, setWeeklyComparisonData] = useState(null);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState(null);
  const [yearlyComparisonData, setYearlyComparisonData] = useState(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        const fetchWeeklyComparison = await fetch(`http://localhost:5000/api/salesbook/weekly/comparison`);
        const weeklyData = await fetchWeeklyComparison.json();
        setWeeklyComparisonData(formatComparisonData(weeklyData.weekly_comparison, 'week'));

        const fetchMonthlyComparison = await fetch(`http://localhost:5000/api/salesbook/monthly/comparison`);
        const monthlyData = await fetchMonthlyComparison.json();
        setMonthlyComparisonData(formatComparisonData(monthlyData.monthly_comparison, 'month'));

        const fetchYearlyComparison = await fetch(`http://localhost:5000/api/salesbook/yearly/comparison`);
        const yearlyData = await fetchYearlyComparison.json();
        setYearlyComparisonData(formatComparisonData(yearlyData.yearly_comparison, 'year'));
      } catch (error) {
        console.error('Error fetching sales comparison data:', error);
      }
    };

    fetchComparisonData();
  }, [isbn]);

  const formatComparisonData = (sales, period) => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const labels = [...new Set(sales.map(sale => sale[period]))];

    const currentYearData = labels.map(label => {
      const sale = sales.find(s => s[period] === label && s.year == currentYear);
      return sale ? sale.total_sales : 0;
    });

    const lastYearData = labels.map(label => {
      const sale = sales.find(s => s[period] === label && s.year == lastYear);
      return sale ? sale.total_sales : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: `${currentYear} Sales`,
          data: currentYearData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.1,
        },
        {
          label: `${lastYear} Sales`,
          data: lastYearData,
          borderColor: 'rgba(192, 75, 75, 1)',
          backgroundColor: 'rgba(192, 75, 75, 0.2)',
          fill: true,
          tension: 0.1,
        },
      ],
    };
  };

  if (!weeklyComparisonData && !monthlyComparisonData && !yearlyComparisonData) {
    return <p>Loading data...</p>;
  }

  return (
    <div>
      <h2>Sales Charts for ISBN: {isbn}</h2>

      <h3>Weekly Sales Comparison</h3>
      {weeklyComparisonData ? <Line data={weeklyComparisonData} options={{ responsive: true }} /> : <p>No data available</p>}

      <h3>Monthly Sales Comparison</h3>
      {monthlyComparisonData ? <Line data={monthlyComparisonData} options={{ responsive: true }} /> : <p>No data available</p>}

      <h3>Yearly Sales Comparison</h3>
      {yearlyComparisonData ? <Line data={yearlyComparisonData} options={{ responsive: true }} /> : <p>No data available</p>}
    </div>
  );
}

export default SalesChartsForBook;
