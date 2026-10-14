import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({ title: '', author: '', isbn: '', category: '' });
  const [invalidFields, setInvalidFields] = useState({});
  const [formError, setFormError] = useState('');

  const fetchBooks = async (query = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`https://library-inventory-backend-90am.onrender.com/api/v1/books?search=${query}`);
      setBooks(response.data.data || []);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setInvalidFields({ ...invalidFields, [e.target.name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!formData.title.trim()) errors.title = true;
    if (!formData.author.trim()) errors.author = true;
    if (!formData.isbn.trim()) errors.isbn = true;
    if (!formData.category.trim()) errors.category = true;

    if (Object.keys(errors).length > 0) {
      setInvalidFields(errors);
      setFormError('Please fill out all required fields correctly.');
      return;
    }

    setFormError('');
    setLoading(true);

    try {
      await axios.post('https://library-inventory-backend-90am.onrender.com/api/v1/books', formData);
      setFormData({ title: '', author: '', isbn: '', category: '' });
      fetchBooks();
    } catch (err) {
      if (err.response && err.response.data.errors) {
        let serverErrors = {};
        err.response.data.errors.forEach((e) => { serverErrors[e.field] = true; });
        setInvalidFields(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`https://library-inventory-backend-90am.onrender.com/api/v1/books/${id}`);
      fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper" role="main">
      <div className="header-section">
        <h1>Library Book Inventory</h1>
        <span className="badge">ENG-98986 • Secure API</span>
      </div>

      <div className="grid-layout">
        {/* Left Column: Form Section */}
        <div className="card-box">
          <h2>Add New Book</h2>
          {formError && <div className="error-banner">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Book Title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Clean Architecture"
                className={invalidFields.title ? 'error' : ''}
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="author">Author Name</label>
              <input
                id="author"
                name="author"
                type="text"
                placeholder="e.g. Robert C. Martin"
                className={invalidFields.author ? 'error' : ''}
                value={formData.author}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="isbn">ISBN Code</label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                placeholder="e.g. 9780134494166"
                className={invalidFields.isbn ? 'error' : ''}
                value={formData.isbn}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                placeholder="e.g. Technology"
                className={invalidFields.category ? 'error' : ''}
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn-primary">Add Book to Inventory</button>
          </form>
        </div>

        {/* Right Column: Search & Inventory List */}
        <div className="card-box">
          <h2>Inventory Database</h2>
          
          <div className="search-bar">
            <input
              id="search"
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchBooks(e.target.value);
              }}
              aria-label="Search Books"
            />
          </div>

          {loading ? (
            <div className="loading-state">Synchronizing data with server...</div>
          ) : books.length === 0 ? (
            <div className="empty-state">No data found in inventory</div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Category</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td><strong>{book.title}</strong></td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>{book.category}</td>
                      <td>
                        <button 
                          onClick={() => handleDelete(book.id)} 
                          className="btn-danger"
                          aria-label={`Delete ${book.title}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

//https://library-inventory-backend-90am.onrender.com