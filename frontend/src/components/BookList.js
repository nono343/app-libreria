import React, { useEffect, useState } from 'react';

function BookList() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        // Obtener los libros desde la API
        const response = await fetch('http://localhost:5000/api/books');
        const data = await response.json();
        const booksWithSales = await Promise.all(data.books.map(async book => {
          // Obtener las ventas para cada libro
          const salesResponse = await fetch(`http://localhost:5000/api/books/${book.isbn13}/sales`);
          const salesData = await salesResponse.json();
          return { ...book, sales: salesData.sales }; // Añadir ventas a cada libro
        }));

        setBooks(booksWithSales);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    loadBooks();
  }, []);

  return (
    <div>
      <h2>Book List</h2>
      {books.length === 0 ? (
        <p>No books available</p>
      ) : (
        <ul>
          {books.map(book => (
            <li key={book.isbn13}>
              <h3>{book.isbn13} - {book.titulo} - {book.autor}</h3>
              <p><strong>Editorial:</strong> {book.editorial}</p>
              <p><strong>Ventas:</strong></p>
              {book.sales && book.sales.length > 0 ? (
                <ul>
                  {book.sales.map(sale => (
                    <li key={sale.id}>
                      Fecha: {sale.fechaventa}, Número de ventas: {sale.numerodeventas}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No sales data available</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookList;
