import React, { useState } from 'react';
import axios from 'axios';
import './SubmitComplaint.css';

export default function SubmitComplaint() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    room_number: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh');
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh });
      localStorage.setItem('access', res.data.access);
      return res.data.access;
    } catch (err) {
      console.error('❌ Refresh token failed:', err.response?.data || err.message);
      return null;
    }
  };

  const submitComplaint = async (token) => {
    return axios.post(
      'http://127.0.0.1:8000/api/helpdesk/submit/',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let accessToken = localStorage.getItem('access');

    if (!accessToken) {
      setMessage('❌ You must be logged in to submit a complaint.');
      return;
    }

    try {
      const response = await submitComplaint(accessToken);
      setMessage('✅ Complaint submitted successfully!');
      console.log('✅ Complaint response:', response.data);
    } catch (error) {
      const errData = error.response?.data;
      if (
        errData?.code === 'token_not_valid' &&
        errData?.messages?.some(msg => msg.message === 'Token is expired')
      ) {
        const newToken = await refreshToken();
        if (newToken) {
          try {
            const retryResponse = await submitComplaint(newToken);
            setMessage('✅ Complaint submitted successfully after refreshing token!');
            console.log('✅ Retry response:', retryResponse.data);
          } catch (retryError) {
            console.error('❌ Retry failed:', retryError.response?.data || retryError.message);
            setMessage('❌ Retry failed after token refresh.');
          }
        } else {
          setMessage('❌ Session expired. Please log in again.');
        }
      } else {
        console.error('❌ Error:', errData || error.message);
        setMessage('❌ Failed to submit complaint.');
      }
    }
  };

  return (
    <div className="submit-complaint">
      <form onSubmit={handleSubmit}>
        <h2>Submit Complaint</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
        />
        <select name="category" onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="Electricity">Electricity</option>
          <option value="Water">Water</option>
          <option value="Internet">Internet</option>
        </select>
        <input
          type="text"
          name="room_number"
          placeholder="Room Number"
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
        {message && <p className={message.startsWith('✅') ? 'success' : ''}>{message}</p>}
      </form>
    </div>
  );
}
