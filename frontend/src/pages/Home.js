import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome to the Library Management System
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            className="w-full h-48 object-cover"
            src="https://via.placeholder.com/400x200"
            alt="Books"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">View Book List</h2>
            <p className="text-gray-600 mb-4">
              Explore the list of books available in the library.
            </p>
            <Link
              to="/books"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              View Books
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            className="w-full h-48 object-cover"
            src="https://via.placeholder.com/400x200"
            alt="Upload CSV"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Upload CSV</h2>
            <p className="text-gray-600 mb-4">
              Upload CSV files to manage books and sales data.
            </p>
            <Link
              to="/upload-csv"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Upload CSV
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            className="w-full h-48 object-cover"
            src="https://via.placeholder.com/400x200"
            alt="Sales by Editorial"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">View Sales Charts by Editorial</h2>
            <p className="text-gray-600 mb-4">
              Analyze sales data categorized by editorial.
            </p>
            <Link
              to="/saleseditorial"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              View Sales by Editorial
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            className="w-full h-48 object-cover"
            src="https://via.placeholder.com/400x200"
            alt="Sales by Author"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">View Sales Charts by Author</h2>
            <p className="text-gray-600 mb-4">
              Analyze sales data categorized by author.
            </p>
            <Link
              to="/salesauthor"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              View Sales by Author
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
