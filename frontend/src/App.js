import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import BookListPage from './pages/BookListPage';
import UploadCsvPage from './pages/UploadCsvPage';
import SalesChartsForBook from './pages/SalesChartsForBook';
import SalesChartsForEditorial from './pages/SalesChartsForEditorial';
import SalesChartsForAuthor from './pages/SalesChartsForAuthor';
import SalesChartsForSpecificEditorial from './pages/SalesChartsForSpecificEditorial';
import SalesChartsForSpecificAuthor from './pages/SalesChartsForSpecificAuthor';
import SidebarLayout from './components/SidebarLayout';
import Navbar from './components/Navbar';  // Importar el nuevo Navbar

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Incluye el Navbar aquí para que esté presente en todas las páginas */}
        <Routes>
          <Route element={<SidebarLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<BookListPage />} />
            <Route path="/upload-csv" element={<UploadCsvPage />} />
            <Route path="/salescharts/:isbn" element={<SalesChartsForBook />} />
            <Route path="/saleseditorial" element={<SalesChartsForEditorial />} />
            <Route path="/saleseditorial/:editorial" element={<SalesChartsForSpecificEditorial />} />
            <Route path="/salesauthor" element={<SalesChartsForAuthor />} />
            <Route path="/salesauthor/:autor" element={<SalesChartsForSpecificAuthor />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
