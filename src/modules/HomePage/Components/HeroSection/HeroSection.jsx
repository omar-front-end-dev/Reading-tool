export const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#63a29b] to-[#275151] text-white flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* العنصر البصري */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 transform rotate-1 lg:rotate-2 floating">
              <div className="bg-gradient-to-br from-[#63a29b] to-[#275151] rounded-xl h-60 sm:h-80 lg:h-80 flex items-center justify-center p-4 sm:p-6">
                <div className="text-center w-full">
                  <div className="typing-animation text-lg sm:text-xl lg:text-2xl font-bold sm:mb-6 w-max mx-auto">
                    Welcome to SNA ACADEMY
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xs mx-auto">
                    <div className="bg-white/20 p-2 sm:p-4 rounded-lg">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-[#f8b400] mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm">محادثة</p>
                    </div>
                    <div className="bg-white/20 p-2 sm:p-4 rounded-lg">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-[#f8b400] mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm">قواعد</p>
                    </div>
                    <div className="bg-white/20 p-2 sm:p-4 rounded-lg">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-[#f8b400] mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm">استماع</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* عناصر عائمة */}
            <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-[#f8b400] rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg">
              <span className="text-[#275151] font-bold text-sm sm:text-xl">
                A+
              </span>
            </div>

            <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-white rounded-lg w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg transform rotate-12">
              <span className="text-[#275151] font-bold text-sm sm:text-xl">
                95%
              </span>
            </div>
          </div>

          {/* النص والعناصر التفاعلية */}
          <div className="space-y-6 sm:space-y-8 text-end order-1 lg:order-2">
            <h1
              style={{ lineHeight: "1.6" }}
              className="arabic_font text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold"
            >
              ابدأ رحلتك في تعلم{" "}
              <span className="text-[#f8b400] arabic_font">
                اللغة الإنجليزية
              </span>{" "}
              اليوم
            </h1>

            <p
              style={{ lineHeight: "1.6" }}
              className="text-base arabic_font sm:text-lg lg:text-xl opacity-90 leading-relaxed"
            >
              انضم إلى آلاف الطلاب الذين طوروا مهاراتهم في اللغة الإنجليزية من
              خلال منصتنا التعليمية المبتكرة والتفاعلية.
            </p>

            <div className="flex flex-wrap justify-end gap-4">
              <a
                href="#start_Beginner"
                className="bg-[#f8b400] arabic_font hover:bg-[#e0a500] text-[#275151] font-bold py-3 px-6 sm:px-8 rounded-full transition duration-300 transform hover:-translate-y-1 shadow-lg text-sm sm:text-base"
              >
                ابدأ التعلم الآن
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
              <p className="text-base arabic_font sm:text-lg mb-3 sm:mb-4 font-semibold">
                : دوراتنا تشمل
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center arabic_font gap-1 justify-end text-sm sm:text-base">
                  تسجيل صوتك وتقييم نطقك
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#f8b400] ml-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
                <li className="flex items-center arabic_font gap-1 justify-end text-sm sm:text-base">
                  تمارين تفاعلية ممتعة
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#f8b400] ml-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
                <li className="flex items-center arabic_font gap-1 justify-end text-sm sm:text-base">
                  متابعة وتقييم مستمر
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#f8b400] ml-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .floating {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0px) rotate(1deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
          100% {
            transform: translateY(0px) rotate(1deg);
          }
        }

        @media (min-width: 1024px) {
          .floating {
            animation: float 6s ease-in-out infinite;
          }

          @keyframes float {
            0% {
              transform: translateY(0px) rotate(2deg);
            }
            50% {
              transform: translateY(-20px) rotate(2deg);
            }
            100% {
              transform: translateY(0px) rotate(2deg);
            }
          }
        }

        .typing-animation {
          overflow: hidden;
          border-right: 0.15em solid #f8b400;
          white-space: nowrap;
          margin: 0 auto;
          letter-spacing: 0.15em;
          animation: typing 3.5s steps(40, end),
            blink-caret 0.75s step-end infinite;
        }

        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes blink-caret {
          from,
          to {
            border-color: transparent;
          }
          50% {
            border-color: #f8b400;
          }
        }

        /* تحسينات للشاشات الصغيرة */
        @media (max-width: 640px) {
          .typing-animation {
            font-size: 1rem;
            animation: typing 2.5s steps(30, end),
              blink-caret 0.75s step-end infinite;
          }
        }

        /* تحسين الانيميشن للشاشات المتوسطة */
        @media (min-width: 641px) and (max-width: 1023px) {
          .floating {
            animation: float 6s ease-in-out infinite;
          }

          @keyframes float {
            0% {
              transform: translateY(0px) rotate(1deg);
            }
            50% {
              transform: translateY(-15px) rotate(1deg);
            }
            100% {
              transform: translateY(0px) rotate(1deg);
            }
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
