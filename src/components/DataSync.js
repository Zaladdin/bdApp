import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Share2, 
  Clock, 
  Smartphone,
  CheckCircle
} from 'lucide-react';
import syncService from '../services/sync';

const DataSync = ({ user, onDataImported }) => {
  const [syncInfo, setSyncInfo] = useState(null);
  // const [showQR, setShowQR] = useState(false); // Пока не используется
  const [importFile, setImportFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      const info = syncService.getLastSyncInfo();
      setSyncInfo(info);
    }
  }, [user]);

  const handleExport = () => {
    if (!user) return;

    const exportData = syncService.exportData(user.id);
    if (exportData) {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `birthday-app-data-${user.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('Данные экспортированы успешно!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleImport = () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        const success = syncService.importData(importedData);
        
        if (success) {
          setMessage('Данные импортированы успешно!');
          onDataImported && onDataImported();
          setImportFile(null);
          // Обновляем информацию о синхронизации
          const info = syncService.getLastSyncInfo();
          setSyncInfo(info);
        } else {
          setMessage('Ошибка при импорте данных');
        }
      } catch (error) {
        setMessage('Неверный формат файла');
      }
      setTimeout(() => setMessage(''), 3000);
    };
    reader.readAsText(importFile);
  };

  const generateSyncLink = () => {
    if (!user) return;

    const syncURL = syncService.generateSyncURL(user.id);
    if (syncURL) {
      navigator.clipboard.writeText(syncURL).then(() => {
        setMessage('Ссылка для синхронизации скопирована в буфер обмена!');
        setTimeout(() => setMessage(''), 3000);
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Никогда';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Синхронизация данных</h1>
      </div>

      {/* Информация о синхронизации */}
      <div className="glass-effect rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Clock className="h-6 w-6 mr-2" />
          Статус синхронизации
        </h2>
        
        {syncInfo ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white opacity-80">Последняя синхронизация:</span>
              <span className="text-white font-medium">{formatDate(syncInfo.lastSync)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white opacity-80">Версия данных:</span>
              <span className="text-white font-medium">#{syncInfo.version}</span>
            </div>
            {syncInfo.importedFrom && (
              <div className="flex items-center justify-between">
                <span className="text-white opacity-80">Импортировано с:</span>
                <span className="text-white font-medium">{syncInfo.importedFrom}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-white opacity-60">Данные еще не синхронизированы</p>
        )}
      </div>

      {/* Экспорт данных */}
      <div className="glass-effect rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Download className="h-6 w-6 mr-2" />
          Экспорт данных
        </h2>
        
        <div className="space-y-4">
          <p className="text-white opacity-80">
            Скачайте файл с вашими данными для переноса на другое устройство
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExport}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
            >
              <Download className="h-5 w-5" />
              <span>Скачать файл</span>
            </button>
            
            <button
              onClick={generateSyncLink}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
            >
              <Share2 className="h-5 w-5" />
              <span>Скопировать ссылку</span>
            </button>
          </div>
        </div>
      </div>

      {/* Импорт данных */}
      <div className="glass-effect rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Upload className="h-6 w-6 mr-2" />
          Импорт данных
        </h2>
        
        <div className="space-y-4">
          <p className="text-white opacity-80">
            Загрузите файл с данными с другого устройства
          </p>
          
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files[0])}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 cursor-pointer"
            >
              <Upload className="h-5 w-5" />
              <span>Выбрать файл</span>
            </label>
            
            {importFile && (
              <button
                onClick={handleImport}
                className="bg-green-500 bg-opacity-20 hover:bg-opacity-30 text-green-400 px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Импортировать</span>
              </button>
            )}
          </div>
          
          {importFile && (
            <p className="text-white opacity-60 text-sm">
              Выбран файл: {importFile.name}
            </p>
          )}
        </div>
      </div>

      {/* Инструкции */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Smartphone className="h-6 w-6 mr-2" />
          Как синхронизировать между устройствами
        </h2>
        
        <div className="space-y-4 text-white opacity-80">
          <div className="flex items-start space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">На первом устройстве:</p>
              <p>Нажмите "Скачать файл" или "Скопировать ссылку"</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">На втором устройстве:</p>
              <p>Откройте ссылку или загрузите файл через "Импорт данных"</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Готово!</p>
              <p>Ваши данные синхронизированы между устройствами</p>
            </div>
          </div>
        </div>
      </div>

      {/* Сообщения */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-green-500 bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSync;
