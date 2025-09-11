import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Calendar, 
  Archive, 
  MapPin, 
  Clock,
  Users,
  Gift,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const MyEvents = ({ user, onBack, onCreateEvent, onEditEvent }) => {
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'archive', 'create'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [user, loadEvents]);

  const loadEvents = useCallback(() => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
      const userEvents = [];

      // Ищем мероприятия текущего пользователя
      Object.entries(allEvents).forEach(([eventId, event]) => {
        if (event.ownerId === user.id) {
          userEvents.push({
            ...event,
            id: eventId,
            isArchived: event.isArchived || false
          });
        }
      });

      setEvents(userEvents);
    } catch (error) {
      console.error('Ошибка загрузки мероприятий:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleArchiveEvent = (eventId) => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
      if (allEvents[eventId]) {
        allEvents[eventId] = { ...allEvents[eventId], isArchived: true };
        localStorage.setItem('birthdayAppEvents', JSON.stringify(allEvents));
        loadEvents();
      }
    } catch (error) {
      console.error('Ошибка архивирования мероприятия:', error);
    }
  };

  const handleUnarchiveEvent = (eventId) => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
      if (allEvents[eventId]) {
        allEvents[eventId] = { ...allEvents[eventId], isArchived: false };
        localStorage.setItem('birthdayAppEvents', JSON.stringify(allEvents));
        loadEvents();
      }
    } catch (error) {
      console.error('Ошибка разархивирования мероприятия:', error);
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      try {
        const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
        delete allEvents[eventId];
        localStorage.setItem('birthdayAppEvents', JSON.stringify(allEvents));
        loadEvents();
      } catch (error) {
        console.error('Ошибка удаления мероприятия:', error);
      }
    }
  };

  const activeEvents = events.filter(event => !event.isArchived);
  const archivedEvents = events.filter(event => event.isArchived);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-center mt-4">Загрузка мероприятий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Мои мероприятия</h1>
          <p className="text-white opacity-80">
            Управляйте своими событиями
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          Назад
        </button>
      </div>

      {/* Кнопки навигации */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'active'
              ? 'bg-white bg-opacity-30 text-white'
              : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-white opacity-80'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span>Активные ({activeEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'archive'
              ? 'bg-white bg-opacity-30 text-white'
              : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-white opacity-80'
          }`}
        >
          <Archive className="h-5 w-5" />
          <span>Архив ({archivedEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'create'
              ? 'bg-white bg-opacity-30 text-white'
              : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-white opacity-80'
          }`}
        >
          <Plus className="h-5 w-5" />
          <span>Создать мероприятие</span>
        </button>
      </div>

      {/* Контент в зависимости от выбранной вкладки */}
      {activeTab === 'create' && (
        <div className="glass-effect rounded-xl p-8 text-center">
          <Plus className="h-16 w-16 text-white opacity-60 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Создать новое мероприятие
          </h2>
          <p className="text-white opacity-80 mb-6">
            Начните планирование вашего события
          </p>
          <button
            onClick={onCreateEvent}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Создать мероприятие</span>
          </button>
        </div>
      )}

      {activeTab === 'active' && (
        <div>
          {activeEvents.length === 0 ? (
            <div className="glass-effect rounded-xl p-8 text-center">
              <Calendar className="h-16 w-16 text-white opacity-60 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Нет активных мероприятий
              </h2>
              <p className="text-white opacity-80 mb-6">
                Создайте ваше первое мероприятие
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Создать мероприятие</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event) => (
                <div key={event.id} className="glass-effect rounded-xl p-6 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {event.location?.name || 'День рождения'}
                      </h3>
                      <p className="text-white opacity-80 text-sm">
                        Создано: {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditEvent(event.id)}
                        className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all duration-200"
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleArchiveEvent(event.id)}
                        className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all duration-200"
                        title="Архивировать"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-300 rounded-lg transition-all duration-200"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {event.location && (
                    <div className="space-y-2 mb-4">
                      {event.location.address && (
                        <div className="flex items-center text-white opacity-80">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{event.location.address}</span>
                        </div>
                      )}
                      {event.location.date && (
                        <div className="flex items-center text-white opacity-80">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">{event.location.date}</span>
                        </div>
                      )}
                      {event.location.time && (
                        <div className="flex items-center text-white opacity-80">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm">{event.location.time}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-white opacity-80 text-sm mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.guests?.length || 0} гостей</span>
                    </div>
                    <div className="flex items-center">
                      <Gift className="h-4 w-4 mr-1" />
                      <span>{event.wishlist?.length || 0} подарков</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditEvent(event.id)}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    Открыть мероприятие
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'archive' && (
        <div>
          {archivedEvents.length === 0 ? (
            <div className="glass-effect rounded-xl p-8 text-center">
              <Archive className="h-16 w-16 text-white opacity-60 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Архив пуст
              </h2>
              <p className="text-white opacity-80">
                Здесь будут храниться завершенные мероприятия
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedEvents.map((event) => (
                <div key={event.id} className="glass-effect rounded-xl p-6 card-hover opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {event.location?.name || 'День рождения'}
                      </h3>
                      <p className="text-white opacity-80 text-sm">
                        Архивировано: {new Date(event.archivedAt || event.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUnarchiveEvent(event.id)}
                        className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all duration-200"
                        title="Восстановить"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-300 rounded-lg transition-all duration-200"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {event.location && (
                    <div className="space-y-2 mb-4">
                      {event.location.address && (
                        <div className="flex items-center text-white opacity-80">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{event.location.address}</span>
                        </div>
                      )}
                      {event.location.date && (
                        <div className="flex items-center text-white opacity-80">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">{event.location.date}</span>
                        </div>
                      )}
                      {event.location.time && (
                        <div className="flex items-center text-white opacity-80">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm">{event.location.time}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-white opacity-80 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.guests?.length || 0} гостей</span>
                    </div>
                    <div className="flex items-center">
                      <Gift className="h-4 w-4 mr-1" />
                      <span>{event.wishlist?.length || 0} подарков</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
