import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function BookListPage() {
  const [books, setBooks] = useState([]);
  const [weeklyRanking, setWeeklyRanking] = useState([]);
  const [monthlyRanking, setMonthlyRanking] = useState([]);
  const [yearlyRanking, setYearlyRanking] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/books');
        const data = await response.json();

        // Fetch book covers from Google Books API
        const booksWithCovers = await Promise.all(
          data.books.map(async (book) => {
            const coverUrl = await fetchBookCover(book.isbn13);
            return { ...book, coverUrl };
          })
        );

        setBooks(booksWithCovers);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    const fetchWeeklyRanking = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/salesbook/weekly/top50');
        const data = await response.json();
        setWeeklyRanking(data.top_sales);
      } catch (error) {
        console.error('Error fetching weekly ranking:', error);
      }
    };

    const fetchMonthlyRanking = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/salesbook/monthly/top50');
        const data = await response.json();
        setMonthlyRanking(data.top_sales);
      } catch (error) {
        console.error('Error fetching monthly ranking:', error);
      }
    };

    const fetchYearlyRanking = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/salesbook/yearly/top50');
        const data = await response.json();
        setYearlyRanking(data.top_sales);
      } catch (error) {
        console.error('Error fetching yearly ranking:', error);
      }
    };

    fetchBooks();
    fetchWeeklyRanking();
    fetchMonthlyRanking();
    fetchYearlyRanking();
  }, []);

  async function fetchBookCover(isbn) {
    const apiKey = 'AIzaSyC4qE5ATP_jgUaGkIGn9TOjAfsZAtmcUj0';  // Your API Key
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`);
      const data = await response.json();

      if (response.ok && data.items && data.items.length > 0) {
        const book = data.items[0];
        return book.volumeInfo.imageLinks?.thumbnail || null;
      } else {
        console.error('Error fetching book cover:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }

  return (
    <div>
      <h2>Book List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.isbn13} className="bg-white shadow-md rounded-lg overflow-hidden">
            {book.coverUrl && (
              <img
                src={book.coverUrl}
                alt={`${book.title} cover`}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-600">ISBN: {book.isbn13}</p>
              <Link to={`/salescharts/${book.isbn13}`} className="text-blue-500 hover:underline">
                View Sales Charts
              </Link>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10">Top 50 Weekly Sales</h2>
      <ol>
        {weeklyRanking.map((book, index) => (
          <li key={book.isbn13}>
            {book.title} - ISBN: {book.isbn13} - Sales: {book.total_sales}
          </li>
        ))}
      </ol>

      <h2 className="mt-10">Top 50 Monthly Sales</h2>
      <ol>
        {monthlyRanking.map((book, index) => (
          <li key={book.isbn13}>
            {book.title} - ISBN: {book.isbn13} - Sales: {book.total_sales}
          </li>
        ))}
      </ol>

      <h2 className="mt-10">Top 50 Yearly Sales</h2>
      <ol>
        {yearlyRanking.map((book, index) => (
          <li key={book.isbn13}>
            {book.title} - ISBN: {book.isbn13} - Sales: {book.total_sales}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default BookListPage;
