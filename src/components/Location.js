import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Save,
  Edit3,
  Navigation
} from 'lucide-react';

const Location = ({ location, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: location.name || '',
    address: location.address || '',
    date: location.date || '',
    time: location.time || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      onUpdate({ location: formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при сохранении места:', error);
      alert('Ошибка при сохранении места проведения');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: location.name || '',
      address: location.address || '',
      date: location.date || '',
      time: location.time || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Место проведения</h1>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
        >
          <Edit3 className="h-5 w-5" />
          <span>Редактировать</span>
        </button>
      </div>

      {isEditing ? (
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Редактировать место проведения
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Название места *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                placeholder="Например: Ресторан 'Золотой дракон'"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Адрес *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                placeholder="ул. Примерная, д. 123, г. Москва"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Дата проведения *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Время начала
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200"
              >
                <Save className="h-5 w-5" />
                <span>Сохранить</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 px-6 py-3 rounded-lg transition-all duration-200"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-effect rounded-xl p-8">
          {location.name ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {location.name}
                </h2>
                <p className="text-white opacity-80 text-lg">
                  Место проведения дня рождения
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Адрес
                      </h3>
                      <p className="text-white opacity-80">
                        {location.address}
                      </p>
                    </div>
                  </div>
                  
                  {location.date && (
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Дата проведения
                        </h3>
                        <p className="text-white opacity-80">
                          {formatDate(location.date)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {location.time && (
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Время начала
                        </h3>
                        <p className="text-white opacity-80">
                          {formatTime(location.time)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-white bg-opacity-10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Navigation className="h-5 w-5 mr-2" />
                    Полезная информация
                  </h3>
                  <div className="space-y-3 text-sm text-white opacity-80">
                    <p>• Убедитесь, что все гости знают адрес и время</p>
                    <p>• Проверьте доступность парковки</p>
                    <p>• Подтвердите бронирование за день до события</p>
                    <p>• Подготовьте план рассадки гостей</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-white opacity-60" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Место проведения не указано
              </h2>
              <p className="text-white opacity-60 mb-6">
                Добавьте информацию о месте проведения дня рождения
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 mx-auto"
              >
                <Edit3 className="h-5 w-5" />
                <span>Добавить место</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Location;
