import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Gift,
  ExternalLink,
  Users,
  DollarSign
} from 'lucide-react';

const Wishlist = ({ wishlist, guests, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    price: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const newItem = {
        id: Date.now().toString(),
        ...formData,
        selectedBy: [],
        createdAt: new Date().toISOString()
      };
      
      onUpdate({ wishlist: [...wishlist, newItem] });
      
      // Сбрасываем форму
      setFormData({ url: '', title: '', description: '', price: '' });
      setShowModal(false);
    } catch (error) {
      console.error('Ошибка при добавлении в вишлист:', error);
      alert('Ошибка при добавлении в вишлист');
    }
  };

  const handleDelete = (itemId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот подарок из вишлиста?')) {
      try {
        const updatedWishlist = wishlist.filter(item => item.id !== itemId);
        onUpdate({ wishlist: updatedWishlist });
      } catch (error) {
        console.error('Ошибка при удалении из вишлиста:', error);
        alert('Ошибка при удалении из вишлиста');
      }
    }
  };

  const handleSelect = (itemId, guestId) => {
    try {
      const updatedWishlist = wishlist.map(item => {
        if (item.id === itemId) {
          if (item.selectedBy.includes(guestId)) {
            // Убираем выбор
            return { ...item, selectedBy: item.selectedBy.filter(id => id !== guestId) };
          } else {
            // Добавляем выбор
            return { ...item, selectedBy: [...item.selectedBy, guestId] };
          }
        }
        return item;
      });
      
      onUpdate({ wishlist: updatedWishlist });
    } catch (error) {
      console.error('Ошибка при выборе подарка:', error);
      alert('Ошибка при выборе подарка');
    }
  };

  const getGuestName = (guestId) => {
    const guest = guests.find(g => g.id === guestId);
    return guest ? guest.name : 'Неизвестный гость';
  };

  const getSelectedGuests = (selectedBy) => {
    return selectedBy.map(guestId => getGuestName(guestId)).join(', ');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Вишлист подарков</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Добавить подарок</span>
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white opacity-80 text-sm">Всего подарков</p>
              <p className="text-3xl font-bold text-white">{wishlist.length}</p>
            </div>
            <Gift className="h-8 w-8 text-white opacity-60" />
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white opacity-80 text-sm">Выбрано гостями</p>
              <p className="text-3xl font-bold text-green-400">
                {wishlist.filter(w => w.selectedBy.length > 0).length}
              </p>
            </div>
            <Check className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white opacity-80 text-sm">Доступно для выбора</p>
              <p className="text-3xl font-bold text-yellow-400">
                {wishlist.filter(w => w.selectedBy.length === 0).length}
              </p>
            </div>
            <Gift className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Список подарков */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Список подарков</h2>
        
        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-white opacity-40 mx-auto mb-4" />
            <p className="text-white opacity-60 text-lg">Вишлист пуст</p>
            <p className="text-white opacity-40">Добавьте первый подарок, чтобы начать</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white bg-opacity-10 rounded-lg p-4 card-hover"
              >
                {/* Превью изображения */}
                <div className="mb-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Gift className="h-12 w-12 text-white opacity-60" />
                    </div>
                  )}
                </div>

                {/* Информация о подарке */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-white opacity-80 text-sm mb-2 line-clamp-3">
                      {item.description}
                    </p>
                  )}
                  
                  {item.price && (
                    <div className="flex items-center space-x-1 mb-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-medium">{item.price}</span>
                    </div>
                  )}
                  
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <span>Открыть ссылку</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Статус выбора */}
                <div className="mb-4">
                  {item.selectedBy.length > 0 ? (
                    <div className="bg-green-500 bg-opacity-20 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">
                          Выбрано гостями:
                        </span>
                      </div>
                      <p className="text-white text-sm">
                        {getSelectedGuests(item.selectedBy)}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-500 bg-opacity-20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Gift className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-medium">
                          Доступно для выбора
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Выбор гостями */}
                {guests.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-white text-sm font-medium mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Выбор гостей:
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {guests.map((guest) => (
                        <label
                          key={guest.id}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={item.selectedBy.includes(guest.id)}
                            onChange={() => handleSelect(item.id, guest.id)}
                            className="w-4 h-4 text-blue-600 bg-white bg-opacity-20 border-white border-opacity-30 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-white text-sm">{guest.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Кнопка удаления */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-full bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Удалить</span>
                </button>
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
              Добавить подарок в вишлист
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Ссылка на подарок *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="https://example.com/gift"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Название подарка *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="Название подарка"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="Описание подарка (необязательно)"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Цена
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="1000 руб. (необязательно)"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ url: '', title: '', description: '', price: '' });
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

export default Wishlist;
