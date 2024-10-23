import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function SalesSummaryBooks() {
  const [weeklySales, setWeeklySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [yearlySales, setYearlySales] = useState([]);

  useEffect(() => {
    const fetchWeeklySales = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/salesbook/weekly');
        const data = await response.json();
        setWeeklySales(data.weekly_sales);
      } catch (error) {
        console.error('Error fetching weekly sales:', error);
      }
    };

    const fetchMonthlySales = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/salesbook/monthly');
        const data = await response.json();
        setMonthlySales(data.monthly_sales);
      } catch (error) {
        console.error('Error fetching monthly sales:', error);
      }
    };

    const fetchYearlySales = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/salesbook/yearly');
        const data = await response.json();
        setYearlySales(data.yearly_sales);
      } catch (error) {
        console.error('Error fetching yearly sales:', error);
      }
    };

    fetchWeeklySales();
    fetchMonthlySales();
    fetchYearlySales();
  }, []);

  const uniqueISBNs = [...new Set([...weeklySales, ...monthlySales, ...yearlySales].map(sale => sale.isbn13))];

  return (
    <div>
      <h2>Sales Summary for Books</h2>
      <ul>
        {uniqueISBNs.map(isbn => (
          <li key={isbn}>
            ISBN: {isbn} - <Link to={`/salescharts/${isbn}`}>View Sales Charts</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SalesSummaryBooks;
