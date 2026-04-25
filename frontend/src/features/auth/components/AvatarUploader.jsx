import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Upload, Loader2, Check, Scissors } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Helper to process the crop into a Blob.
 */
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
};

export default function AvatarUploader({ onClose }) {
  const { setUser } = useAuth();
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    try {
      setUploading(true);
      setError('');
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      
      const formData = new FormData();
      formData.append('file', croppedBlob, 'avatar.jpg');

      const response = await api.post('/api/auth/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUser(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#003049]/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-gray-400 hover:text-red-500" />
        </button>

        {/* Content */}
        {!image ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-[#FCBF49]/10 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-[#F77F00]" />
            </div>
            <h3 className="text-2xl font-black text-[#003049] mb-2 tracking-tight">Upload Profile Picture</h3>
            <p className="text-gray-500 mb-8 max-w-xs font-medium">Select a high-quality photo to represent yourself across the platform.</p>
            
            <label className="bg-[#F77F00] text-white px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#F77F00]/20 cursor-pointer flex items-center gap-3">
              <Scissors className="w-5 h-5" />
              Select Photo
              <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
            </label>
          </div>
        ) : (
          <div className="flex flex-col h-[500px]">
            {/* Cropper Container */}
            <div className="relative flex-1 bg-gray-900">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls */}
            <div className="p-8 bg-white space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4">
                <ZoomOut className="w-5 h-5 text-gray-400" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="flex-1 accent-[#F77F00]"
                />
                <ZoomIn className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setImage(null)}
                  className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors"
                >
                  Change Photo
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-[#003049] text-white px-8 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#003049]/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                  ) : (
                    <><Check className="w-5 h-5" /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
