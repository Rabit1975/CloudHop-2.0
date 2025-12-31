"use client";

import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: 'bg-[#0E1430] text-white border border-[#53C8FF]/20 shadow-lg rounded-xl text-sm font-medium italic',
        duration: 3000,
        success: {
          iconTheme: {
            primary: '#3DD68C',
            secondary: '#0A0F1F',
          },
        },
        error: {
          iconTheme: {
            primary: '#FF4D4D',
            secondary: '#0A0F1F',
          },
        },
        loading: {
          iconTheme: {
            primary: '#53C8FF',
            secondary: '#0A0F1F',
          },
        },
      }}
    />
  );
};

export default ToastProvider;