import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/api';

const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const MAX_WIDTH = 1080;
      let scale = 1;
      if (pixelCrop.width > MAX_WIDTH) {
        scale = MAX_WIDTH / pixelCrop.width;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width * scale;
      canvas.height = pixelCrop.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    image.onerror = (error) => reject(error);
  });
};

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    setLoading(true);
    try {
      let finalMediaUrl = mediaUrl;
      if (mediaUrl && croppedAreaPixels) {
        finalMediaUrl = await getCroppedImg(mediaUrl, croppedAreaPixels);
      }

      const response = await postService.createPost({
        content: content.trim(),
        mediaUrl: finalMediaUrl
      });
      onPostCreated(response.data);
      setContent('');
      setMediaUrl('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card" style={{
      background: 'linear-gradient(rgba(10, 5, 20, 0.8), rgba(10, 5, 20, 0.8)), url("./bg-lunar.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(220, 200, 150, 0.25)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '25px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(220, 200, 150, 0.05)'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          <Link to={`/profile/${user?._id || user?.id}`}>
            <img 
              src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`} 
              alt="Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(220, 200, 150, 0.5)' }}
            />
          </Link>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || user?.username}?`}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f7e8d5',
              fontFamily: "'Palatino Linotype', serif",
              fontSize: '16px',
              resize: 'none',
              minHeight: '60px',
              outline: 'none'
            }}
          />
        </div>

        {mediaUrl && (
          <div style={{ margin: '15px 0 0 55px', position: 'relative', height: '400px', width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(220,200,150,0.2)' }}>
            <Cropper
              image={mediaUrl}
              crop={crop}
              zoom={zoom}
              aspect={4 / 5} // Instagram portrait ratio
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={true}
              style={{
                containerStyle: { background: 'rgba(0,0,0,0.8)' },
                cropAreaStyle: { border: '2px solid rgba(255, 223, 150, 0.8)' }
              }}
            />
            <button 
              type="button" 
              onClick={() => { setMediaUrl(''); setCrop({ x: 0, y: 0 }); setZoom(1); }}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', zIndex: 100 }}
            >
              ✕
            </button>
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', gap: '10px', zIndex: 100 }}>
              <input 
                type="range" 
                value={zoom} 
                min={1} 
                max={3} 
                step={0.1} 
                aria-label="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(220, 200, 150, 0.15)' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              style={{ display: 'none' }}
              id="create-post-file"
            />
            <label htmlFor="create-post-file" style={{ cursor: 'pointer', color: 'rgba(255, 223, 150, 0.8)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>⌕</span> Photo/Video
            </label>
          </div>
          <button
            type="submit"
            disabled={loading || (!content.trim() && !mediaUrl)}
            style={{
              background: (!content.trim() && !mediaUrl) ? 'rgba(220,200,150,0.2)' : 'linear-gradient(135deg, rgba(220,200,150,0.8), rgba(180,140,80,0.9))',
              color: (!content.trim() && !mediaUrl) ? 'rgba(255,255,255,0.4)' : '#0a0514',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: (!content.trim() && !mediaUrl) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
