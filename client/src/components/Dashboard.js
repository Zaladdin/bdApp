import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Gift, 
  MapPin, 
  Camera,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = ({ eventData, onUpdate }) => {
  const { guests, wishlist, location, photos } = eventData;

  const confirmedGuests = guests.filter(g => g.status === 'confirmed').length;
  const pendingGuests = guests.filter(g => g.status === 'pending').length;
  const declinedGuests = guests.filter(g => g.status === 'declined').length;
  const selectedGifts = wishlist.filter(w => w.selectedBy.length > 0).length;

  const stats = [
    {
      title: 'Всего гостей',
      value: guests.length,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Подтвердили',
      value: confirmedGuests,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Ожидают ответа',
      value: pendingGuests,
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Отказались',
      value: declinedGuests,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Подарки в вишлисте',
      value: wishlist.length,
      icon: Gift,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Выбранные подарки',
      value: selectedGifts,
      icon: Gift,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Фотографий',
      value: photos.length,
      icon: Camera,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100'
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Добро пожаловать в организатор дня рождения! 🎉
        </h1>
        <p className="text-white text-lg opacity-90">
          Управляйте всеми аспектами вашего праздника в одном месте
        </p>
        {!process.env.NODE_ENV || process.env.NODE_ENV === 'production' ? (
          <div className="mt-4 p-4 bg-yellow-500 bg-opacity-20 rounded-lg border border-yellow-500 border-opacity-30">
            <p className="text-yellow-200 text-sm">
              🚀 Это демо-версия приложения! Для полной функциональности запустите локально.
            </p>
          </div>
        ) : null}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="glass-effect rounded-xl p-6 card-hover animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Информация о событии */}
      {location.name && (
        <div className="glass-effect rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Информация о событии
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {location.name}
              </h3>
              <p className="text-white opacity-80 flex items-center mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                {location.address}
              </p>
              {location.date && (
                <p className="text-white opacity-80 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {location.date} {location.time && `в ${location.time}`}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end">
              <Link
                to="/location"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Редактировать
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/guests"
          className="glass-effect rounded-xl p-6 card-hover block text-center group"
        >
          <Users className="h-12 w-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-2">Управление гостями</h3>
          <p className="text-white opacity-80 text-sm">
            Добавляйте и управляйте списком гостей
          </p>
        </Link>

        <Link
          to="/wishlist"
          className="glass-effect rounded-xl p-6 card-hover block text-center group"
        >
          <Gift className="h-12 w-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-2">Вишлист</h3>
          <p className="text-white opacity-80 text-sm">
            Создавайте список желаемых подарков
          </p>
        </Link>

        <Link
          to="/location"
          className="glass-effect rounded-xl p-6 card-hover block text-center group"
        >
          <MapPin className="h-12 w-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-2">Место проведения</h3>
          <p className="text-white opacity-80 text-sm">
            Укажите место и время праздника
          </p>
        </Link>

        <Link
          to="/photos"
          className="glass-effect rounded-xl p-6 card-hover block text-center group"
        >
          <Camera className="h-12 w-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-2">Фотогалерея</h3>
          <p className="text-white opacity-80 text-sm">
            Загружайте и просматривайте фотографии
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
