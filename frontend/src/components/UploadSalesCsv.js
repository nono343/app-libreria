import React, { useState } from 'react';

function UploadSalesCsv({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a sales file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload-sales-csv', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setMessage(data.message);
      onUploadSuccess();
    } catch (error) {
      setMessage('Error uploading sales file');
    }
  };

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Upload Sales CSV</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center w-full mb-4">
          <label
            htmlFor="dropzone-sales"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CSV file for sales (MAX. 800x400px)
              </p>
            </div>
            <input
              id="dropzone-sales"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <button
          type="submit"
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
        >
          Upload Sales
        </button>
      </form>
      {message && <p className="mt-4 text-red-600 dark:text-red-400">{message}</p>}
    </div>
  );
}

export default UploadSalesCsv;
