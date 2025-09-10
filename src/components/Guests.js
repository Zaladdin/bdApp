import React, { useState } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Mail,
  Phone
} from 'lucide-react';

const Guests = ({ guests, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'pending'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await axios.put(`/api/guests/${editingGuest.id}`, formData);
      } else {
        await axios.post('/api/guests', formData);
      }
      
      // Обновляем данные
      const response = await axios.get('/api/event');
      onUpdate(response.data);
      
      // Сбрасываем форму
      setFormData({ name: '', email: '', phone: '', status: 'pending' });
      setShowModal(false);
      setEditingGuest(null);
    } catch (error) {
      console.error('Ошибка при сохранении гостя:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Ошибка при сохранении гостя: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      status: guest.status
    });
    setShowModal(true);
  };

  const handleDelete = async (guestId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого гостя?')) {
      try {
        await axios.delete(`/api/guests/${guestId}`);
        const response = await axios.get('/api/event');
        onUpdate(response.data);
      } catch (error) {
        console.error('Ошибка при удалении гостя:', error);
        alert('Ошибка при удалении гостя');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'declined':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Подтвердил';
      case 'declined':
        return 'Отказался';
      default:
        return 'Ожидает ответа';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Управление гостями</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Добавить гостя</span>
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white opacity-80 text-sm">Всего гостей</p>
              <p className="text-3xl font-bold text-white">{guests.length}</p>
            </div>
            <User className="h-8 w-8 text-white opacity-60" />
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white opacity-80 text-sm">Подтвердили</p>
              <p className="text-3xl font-bold text-green-400">
                {guests.filter(g => g.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white opacity-80 text-sm">Ожидают ответа</p>
              <p className="text-3xl font-bold text-yellow-400">
                {guests.filter(g => g.status === 'pending').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Список гостей */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Список гостей</h2>
        
        {guests.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-white opacity-40 mx-auto mb-4" />
            <p className="text-white opacity-60 text-lg">Пока нет гостей</p>
            <p className="text-white opacity-40">Добавьте первого гостя, чтобы начать</p>
          </div>
        ) : (
          <div className="space-y-4">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="bg-white bg-opacity-10 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{guest.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-white opacity-80">
                      {guest.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{guest.email}</span>
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(guest.status)}`}>
                    {getStatusIcon(guest.status)}
                    <span>{getStatusText(guest.status)}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(guest)}
                      className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="p-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-effect rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingGuest ? 'Редактировать гостя' : 'Добавить гостя'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Имя *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="Введите имя гостя"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="pending">Ожидает ответа</option>
                  <option value="confirmed">Подтвердил</option>
                  <option value="declined">Отказался</option>
                </select>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  {editingGuest ? 'Сохранить' : 'Добавить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingGuest(null);
                    setFormData({ name: '', email: '', phone: '', status: 'pending' });
                  }}
                  className="flex-1 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;
