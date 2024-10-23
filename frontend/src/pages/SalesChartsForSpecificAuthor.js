import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import 'chart.js/auto';

function SalesChartsForSpecificAuthor() {
  const { autor } = useParams();  // Asegúrate de que el nombre aquí coincide con la ruta y en la URL
  const [weeklyComparisonData, setWeeklyComparisonData] = useState(null);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState(null);
  const [yearlyComparisonData, setYearlyComparisonData] = useState(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        const fetchWeeklyComparison = await fetch(`http://localhost:5000/api/salesauthor/weekly/comparison`);
        const weeklyData = await fetchWeeklyComparison.json();
        setWeeklyComparisonData(formatComparisonData(weeklyData.weekly_comparison, 'week'));

        const fetchMonthlyComparison = await fetch(`http://localhost:5000/api/salesauthor/monthly/comparison`);
        const monthlyData = await fetchMonthlyComparison.json();
        setMonthlyComparisonData(formatComparisonData(monthlyData.monthly_comparison, 'month'));

        const fetchYearlyComparison = await fetch(`http://localhost:5000/api/salesauthor/yearly/comparison`);
        const yearlyData = await fetchYearlyComparison.json();
        setYearlyComparisonData(formatComparisonData(yearlyData.yearly_comparison, 'year'));
      } catch (error) {
        console.error('Error fetching sales comparison data:', error);
      }
    };

    fetchComparisonData();
  }, [autor]);

  const formatComparisonData = (sales, period) => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const labels = [...new Set(sales.filter(s => s.autor === autor).map(sale => sale[period]))];

    const currentYearData = labels.map(label => {
      const sale = sales.find(s => s[period] === label && s.year == currentYear && s.autor === autor);
      return sale ? sale.total_sales : 0;
    });

    const lastYearData = labels.map(label => {
      const sale = sales.find(s => s[period] === label && s.year == lastYear && s.autor === autor);
      return sale ? sale.total_sales : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: `${currentYear} Sales`,
          data: currentYearData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: `${lastYear} Sales`,
          data: lastYearData,
          backgroundColor: 'rgba(192, 75, 75, 0.6)',
        },
      ],
    };
  };

  if (!weeklyComparisonData && !monthlyComparisonData && !yearlyComparisonData) {
    return <p>Loading data...</p>;
  }

  return (
    <div>
      <h2>Sales Charts for Author: {autor}</h2>

      <h3>Weekly Sales Comparison</h3>
      {weeklyComparisonData ? <Bar data={weeklyComparisonData} options={{ responsive: true }} /> : <p>No data available</p>}

      <h3>Monthly Sales Comparison</h3>
      {monthlyComparisonData ? <Bar data={monthlyComparisonData} options={{ responsive: true }} /> : <p>No data available</p>}

      <h3>Yearly Sales Comparison</h3>
      {yearlyComparisonData ? <Bar data={yearlyComparisonData} options={{ responsive: true }} /> : <p>No data available</p>}
    </div>
  );
}

export default SalesChartsForSpecificAuthor;

