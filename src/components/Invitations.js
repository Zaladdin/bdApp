import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  Gift,
  Users
} from 'lucide-react';

const Invitations = ({ user, onBack }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInvitations = useCallback(() => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
      const userInvitations = [];

      // Ищем приглашения для текущего пользователя
      Object.values(allEvents).forEach(event => {
        if (event.guests) {
          const guestInvitation = event.guests.find(guest => 
            guest.email === user.email
          );
          if (guestInvitation) {
            userInvitations.push({
              ...event,
              invitation: guestInvitation,
              eventId: Object.keys(allEvents).find(id => allEvents[id] === event)
            });
          }
        }
      });

      setInvitations(userInvitations);
    } catch (error) {
      console.error('Ошибка загрузки приглашений:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleResponse = (eventId, response) => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('birthdayAppEvents') || '{}');
      const event = allEvents[eventId];
      
      if (event && event.guests) {
        const updatedGuests = event.guests.map(guest => 
          guest.email === user.email 
            ? { ...guest, status: response }
            : guest
        );
        
        allEvents[eventId] = { ...event, guests: updatedGuests };
        localStorage.setItem('birthdayAppEvents', JSON.stringify(allEvents));
        
        loadInvitations(); // Перезагружаем приглашения
      }
    } catch (error) {
      console.error('Ошибка при ответе на приглашение:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-center mt-4">Загрузка приглашений...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Мои приглашения</h1>
          <p className="text-white opacity-80">
            События, на которые вас пригласили
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          Назад
        </button>
      </div>

      {invitations.length === 0 ? (
        <div className="glass-effect rounded-xl p-8 text-center">
          <Mail className="h-16 w-16 text-white opacity-60 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Нет приглашений
          </h2>
          <p className="text-white opacity-80">
            Вас пока никто не пригласил на мероприятия
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((invitation) => (
            <div key={invitation.eventId} className="glass-effect rounded-xl p-6 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {invitation.location?.name || 'День рождения'}
                  </h3>
                  <p className="text-white opacity-80 text-sm">
                    Приглашение от: {invitation.ownerName || 'Неизвестно'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  invitation.invitation.status === 'confirmed' 
                    ? 'bg-green-500 bg-opacity-20 text-green-300'
                    : invitation.invitation.status === 'declined'
                    ? 'bg-red-500 bg-opacity-20 text-red-300'
                    : 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                }`}>
                  {invitation.invitation.status === 'confirmed' 
                    ? 'Подтверждено'
                    : invitation.invitation.status === 'declined'
                    ? 'Отклонено'
                    : 'Ожидает ответа'
                  }
                </div>
              </div>

              {invitation.location && (
                <div className="space-y-2 mb-4">
                  {invitation.location.address && (
                    <div className="flex items-center text-white opacity-80">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{invitation.location.address}</span>
                    </div>
                  )}
                  {invitation.location.date && (
                    <div className="flex items-center text-white opacity-80">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{invitation.location.date}</span>
                    </div>
                  )}
                  {invitation.location.time && (
                    <div className="flex items-center text-white opacity-80">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">{invitation.location.time}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-white opacity-80 text-sm mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{invitation.guests?.length || 0} гостей</span>
                </div>
                <div className="flex items-center">
                  <Gift className="h-4 w-4 mr-1" />
                  <span>{invitation.wishlist?.length || 0} подарков</span>
                </div>
              </div>

              {invitation.invitation.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleResponse(invitation.eventId, 'confirmed')}
                    className="flex-1 bg-green-500 bg-opacity-20 hover:bg-opacity-30 text-green-300 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Принять</span>
                  </button>
                  <button
                    onClick={() => handleResponse(invitation.eventId, 'declined')}
                    className="flex-1 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-300 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Отклонить</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invitations;
