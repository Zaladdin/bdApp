import React, { useState, useEffect, useCallback } from 'react';
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
import DataSync from './components/DataSync';
import { eventAPI } from './services/api';
import syncService from './services/sync';

// Настройка axios - используем настройки из api.js

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, invitations, myEvents, sync
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

  const loadDataFromStorage = useCallback(() => {
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
  }, [user]);

  useEffect(() => {
    // Проверяем авторизацию
    const savedUser = localStorage.getItem('birthdayAppCurrentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadDataFromStorage();
    }
  }, [loadDataFromStorage]);

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

  const updateEventData = async (newData) => {
    const updatedData = { ...eventData, ...newData };
    setEventData(updatedData);
    
    // Сохраняем в localStorage и синхронизируем
    try {
      const currentEventId = localStorage.getItem('birthdayAppCurrentEventId');
      if (currentEventId) {
        const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
        if (allEvents[currentEventId]) {
          const updatedEvent = { ...allEvents[currentEventId], ...updatedData };
          allEvents[currentEventId] = updatedEvent;
          localStorage.setItem('birthdayAppEvents', JSON.stringify(allEvents));
          
          // Сохраняем через сервис синхронизации
          if (user) {
            syncService.saveData(user.id, updatedData);
          }
          
          // ВАЖНО: Сохраняем на сервер
          try {
            await eventAPI.saveEvent(currentEventId, updatedEvent);
            console.log('Event data saved to server:', updatedEvent);
          } catch (serverError) {
            console.error('Failed to save to server:', serverError);
          }
          
          console.log('Event data saved to localStorage and sync service:', updatedData);
        }
      } else {
        // Fallback для старого способа сохранения
        if (user) {
          localStorage.setItem(`birthdayAppData_${user.id}`, JSON.stringify(updatedData));
          syncService.saveData(user.id, updatedData);
          
          // Сохраняем на сервер
          try {
            await userAPI.saveUser(user.id, updatedData);
            console.log('User data saved to server:', updatedData);
          } catch (serverError) {
            console.error('Failed to save to server:', serverError);
          }
          
          console.log('User data saved to localStorage and sync service (fallback):', updatedData);
        }
      }
    } catch (error) {
      console.error('Error saving data:', error);
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

  const handleLogin = async (userData) => {
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
      
      // Пытаемся загрузить данные с сервера
      try {
        const serverData = await userAPI.getUser(userData.id);
        if (serverData.data) {
          setEventData(serverData.data);
          console.log('User data loaded from server:', serverData.data);
          return;
        }
      } catch (serverError) {
        console.log('Server not available, loading from localStorage:', serverError);
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

  const handleShowSync = () => {
    setCurrentView('sync');
  };

  const handleCreateEvent = async () => {
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

    // Сохраняем в localStorage и на сервер
    try {
      const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
      allEvents[newEvent.id] = newEvent;
      localStorage.setItem('birthdayAppEvents', JSON.stringify(allEvents));
      
      // Сохраняем на сервер
      try {
        await eventAPI.saveEvent(newEvent.id, newEvent);
        console.log('Event created on server:', newEvent);
      } catch (serverError) {
        console.log('Сервер недоступен, создаем только локально:', serverError);
      }
      
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
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-2xl font-bold text-white hover:text-opacity-80 transition-opacity duration-200"
                >
                  Организатор Дня Рождения
                </button>
                <UserMenu 
                  user={user}
                  onLogout={handleLogout}
                  onShowMyEvents={handleShowMyEvents}
                  onShowInvitations={handleShowInvitations}
                  onShowSync={handleShowSync}
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
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-2xl font-bold text-white hover:text-opacity-80 transition-opacity duration-200"
                >
                  Организатор Дня Рождения
                </button>
                <UserMenu 
                  user={user}
                  onLogout={handleLogout}
                  onShowMyEvents={handleShowMyEvents}
                  onShowInvitations={handleShowInvitations}
                  onShowSync={handleShowSync}
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

  // Если выбрана синхронизация данных, показываем её
  if (currentView === 'sync') {
    return (
      <Router>
        <div className="min-h-screen">
          <nav className="glass-effect rounded-lg mx-4 mt-4 mb-8">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-2xl font-bold text-white hover:text-opacity-80 transition-opacity duration-200"
                >
                  Организатор Дня Рождения
                </button>
                <UserMenu 
                  user={user}
                  onLogout={handleLogout}
                  onShowMyEvents={handleShowMyEvents}
                  onShowInvitations={handleShowInvitations}
                  onShowSync={handleShowSync}
                />
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            <DataSync 
              user={user} 
              onDataImported={() => {
                loadDataFromStorage();
                setCurrentView('dashboard');
              }}
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
