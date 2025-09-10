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
    guests: [
      {
        id: 'demo-1',
        name: 'Анна Петрова',
        email: 'anna@example.com',
        phone: '+7 (999) 123-45-67',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-2',
        name: 'Михаил Иванов',
        email: 'mikhail@example.com',
        phone: '+7 (999) 234-56-78',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ],
    wishlist: [
      {
        id: 'demo-wish-1',
        url: 'https://example.com/gift1',
        title: 'Книга "Программирование на JavaScript"',
        description: 'Отличная книга для изучения программирования',
        price: '1500 руб.',
        image: '',
        selectedBy: ['demo-1'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-wish-2',
        url: 'https://example.com/gift2',
        title: 'Беспроводные наушники',
        description: 'Качественные наушники с шумоподавлением',
        price: '5000 руб.',
        image: '',
        selectedBy: [],
        createdAt: new Date().toISOString()
      }
    ],
    location: {
      name: 'Ресторан "Золотой дракон"',
      address: 'ул. Примерная, д. 123, г. Москва',
      date: '2024-12-25',
      time: '19:00'
    },
    photos: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventData();
  }, []);

  const fetchEventData = async () => {
    try {
      if (isDevelopment) {
        const response = await axios.get('/event');
        setEventData(response.data);
      } else {
        // В продакшене используем демо-данные
        setEventData(eventData);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      // В случае ошибки используем демо-данные
      setEventData(eventData);
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
