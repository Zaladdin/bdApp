import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
// import Navbar from './components/Navbar'; // Не используется
import Dashboard from './components/Dashboard';
import Guests from './components/Guests';
import Wishlist from './components/Wishlist';
import Location from './components/Location';
import Photos from './components/Photos';
import Auth from './components/Auth';
import UserMenu from './components/UserMenu';
import Invitations from './components/Invitations';
import MyEvents from './components/MyEvents';

// Настройка axios
const isDevelopment = process.env.NODE_ENV === 'development';
axios.defaults.baseURL = isDevelopment ? 'http://localhost:5000/api' : '/api';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, invitations, myEvents
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
    // Проверяем авторизацию
    const savedUser = localStorage.getItem('birthdayAppCurrentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadDataFromStorage();
    }
  }, []);

  const loadDataFromStorage = () => {
    try {
      if (user) {
        const userData = localStorage.getItem(`birthdayAppData_${user.id}`);
        if (userData) {
          const parsedData = JSON.parse(userData);
          setEventData(parsedData);
          console.log('User data loaded from localStorage:', parsedData);
        } else {
          console.log('No saved data found for user, using defaults');
        }
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  };

  // eslint-disable-next-line no-unused-vars
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
    const updatedData = { ...eventData, ...newData };
    setEventData(updatedData);
    
    // Сохраняем в localStorage для конкретного мероприятия
    try {
      const currentEventId = localStorage.getItem('birthdayAppCurrentEventId');
      if (currentEventId) {
        const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
        if (allEvents[currentEventId]) {
          allEvents[currentEventId] = { ...allEvents[currentEventId], ...updatedData };
          localStorage.setItem('birthdayAppEvents', JSON.stringify(allEvents));
          console.log('Event data saved to localStorage:', updatedData);
        }
      } else {
        // Fallback для старого способа сохранения
        if (user) {
          localStorage.setItem(`birthdayAppData_${user.id}`, JSON.stringify(updatedData));
          console.log('User data saved to localStorage (fallback):', updatedData);
        }
      }
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
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

  const handleLogin = (userData) => {
    setUser(userData);
    // Загружаем данные для нового пользователя
    try {
      // Сначала проверяем, есть ли текущее мероприятие
      const currentEventId = localStorage.getItem('birthdayAppCurrentEventId');
      if (currentEventId) {
        const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
        const currentEvent = allEvents[currentEventId];
        if (currentEvent && currentEvent.ownerId === userData.id) {
          setEventData({
            guests: currentEvent.guests || [],
            wishlist: currentEvent.wishlist || [],
            location: currentEvent.location || { name: '', address: '', date: '', time: '' },
            photos: currentEvent.photos || []
          });
          console.log('Current event loaded:', currentEvent);
          return;
        }
      }
      
      // Fallback к старому способу
      const savedUserData = localStorage.getItem(`birthdayAppData_${userData.id}`);
      if (savedUserData) {
        const parsedData = JSON.parse(savedUserData);
        setEventData(parsedData);
        console.log('User data loaded from localStorage (fallback):', parsedData);
      } else {
        console.log('No saved data found for user, using defaults');
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setEventData({
      guests: [],
      wishlist: [],
      location: { name: '', address: '', date: '', time: '' },
      photos: []
    });
  };

  const handleShowMyEvents = () => {
    console.log('handleShowMyEvents called, setting view to myEvents');
    setCurrentView('myEvents');
  };

  const handleShowInvitations = () => {
    setCurrentView('invitations');
  };

  const handleCreateEvent = () => {
    // Создаем новое мероприятие
    const newEvent = {
      id: Date.now().toString(),
      ownerId: user.id,
      ownerName: user.name,
      guests: [],
      wishlist: [],
      location: {
        name: '',
        address: '',
        date: '',
        time: ''
      },
      photos: [],
      createdAt: new Date().toISOString(),
      isArchived: false
    };

    // Сохраняем в localStorage
    try {
      const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
      allEvents[newEvent.id] = newEvent;
      localStorage.setItem('birthdayAppEvents', JSON.stringify(allEvents));
      
      // Переходим к редактированию нового мероприятия
      handleEditEvent(newEvent.id);
    } catch (error) {
      console.error('Ошибка создания мероприятия:', error);
    }
  };

  const handleEditEvent = (eventId) => {
    // Загружаем данные мероприятия
    try {
      const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
      const event = allEvents[eventId];
      
      if (event) {
        setEventData({
          guests: event.guests || [],
          wishlist: event.wishlist || [],
          location: event.location || { name: '', address: '', date: '', time: '' },
          photos: event.photos || []
        });
        
        // Сохраняем ID текущего мероприятия
        localStorage.setItem('birthdayAppCurrentEventId', eventId);
        
        // Переходим к дашборду
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Ошибка загрузки мероприятия:', error);
    }
  };

  // Если пользователь не авторизован, показываем форму входа
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Если выбраны приглашения, показываем их
  if (currentView === 'invitations') {
    return (
      <Router>
        <div className="min-h-screen">
          <nav className="glass-effect rounded-lg mx-4 mt-4 mb-8">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">
                  Организатор Дня Рождения
                </h1>
                <UserMenu 
                  user={user}
                  onLogout={handleLogout}
                  onShowMyEvents={handleShowMyEvents}
                  onShowInvitations={handleShowInvitations}
                />
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            <Invitations user={user} onBack={handleShowMyEvents} />
          </main>
        </div>
      </Router>
    );
  }

  // Если выбраны мои мероприятия, показываем их
  if (currentView === 'myEvents') {
    return (
      <Router>
        <div className="min-h-screen">
          <nav className="glass-effect rounded-lg mx-4 mt-4 mb-8">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">
                  Организатор Дня Рождения
                </h1>
                <UserMenu 
                  user={user}
                  onLogout={handleLogout}
                  onShowMyEvents={handleShowMyEvents}
                  onShowInvitations={handleShowInvitations}
                />
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            <MyEvents 
              user={user} 
              onBack={() => setCurrentView('dashboard')}
              onCreateEvent={handleCreateEvent}
              onEditEvent={handleEditEvent}
            />
          </main>
        </div>
      </Router>
    );
  }

  // Добавляем простой тест для отладки
  console.log('Rendering App component, loading:', loading, 'eventData:', eventData);

  return (
    <Router>
      <div className="min-h-screen">
        <nav className="glass-effect rounded-lg mx-4 mt-4 mb-8">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">
                Организатор Дня Рождения
              </h1>
              <UserMenu 
                user={user}
                onLogout={handleLogout}
                onShowMyEvents={handleShowMyEvents}
                onShowInvitations={handleShowInvitations}
              />
            </div>
          </div>
        </nav>
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
