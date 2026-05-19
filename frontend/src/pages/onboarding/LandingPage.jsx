// src/pages/onboarding/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Google Fonts - Bebas Neue */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUpFloat {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 
              0 0 40px rgba(0, 0, 0, 0.8),
              0 0 80px rgba(255, 255, 255, 0.1);
          }
          50% {
            text-shadow: 
              0 0 40px rgba(0, 0, 0, 0.8),
              0 0 80px rgba(255, 255, 255, 0.2),
              0 0 100px rgba(255, 255, 255, 0.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 1s ease-out forwards;
        }

        .animate-fade-in-left {
          animation: fadeInLeft 1s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scaleIn 1.2s ease-out forwards;
          opacity: 0;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .animate-float-button {
          animation: fadeInUpFloat 1s ease-out forwards, float 3s ease-in-out 1s infinite;
          opacity: 0;
        }

        .button-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.1) 100%
          );
          background-size: 200% 100%;
        }

        .button-shimmer:hover {
          animation: shimmer 3s linear infinite;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-600 {
          animation-delay: 0.6s;
        }

        .delay-800 {
          animation-delay: 0.8s;
        }
      `}</style>

      <div className="min-h-screen w-full overflow-y-auto md:h-screen md:overflow-hidden relative flex flex-col">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/bg-image.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        {/* Top Right Corner Image */}
        <div 
          className="absolute z-20 animate-fade-in-down hidden md:block"
          style={{
            top: '-35%',
            right: '-20%',
            width: '900px',
            height: '900px'
          }}
        >
          <img 
            src="/landing-page-top-element.png" 
            alt="Decorative"
            className="w-full h-full object-contain"
            style={{
              transform: 'rotate(-180deg)'
          }}
          />
        </div>

        {/* Navbar */}
        <nav className="absolute top-6 left-4 right-4 md:top-12 md:left-18 md:w-1/2 md:ml-8 z-30 animate-fade-in-down">
          <div className="flex items-center justify-between px-6 py-3 md:px-8 md:py-4 bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl" style={{ borderRadius: '9999px' }}>
            
            <div className="flex items-center">
              <img 
                src="/Aureon_logo.png" 
                alt="Aureon Logo" 
                className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
              />
            </div>

            <button
              onClick={() => navigate('/login')}
              className="text-white hover:text-gray-200 text-sm md:text-base font-medium transition-all duration-300 hover:scale-105"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 relative z-10 flex items-center px-6 py-32 sm:pl-16 md:pl-24 lg:pl-32">
          <div className="relative flex flex-col md:flex-row items-center w-full">
            {/* Left Column - AUREON Text and Tagline */}
            <div className="flex flex-col items-start w-full md:w-auto">
              {/* AUREON Text */}
              <h1 
                className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] xl:text-[14rem] tracking-wider leading-none select-none uppercase animate-fade-in-left delay-200 mb-[-0.5rem] md:mb-[-1.5rem]"
                style={{
                  color: '#ffffff',
                  textShadow: '0 0 40px rgb(0, 0, 0), 0 0 80px rgba(255, 255, 255, 0.15)',
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontWeight: '400',
                  letterSpacing: '0.05em',
                  fontStyle: 'normal'
                }}
              >
                AUREON
              </h1>

              {/* Financial Highlight Tagline */}
              <div className="animate-fade-in-up delay-600 mt-2 md:mt-4">
                <p className="text-white/90 text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-12 font-light tracking-wide max-w-xs sm:max-w-md md:max-w-xl">
                  Track and manage your financial data with 
                  <span className="font-semibold text-white"> AI-powered </span>
                  intelligence
                </p>
              </div>

              {/* Mobile Get Started Button (Horizontal) */}
              <div className="md:hidden animate-fade-in-up delay-800 w-full max-w-xs">
                <button
                  onClick={() => navigate('/onboarding/signup')}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 active:scale-95 border border-white/10"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Desktop Vertical Get Started Button */}
            <div className="hidden md:block animate-float-button delay-800 ml-16">
              <button
                onClick={() => navigate('/onboarding/signup')}
                className="px-8 py-3 bg-black/10 backdrop-blur-sm text-white rounded-full font-bold text-xl hover:bg-black/20 transition-all shadow-2xl hover:scale-110 duration-300 relative border border-white/20 overflow-hidden group"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center center',
                  whiteSpace: 'nowrap',
                  marginLeft: '-6rem'
                }}
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 button-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;