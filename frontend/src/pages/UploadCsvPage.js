import React from 'react';
import UploadCsv from '../components/UploadCsv';
import UploadSalesCsv from '../components/UploadSalesCsv';

function UploadCsvPage() {
  return (
    <div>
      <h2>Upload CSV Files</h2>
      <UploadCsv />
      <UploadSalesCsv />
    </div>
  );
}

export default UploadCsvPage;
