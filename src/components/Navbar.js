import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Gift, 
  MapPin, 
  Camera,
  PartyPopper
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/guests', label: 'Гости', icon: Users },
    { path: '/wishlist', label: 'Вишлист', icon: Gift },
    { path: '/location', label: 'Место', icon: MapPin },
    { path: '/photos', label: 'Фото', icon: Camera },
  ];

  return (
    <nav className="glass-effect rounded-lg mx-4 mt-4 mb-8">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PartyPopper className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">
              Организатор Дня Рождения
            </h1>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
