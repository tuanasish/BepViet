import React from 'react';

interface ChefHatLogoProps {
  className?: string;
}

const ChefHatLogo: React.FC<ChefHatLogoProps> = ({ className }) => {
  return (
    <img
      src="https://global-web-assets.cpcdn.com/assets/logo_circle-d106f02123de882fffdd2c06593eb2fd33f0ddf20418dd75ed72225bdb0e0ff7.png"
      alt="BepViet Logo"
      className={className}
    />
  );
};

export default ChefHatLogo;


