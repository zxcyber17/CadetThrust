import React from 'react';
import '../styles/neon.css';

export const SuccessScreen: React.FC = () => {
  return (
    <div className="success-overlay">
      <div className="success-card card-neon text-center">
        <div className="salute-container-real" style={{ width: '280px', height: '350px', margin: '0 auto 20px auto', border: '1px solid #00d4ff', boxShadow: '0 0 20px #00d4ff', borderRadius: '12px', overflow: 'hidden' }}>
          {/* পাবলিক ফোল্ডার থেকে ইমেজ কল করা হয়েছে */}
          <img src="/succes_page.jpg" alt="Success Cadet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h2 className="success-text" style={{ color: '#00d4ff', fontSize: '1.8rem', fontWeight: 'bold', textTransform: 'uppercase', textShadow: '0 0 10px #00d4ff' }}>
          Successfully Registered!
        </h2>
      </div>
    </div>
  );
};
