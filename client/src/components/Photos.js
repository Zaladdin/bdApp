import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  Upload, 
  Camera, 
  Trash2, 
  Download,
  Eye,
  X,
  Image as ImageIcon
} from 'lucide-react';

const Photos = ({ photos, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });

      await axios.post('/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Обновляем данные
      const response = await axios.get('/event');
      onUpdate(response.data);
      
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Ошибка при загрузке фотографий:', error);
      alert('Ошибка при загрузке фотографий');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту фотографию?')) {
      try {
        await axios.delete(`/photos/${photoId}`);
        const response = await axios.get('/event');
        onUpdate(response.data);
      } catch (error) {
        console.error('Ошибка при удалении фотографии:', error);
        alert('Ошибка при удалении фотографии');
      }
    }
  };

  const handleDownload = (photo) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000${photo.path}`;
    link.download = photo.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Фотогалерея</h1>
        <div className="flex space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Загрузка...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Загрузить фото</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="glass-effect rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white opacity-80 text-sm">Всего фотографий</p>
            <p className="text-3xl font-bold text-white">{photos.length}</p>
          </div>
          <Camera className="h-8 w-8 text-white opacity-60" />
        </div>
      </div>

      {/* Галерея фотографий */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Фотографии с дня рождения</h2>
        
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-white opacity-40 mx-auto mb-4" />
            <p className="text-white opacity-60 text-lg">Пока нет фотографий</p>
            <p className="text-white opacity-40 mb-6">Загрузите первые фотографии с праздника</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 mx-auto"
            >
              <Upload className="h-5 w-5" />
              <span>Загрузить фото</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white bg-opacity-10 rounded-lg overflow-hidden card-hover group"
              >
                <div className="relative">
                  <img
                    src={`http://localhost:5000${photo.path}`}
                    alt={photo.originalName}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setShowModal(true);
                    }}
                  />
                  
                  {/* Overlay с кнопками */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setShowModal(true);
                        }}
                        className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDownload(photo)}
                        className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                      >
                        <Download className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="p-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-medium truncate mb-2">
                    {photo.originalName}
                  </h3>
                  <p className="text-white opacity-60 text-sm">
                    {formatDate(photo.uploadedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно для просмотра фотографии */}
      {showModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-lg transition-all duration-200"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            
            <img
              src={`http://localhost:5000${selectedPhoto.path}`}
              alt={selectedPhoto.originalName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">
                {selectedPhoto.originalName}
              </h3>
              <p className="text-white opacity-80 text-sm">
                Загружено: {formatDate(selectedPhoto.uploadedAt)}
              </p>
              
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => handleDownload(selectedPhoto)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Скачать</span>
                </button>
                <button
                  onClick={() => handleDelete(selectedPhoto.id)}
                  className="bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Удалить</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
