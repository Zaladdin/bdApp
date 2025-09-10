import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Guests from './components/Guests';
import Wishlist from './components/Wishlist';
import Location from './components/Location';
import Photos from './components/Photos';

// Настройка axios
const isDevelopment = process.env.NODE_ENV === 'development';
axios.defaults.baseURL = isDevelopment ? 'http://localhost:5000/api' : '/api';

function App() {
  const [eventData, setEventData] = useState({
    guests: [],
    wishlist: [],
    location: {
      name: '',
      address: '',
      date: '',
      time: ''
    },
    photos: []
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Убираем загрузку данных для тестирования
    console.log('App mounted successfully');
  }, []);

  const fetchEventData = async () => {
    try {
      const response = await axios.get('/event');
      setEventData(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      // Устанавливаем пустые данные в случае ошибки
      setEventData({
        guests: [],
        wishlist: [],
        location: { name: '', address: '', date: '', time: '' },
        photos: []
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEventData = (newData) => {
    setEventData(prev => ({ ...prev, ...newData }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-center mt-4">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Добавляем простой тест для отладки
  console.log('Rendering App component, loading:', loading, 'eventData:', eventData);

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  eventData={eventData} 
                  onUpdate={updateEventData}
                />
              } 
            />
            <Route 
              path="/guests" 
              element={
                <Guests 
                  guests={eventData.guests} 
                  onUpdate={updateEventData}
                />
              } 
            />
            <Route 
              path="/wishlist" 
              element={
                <Wishlist 
                  wishlist={eventData.wishlist}
                  guests={eventData.guests}
                  onUpdate={updateEventData}
                />
              } 
            />
            <Route 
              path="/location" 
              element={
                <Location 
                  location={eventData.location}
                  onUpdate={updateEventData}
                />
              } 
            />
            <Route 
              path="/photos" 
              element={
                <Photos 
                  photos={eventData.photos}
                  onUpdate={updateEventData}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
