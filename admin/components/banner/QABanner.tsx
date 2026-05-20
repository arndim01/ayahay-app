import React, { useEffect } from 'react';

const QABanner: React.FC = () => {
  const isQA = process.env.NEXT_PUBLIC_IS_QA === 'true';

  useEffect(() => {
    if (isQA) {
      // Add margin to the body to account for the banner
      document.body.style.marginTop = '40px'; // Adjust to match the banner height
    } else {
      // Remove margin if the banner is not shown
      document.body.style.marginTop = '0';
    }

    return () => {
      // Cleanup margin on unmount
      document.body.style.marginTop = '0';
    };
  }, [isQA]);

  if (!isQA) return null;

  return (
    <div style={bannerStyle}>
      <p style={textStyle}>This is a QA environment</p>
    </div>
  );
};

const bannerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  width: '100%',
  backgroundColor: '#47a698', // Dark green
  color: '#fff', // White text
  textAlign: 'center',
  padding: '10px 0',
  zIndex: 1000,
  fontWeight: 'bold',
  height: '40px', // Set a fixed height
};

const textStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
};

export default QABanner;