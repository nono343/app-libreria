import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

function SalesChartsForAuthor() {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const [weeklyComparisonData, setWeeklyComparisonData] = useState(null);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState(null);
  const [yearlyComparisonData, setYearlyComparisonData] = useState(null);
  const [weeklyPieData, setWeeklyPieData] = useState(null);
  const [monthlyPieData, setMonthlyPieData] = useState(null);
  const [yearlyPieData, setYearlyPieData] = useState(null);
  const [salesList, setSalesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [activeTab, setActiveTab] = useState('salesList'); // State to manage active tab

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        const fetchWeeklyComparison = await fetch(`http://localhost:5000/api/salesauthor/weekly/comparison`);
        const weeklyData = await fetchWeeklyComparison.json();
        setWeeklyComparisonData(formatComparisonData(weeklyData.weekly_comparison));
        setWeeklyPieData(formatPieData(weeklyData.weekly_comparison, 'week'));

        const fetchMonthlyComparison = await fetch(`http://localhost:5000/api/salesauthor/monthly/comparison`);
        const monthlyData = await fetchMonthlyComparison.json();
        setMonthlyComparisonData(formatComparisonData(monthlyData.monthly_comparison));
        setMonthlyPieData(formatPieData(monthlyData.monthly_comparison, 'month'));

        const fetchYearlyComparison = await fetch(`http://localhost:5000/api/salesauthor/yearly/comparison`);
        const yearlyData = await fetchYearlyComparison.json();
        setYearlyComparisonData(formatComparisonData(yearlyData.yearly_comparison));
        setYearlyPieData(formatPieData(yearlyData.yearly_comparison, 'year'));

        const salesByAuthor = aggregateSalesByAuthor([
          ...weeklyData.weekly_comparison,
          ...monthlyData.monthly_comparison,
          ...yearlyData.yearly_comparison,
        ]);
        setSalesList(salesByAuthor);
      } catch (error) {
        console.error('Error fetching sales comparison data:', error);
      }
    };

    fetchComparisonData();
  }, []);

  const aggregateSalesByAuthor = (sales) => {
    const salesMap = {};

    sales.forEach((sale) => {
      if (!salesMap[sale.autor]) {
        salesMap[sale.autor] = { autor: sale.autor, salesByYear: {} };
      }
      salesMap[sale.autor].salesByYear[sale.year] =
        (salesMap[sale.autor].salesByYear[sale.year] || 0) + sale.total_sales;
    });

    return Object.values(salesMap);
  };

  const formatComparisonData = (sales) => {
    const labels = [...new Set(sales.map((sale) => sale.autor))];

    const currentYearData = labels.map((label) => {
      const sale = sales.find((s) => s.autor === label && s.year == currentYear);
      return sale ? sale.total_sales : 0;
    });

    const lastYearData = labels.map((label) => {
      const sale = sales.find((s) => s.autor === label && s.year == lastYear);
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

  const formatPieData = (sales, period) => {
    const filteredSales = sales.filter((sale) => sale.year == currentYear);

    const labels = [...new Set(filteredSales.map((sale) => sale.autor))];
    const data = labels.map((label) => {
      const sale = filteredSales.find((s) => s.autor === label);
      return sale ? sale.total_sales : 0;
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, index) => `hsl(${index * 60}, 70%, 50%)`),
        },
      ],
    };
  };

  const pieOptions = {
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((acc, cur) => acc + cur, 0);
          const percentage = ((value / total) * 100).toFixed(2) + '%';
          return percentage;
        },
        color: '#fff',
      },
    },
    responsive: true,
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredSalesList = salesList.filter((sale) =>
    sale.autor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'salesList':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Sales List</h3>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full text-sm text-left text-gray-500">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">Author</th>
                      <th scope="col" className="px-6 py-3">Sales ({lastYear})</th>
                      <th scope="col" className="px-6 py-3">Sales ({currentYear})</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSalesList.map((sale, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{sale.autor}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{sale.salesByYear[lastYear] || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{sale.salesByYear[currentYear] || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/salesauthor/${sale.autor}`} className="text-indigo-600 hover:text-indigo-900">
                            View Sales Charts
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'weeklyComparison':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Weekly Sales Comparison</h3>
              {weeklyComparisonData ? (
                <div className="mb-6">
                  <Bar data={weeklyComparisonData} options={{ responsive: true }} />
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
            <div>
              {weeklyPieData ? (
                <div className="mb-6">
                  <Pie data={weeklyPieData} options={pieOptions} plugins={[ChartDataLabels]} />
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        );
      case 'monthlyComparison':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Monthly Sales Comparison</h3>
              {monthlyComparisonData ? (
                <div className="mb-6">
                  <Bar data={monthlyComparisonData} options={{ responsive: true }} />
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
            <div>
              {monthlyPieData ? (
                <div className="mb-6">
                  <Pie data={monthlyPieData} options={pieOptions} plugins={[ChartDataLabels]} />
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        );
      case 'yearlyComparison':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Yearly Sales Comparison</h3>
              {yearlyComparisonData ? (
                <div className="mb-6">
                  <Bar data={yearlyComparisonData} options={{ responsive: true }} />
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
            <div>
              {yearlyPieData ? (
                <div className="mb-6">
                  <Pie data={yearlyPieData} options={pieOptions} plugins={[ChartDataLabels]} />
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-center mb-6">Sales by Author</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div
          className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
          onClick={() => setActiveTab('salesList')}
        >
          <img
            src="https://via.placeholder.com/100"
            alt="Sales List"
            className="w-full h-32 object-cover rounded-t-lg"
          />
          <div className="p-5">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Sales List</h5>
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">View the list of authors and their sales.</p>
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              View
              <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
            </button>
          </div>
        </div>
        <div
          className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
          onClick={() => setActiveTab('weeklyComparison')}
        >
          <img
            src="https://via.placeholder.com/100"
            alt="Weekly Comparison"
            className="w-full h-32 object-cover rounded-t-lg"
          />
          <div className="p-5">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Weekly Comparison</h5>
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Compare sales data on a weekly basis.</p>
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Compare
              <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
            </button>
          </div>
        </div>
        <div
          className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
          onClick={() => setActiveTab('monthlyComparison')}
        >
          <img
            src="https://via.placeholder.com/100"
            alt="Monthly Comparison"
            className="w-full h-32 object-cover rounded-t-lg"
          />
          <div className="p-5">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Monthly Comparison</h5>
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Compare sales data on a monthly basis.</p>
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Compare
              <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
            </button>
          </div>
        </div>
        <div
          className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
          onClick={() => setActiveTab('yearlyComparison')}
        >
          <img
            src="https://via.placeholder.com/100"
            alt="Yearly Comparison"
            className="w-full h-32 object-cover rounded-t-lg"
          />
          <div className="p-5">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Yearly Comparison</h5>
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Compare sales data on a yearly basis.</p>
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Compare
              <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by author"
          className="border p-2 rounded w-full"
        />
      </div>

      {renderContent()}
    </div>
  );
}

export default SalesChartsForAuthor;
