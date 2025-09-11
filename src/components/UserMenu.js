import React, { useState } from 'react';
import { 
  User, 
  LogOut, 
  ChevronDown,
  Calendar,
  Users
} from 'lucide-react';

const UserMenu = ({ user, onLogout, onShowMyEvents, onShowInvitations }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('birthdayAppCurrentUser');
    onLogout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200"
      >
        <User className="h-5 w-5" />
        <span className="hidden sm:inline">{user.name}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 bg-opacity-95 backdrop-blur-sm border border-white border-opacity-20 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-white border-opacity-20">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{user.name}</p>
                <p className="text-white text-sm opacity-80">{user.email}</p>
                {user.provider && (
                  <p className="text-white text-xs opacity-60">
                    Вход через {user.provider === 'yandex' ? 'Яндекс' : user.provider}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onShowMyEvents();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
              >
                <Calendar className="h-5 w-5" />
                <span>Мои мероприятия</span>
              </button>

              <button
                onClick={() => {
                  onShowInvitations();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
              >
                <Users className="h-5 w-5" />
                <span>Мои приглашения</span>
              </button>

              <div className="border-t border-white border-opacity-20 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
