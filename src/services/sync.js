// Сервис для синхронизации данных между устройствами
// Использует localStorage + возможность экспорта/импорта

class DataSyncService {
  constructor() {
    this.storageKey = 'birthdayAppSyncData';
    this.lastSyncKey = 'birthdayAppLastSync';
  }

  // Сохранить данные с меткой времени
  saveData(userId, data) {
    try {
      const syncData = {
        userId,
        data,
        timestamp: new Date().toISOString(),
        version: Date.now()
      };

      // Сохраняем в localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(syncData));
      localStorage.setItem(this.lastSyncKey, new Date().toISOString());

      // Также сохраняем в глобальном хранилище для синхронизации
      this.updateGlobalStorage(userId, data);

      console.log('Data saved with sync timestamp:', syncData.timestamp);
      return true;
    } catch (error) {
      console.error('Error saving sync data:', error);
      return false;
    }
  }

  // Загрузить данные
  loadData(userId) {
    try {
      const syncData = localStorage.getItem(this.storageKey);
      if (syncData) {
        const parsed = JSON.parse(syncData);
        if (parsed.userId === userId) {
          return parsed.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading sync data:', error);
      return null;
    }
  }

  // Обновить глобальное хранилище для синхронизации
  updateGlobalStorage(userId, data) {
    try {
      const globalData = JSON.parse(localStorage.getItem('birthdayAppGlobalSync') || '{}');
      globalData[userId] = {
        data,
        timestamp: new Date().toISOString(),
        version: Date.now()
      };
      localStorage.setItem('birthdayAppGlobalSync', JSON.stringify(globalData));
    } catch (error) {
      console.error('Error updating global storage:', error);
    }
  }

  // Экспорт данных для переноса на другое устройство
  exportData(userId) {
    try {
      const syncData = localStorage.getItem(this.storageKey);
      if (syncData) {
        const parsed = JSON.parse(syncData);
        if (parsed.userId === userId) {
          return {
            ...parsed,
            exportDate: new Date().toISOString(),
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform
            }
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Импорт данных с другого устройства
  importData(importedData) {
    try {
      if (!importedData || !importedData.userId || !importedData.data) {
        throw new Error('Invalid import data');
      }

      // Проверяем версию данных
      const currentData = localStorage.getItem(this.storageKey);
      if (currentData) {
        const current = JSON.parse(currentData);
        if (current.version > importedData.version) {
          const confirm = window.confirm(
            'На этом устройстве есть более новые данные. Заменить их импортированными?'
          );
          if (!confirm) {
            return false;
          }
        }
      }

      // Сохраняем импортированные данные
      const syncData = {
        ...importedData,
        timestamp: new Date().toISOString(),
        version: Date.now(),
        importedFrom: importedData.deviceInfo?.platform || 'Unknown device'
      };

      localStorage.setItem(this.storageKey, JSON.stringify(syncData));
      localStorage.setItem(this.lastSyncKey, new Date().toISOString());

      console.log('Data imported successfully from:', importedData.deviceInfo?.platform);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Получить информацию о последней синхронизации
  getLastSyncInfo() {
    try {
      const lastSync = localStorage.getItem(this.lastSyncKey);
      const syncData = localStorage.getItem(this.storageKey);
      
      if (syncData) {
        const parsed = JSON.parse(syncData);
        return {
          lastSync: lastSync,
          version: parsed.version,
          timestamp: parsed.timestamp,
          importedFrom: parsed.importedFrom
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting sync info:', error);
      return null;
    }
  }

  // Создать QR-код для экспорта данных (текстовый формат)
  generateExportQR(userId) {
    const exportData = this.exportData(userId);
    if (exportData) {
      // Создаем короткую ссылку для экспорта
      const exportString = JSON.stringify(exportData);
      return `data:application/json;base64,${btoa(exportString)}`;
    }
    return null;
  }

  // Синхронизация через URL параметры (для простого переноса)
  generateSyncURL(userId) {
    const exportData = this.exportData(userId);
    if (exportData) {
      const encoded = btoa(JSON.stringify(exportData));
      return `${window.location.origin}${window.location.pathname}?sync=${encoded}`;
    }
    return null;
  }

  // Проверить URL на наличие данных для синхронизации
  checkSyncFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const syncData = urlParams.get('sync');
      
      if (syncData) {
        const decoded = JSON.parse(atob(syncData));
        return decoded;
      }
      return null;
    } catch (error) {
      console.error('Error checking sync from URL:', error);
      return null;
    }
  }
}

const dataSyncService = new DataSyncService();
export default dataSyncService;
