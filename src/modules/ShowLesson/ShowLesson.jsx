import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  BookOpen,
  Trash2,
} from "lucide-react";
import { IoIosSend } from "react-icons/io";
import { Link, useParams } from "react-router-dom";
import { levelsAndLesson } from "../../config/levelsAndLesson/levelsAndLesson";
import { PiExam } from "react-icons/pi";
import { IoIosMic } from "react-icons/io";

// ✅ Speech Synthesis support check
const supportsTTS =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

// 🟨 Preferred voice (can be changed)
const PREFERRED_VOICE_NAME = "Google UK English Female";
const PREFERRED_VOICE_LANG = "en-GB";

/* ----------------------- MicrophonePermissionAlert ----------------------- */
const MicrophonePermissionAlert = ({ permission, onRequestPermission }) => {
  if (permission !== "denied") return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 max-w-md w-full">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            إذن الميكروفون مغلق. لن تتمكن من تسجيل نطقك. الرجاء السماح بالوصول
            إلى الميكروفون في إعدادات المتصفح.
          </p>
          <button
            onClick={onRequestPermission}
            className="mt-2 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            طلب الإذن مرة أخرى
          </button>
        </div>
      </div>
    </div>
  );
};

MicrophonePermissionAlert.propTypes = {
  permission: PropTypes.string,
  onRequestPermission: PropTypes.func.isRequired,
};
const RecordingModal = ({
  isOpen,
  isRecording,
  isWaitingForRecording,
  recordingResult,
  originalText,
  onStartRecording,
  onSkipRecording,
  onContinue,
}) => {
  if (!isOpen) return null;

  React.useEffect(() => {
    const onKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onSkipRecording?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onSkipRecording]);

  // Title based on current state
  const title = isRecording
    ? "جارٍ التسجيل"
    : recordingResult
    ? recordingResult.success
      ? "نتيجة التقييم"
      : "خطأ في التسجيل"
    : "سجّل نُطقك الآن";

  // Result card colors
  const resultTone =
    recordingResult?.evaluation?.color === "green"
      ? "border-green-500 bg-green-50 text-green-800"
      : recordingResult?.evaluation?.color === "blue"
      ? "border-blue-500 bg-blue-50 text-blue-800"
      : recordingResult?.evaluation?.color === "yellow"
      ? "border-yellow-500 bg-yellow-50 text-yellow-800"
      : "border-red-500 bg-red-50 text-red-800";

  // Function to highlight words based on comparison
  const highlightWords = (originalText, userText) => {
    if (!originalText || !userText) return null;

    const originalWords = originalText.trim().split(/\s+/);
    const userWords = userText.trim().split(/\s+/);

    // Simple word matching algorithm - ignore all punctuation
    const highlightedWords = originalWords.map((originalWord, index) => {
      const userWord = userWords[index];

      // Clean both words from all punctuation marks for comparison
      const cleanOriginal = originalWord
        .replace(/[^\w\u0600-\u06FF]/g, "")
        .toLowerCase();
      const cleanUser = userWord
        ? userWord.replace(/[^\w\u0600-\u06FF]/g, "").toLowerCase()
        : "";

      const isCorrect = userWord && cleanOriginal === cleanUser;

      return {
        word: originalWord,
        isCorrect,
        userWord: userWord || "",
      };
    });

    return (
      <div className="space-y-2">
        <div
          className="arabic_font text-lg leading-relaxed"
          dir="ltr"
          style={{ textAlign: "left" }}
        >
          {highlightedWords.map((item, index) => (
            <span key={index}>
              <span
                className={`inline-block rounded-md font-bold transition-all ${
                  item.isCorrect ? "text-green-800" : "text-red-800"
                }`}
                title={
                  item.isCorrect
                    ? "نطق صحيح"
                    : `متوقع: ${item.word}، نطقت: ${item.userWord || "لا شيء"}`
                }
              >
                {item.word}
              </span>
              {index < highlightedWords.length - 1 && " "}
            </span>
          ))}
        </div>
      </div>
    );
  };

  /* ----------------------- Audio Waves + Recording Timer ---------------------- */
  const BAR_COUNT = 28;
  const [elapsed, setElapsed] = React.useState(0); // in seconds
  const startTsRef = React.useRef(null);
  const rafRef = React.useRef(null);

  // Start/stop timer synchronized with isRecording
  React.useEffect(() => {
    if (isRecording) {
      // Reset timer when recording starts
      startTsRef.current = performance.now();
      setElapsed(0);

      const tick = (now) => {
        if (!startTsRef.current) return;
        const seconds = Math.floor((now - startTsRef.current) / 1000);
        setElapsed(seconds);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // Stop timer
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTsRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRecording]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  // Animated bar heights (visual only - no real microphone)
  const [seed, setSeed] = React.useState(0);
  React.useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setSeed((n) => (n + 1) % 1000000), 120);
    return () => clearInterval(id);
  }, [isRecording]);

  const bars = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      // Generate smooth semi-random height
      const base = 8 + ((i * 37 + seed * 13) % 28); // 8px -> 36px
      arr.push(base);
    }
    return arr;
  }, [seed]);

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onSkipRecording}
      />

      {/* Bottom Drawer */}
      <div
        className={`fixed overflow-hidden left-0 right-0 bottom-0 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        dir="rtl"
      >
        <div className="mx-auto w-full max-w-lg bg-white rounded-t-3xl shadow-2xl border-t border-gray-100">
          {/* Handle + Close */}
          <div className="py-3 flex items-center justify-center relative">
            <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            <button
              onClick={onSkipRecording}
              className=" absolute left-2 top-6 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="إغلاق"
              title="إغلاق"
            >
              <X size={20} className="text-black" />
            </button>
          </div>

          {/* Header */}
          <div className="px-5 pb-3">
            <h3 className="arabic_font text-lg font-bold text-gray-900 text-center">
              {title}
            </h3>
          </div>

          {/* Content */}
          <div className="px-5 pb-4">
            {/* State 1: Before Recording */}
            {isWaitingForRecording && !isRecording && !recordingResult && (
              <div className="space-y-4">
                {/* Display original text before recording */}
                {originalText && (
                  <div className="rounded-lg border-2 border-blue-300 p-4 bg-blue-50 shadow-sm">
                    <p className="arabic_font text-sm text-blue-600 mb-2 font-bold text-center">
                      اقرأ هذه الجملة واحفظها ثم انطقها
                    </p>
                    <p className="arabic_font text-blue-900 font-bold text-lg text-center leading-8 p-2 bg-white rounded-lg border border-blue-200">
                      {originalText}
                    </p>
                  </div>
                )}

                <div className="flex items-center flex-col justify-center gap-3">
                  <button
                    onClick={onStartRecording}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white font-semibold shadow-lg transition-all transform hover:scale-105"
                  >
                    <IoIosMic size={30} />
                  </button>
                  <button
                    onClick={onSkipRecording}
                    className="arabic_font inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium shadow-sm transition-colors"
                  >
                    تخطي
                  </button>
                </div>
              </div>
            )}

            {/* State 2: During Recording - WhatsApp Style */}
            {isRecording && (
              <div className="flex flex-col items-center justify-center gap-4 py-2">
                {/* Display original text during recording - with more focus */}
                {originalText && (
                  <div className="w-full rounded-xl border-2 border-green-300 p-4 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
                    <p className="arabic_font text-sm text-green-700 mb-3 font-bold text-center flex items-center justify-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      انطق هذه الجملة الآن
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </p>
                    <div className="bg-white rounded-lg p-3 border-2 border-green-200 shadow-inner">
                      <p className="arabic_font text-green-900 font-bold text-xl text-center leading-relaxed">
                        {originalText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recording Capsule */}
                <div className="w-full max-w-md">
                  <div className="relative w-full rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white px-3 py-2 flex items-center shadow-lg">
                    {/* Delete Button (Left) */}
                    <button
                      onClick={onSkipRecording}
                      className="shrink-0 mr-2 p-1.5 rounded-full hover:bg-white/10 focus:outline-none transition-colors"
                      title="حذف"
                      aria-label="حذف التسجيل"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Waves + Timer */}
                    <div className="flex-1 flex flex-col items-center">
                      {/* Audio Waves */}
                      <div className="h-8 flex items-center justify-center gap-[2px] w-full max-w-[300px]">
                        {bars.map((h, idx) => (
                          <span
                            key={idx}
                            className="inline-block w-[3px] rounded-sm bg-white/90 transition-all duration-150"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                      {/* Timer below waves */}
                      <div className="arabic_font text-[11px] mt-1 opacity-90 tracking-wider font-mono">
                        {formatTime(elapsed)}
                      </div>
                    </div>

                    {/* Send Button (Right) */}
                    <button
                      onClick={onContinue}
                      className="arabic_font flex items-center justify-center shrink-0 ml-2 p-2 rounded-full bg-white text-[var(--secondary-color)] hover:bg-white/70 focus:outline-none transition-colors"
                      title="إرسال"
                      aria-label="إرسال التسجيل"
                    >
                      <IoIosSend size={20} className="flex" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 text-sm arabic_font font-medium">
                  🎤 جارٍ التسجيل... تحدث بوضوح
                </p>
              </div>
            )}

            {/* State 3: After Getting Results */}
            {recordingResult && (
              <div className="space-y-5">
                {recordingResult.success ? (
                  <>
                    <div
                      className={`mb-1 p-4 rounded-xl border-2 ${resultTone}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Check icon */}
                        <svg
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 6L9 17l-5-5"
                          />
                        </svg>
                        <div>
                          <p className="text-base font-bold arabic_font">
                            {recordingResult.evaluation.message}
                          </p>
                          <p className="text-sm mt-1 arabic_font">
                            التشابه: {recordingResult.evaluation.score}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Word-by-word highlighting instead of comparison */}
                    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                      <p className="arabic_font text-sm text-gray-600 mb-3 font-bold">
                        تحليل الكلمات:
                      </p>
                      {highlightWords(
                        recordingResult.originalText,
                        recordingResult.userText
                      )}
                    </div>

                    {/* Show what user actually said */}
                    <div className="rounded-lg border border-blue-200 p-3 bg-blue-50">
                      <p className="arabic_font text-xs text-blue-600 mb-1 font-bold">
                        ما قلته:
                      </p>
                      <p className="arabic_font text-left text-blue-900 font-medium">
                        {recordingResult.userText}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50 text-red-800">
                      <div className="flex items-start gap-3">
                        {/* Alert icon */}
                        <svg
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7A2 2 0 003.53 22h16.94a2 2 0 001.72-3.44l-8.48-14.7a2 2 0 00-3.42 0z"
                          />
                        </svg>
                        <div>
                          <p className="font-semibold arabic_font">
                            لم يتم تسجيل نطق صالح
                          </p>
                          <p className="text-sm mt-1 arabic_font">
                            {recordingResult.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                        <p className="text-xs arabic_font text-gray-500 mb-1">
                          الجملة الأصلية
                        </p>
                        <p className="text-gray-900">
                          {recordingResult.originalText}
                        </p>
                      </div>
                      {recordingResult.userText ? (
                        <div className="rounded-lg border border-gray-200 p-3">
                          <p className="text-xs text-gray-500 mb-1">ما سُمع</p>
                          <p className="text-gray-900">
                            {recordingResult.userText}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

RecordingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  originalText: PropTypes.string.isRequired,
  isWaitingForRecording: PropTypes.bool.isRequired,
  recordingResult: PropTypes.shape({
    success: PropTypes.bool,
    message: PropTypes.string,
    userText: PropTypes.string,
    originalText: PropTypes.string,
    evaluation: PropTypes.shape({
      level: PropTypes.string,
      message: PropTypes.string,
      color: PropTypes.string,
      score: PropTypes.number,
    }),
    confidence: PropTypes.number,
  }),
  onStartRecording: PropTypes.func.isRequired,
  onSkipRecording: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
};

/* ----------------------------- ClickableWord ----------------------------- */
const ClickableWord = ({
  word,
  isLast,
  onWordClick,
  activeWord,
  wordDefinitions,
  onPlayWordAudio,
}) => {
  const handleClick = useCallback(() => {
    const cleanWord = word.replace(/[.,!?;:'"]/g, "");
    const wordData = wordDefinitions[cleanWord];

    onPlayWordAudio(cleanWord);

    onWordClick({
      word: cleanWord,
      translation: wordData ? wordData.translation : "ترجمة غير متوفرة",
      definition: wordData ? wordData.definition : "Definition not available",
      partOfSpeech: wordData ? wordData.partOfSpeech : "word",
      rank: wordData ? wordData.rank : Math.floor(Math.random() * 1000) + 1,
    });
  }, [word, onWordClick, wordDefinitions, onPlayWordAudio]);

  const cleanWord = word.replace(/[.,!?;:'"]/g, "");
  const punctuation = word.slice(cleanWord.length);
  const isActive = activeWord === cleanWord;

  return (
    <>
      <span
        className={`text-black font-semibold text-xl hover:bg-blue-100 cursor-pointer rounded transition-all duration-200 ${
          isActive
            ? "border border-black p-1 bg-blue-50 shadow-sm"
            : "border border-transparent"
        }`}
        onClick={handleClick}
      >
        {cleanWord}
      </span>
      {punctuation && <span className="text-black">{punctuation}</span>}
      {!isLast && <span> </span>}
    </>
  );
};

ClickableWord.propTypes = {
  word: PropTypes.string.isRequired,
  isLast: PropTypes.bool.isRequired,
  onWordClick: PropTypes.func.isRequired,
  activeWord: PropTypes.string,
  wordDefinitions: PropTypes.object.isRequired,
  onPlayWordAudio: PropTypes.func.isRequired,
};

/* -------------------------------- Sentence ------------------------------- */
const Sentence = React.forwardRef(
  (
    {
      sentence,
      onWordClick,
      activeWord,
      isCurrentlyReading,
      wordDefinitions,
      pronunciationScore,
      onPlaySentenceAudio,
      onPlayWordAudio,
    },
    ref
  ) => {
    const words = sentence.text.split(" ");

    return (
      <div ref={ref} className="relative">
        <div className="flex items-center mb-2">
          <p
            className={`text-lg leading-relaxed w-fit text-gray-800 transition-all duration-500 rounded-lg ${
              isCurrentlyReading
                ? "underline underline-offset-8 decoration-4 decoration-red-500 shadow-xl transform scale-[1.02] bg-yellow-50 p-2"
                : "hover:bg-gray-50 p-2"
            }`}
          >
            {words.map((word, index) => (
              <ClickableWord
                key={index}
                word={word}
                isLast={index === words.length - 1}
                onWordClick={onWordClick}
                activeWord={activeWord}
                wordDefinitions={wordDefinitions}
                onPlayWordAudio={onPlayWordAudio}
              />
            ))}
          </p>

          {sentence.audioUrl && (
            <button
              onClick={() => onPlaySentenceAudio(sentence.audioUrl)}
              className="ml-2 p-2 bg-blue-100 hover:bg-blue-200 rounded-full"
              title="تشغيل الجملة"
            >
              <Volume2 size={16} className="text-blue-600" />
            </button>
          )}
        </div>

        {pronunciationScore && (
          <div
            className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              pronunciationScore >= 85
                ? "bg-green-100 text-green-800"
                : pronunciationScore >= 70
                ? "bg-blue-100 text-blue-800"
                : pronunciationScore >= 50
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {pronunciationScore}
          </div>
        )}
      </div>
    );
  }
);
Sentence.displayName = "Sentence";

Sentence.propTypes = {
  sentence: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    audioUrl: PropTypes.string,
  }).isRequired,
  onWordClick: PropTypes.func.isRequired,
  activeWord: PropTypes.string,
  isCurrentlyReading: PropTypes.bool,
  wordDefinitions: PropTypes.object.isRequired,
  pronunciationScore: PropTypes.number,
  onPlaySentenceAudio: PropTypes.func.isRequired,
  onPlayWordAudio: PropTypes.func.isRequired,
};

/* -------------------------------- Sidebar -------------------------------- */
const Sidebar = ({ isOpen, selectedWordData, onClose, onPlayWordAudio }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } lg:hidden`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 top-[50%] translate-y-[-50%] right-3 overflow-hidden rounded-3xl w-full max-w-xs sm:max-w-sm md:w-96 bg-white shadow-xl z-50 transform transition-all h-full duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-[135%]"
        } flex flex-col`}
      >
        <div className="flex justify-end p-4 sm:p-x-6">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 hover:rotate-90 transform origin-center"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {selectedWordData ? (
            <>
              <div className="bg-gradient-to-br from-[var(--secondary-color)] to-[var(--primary-color)] p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white break-all">
                    {selectedWordData.word}
                  </h2>
                  <button
                    onClick={() => onPlayWordAudio(selectedWordData.word)}
                    className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-200 active:scale-95 ml-2"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 size={20} className="text-blue-600" />
                  </button>
                </div>
                <p className="text-base sm:text-lg text-white font-medium mb-3 sm:mb-4">
                  {selectedWordData.translation}
                </p>
              </div>
              {selectedWordData.definition && (
                <div className="space-y-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Definition
                  </h4>
                  <p className="text-sm sm:text-base text-gray-700">
                    {selectedWordData.definition}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
              <BookOpen
                size={28}
                className="text-gray-300 mb-3 sm:mb-4 transition-all duration-500 hover:rotate-6"
              />
              <h4 className="text-base sm:text-lg font-medium text-gray-500 mb-1">
                No word selected
              </h4>
              <p className="text-xs sm:text-sm text-gray-400">
                Click on any word to see its details here
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  selectedWordData: PropTypes.shape({
    word: PropTypes.string,
    translation: PropTypes.string,
    definition: PropTypes.string,
    partOfSpeech: PropTypes.string,
    rank: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  onPlayWordAudio: PropTypes.func.isRequired,
};

/* ------------------------------- ShowLesson ------------------------------ */
export function ShowLesson() {
  const { levelId, lessonId } = useParams();
  const lessonIdNum = parseInt(lessonId);

  const currentLesson = levelsAndLesson
    .find((level) => level.id == levelId)
    .lessons.find((lesson) => lesson.id == lessonIdNum);
  const currentLevel = levelsAndLesson.find((level) => level.id == levelId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState(null);
  const [activeWord, setActiveWord] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [currentReadingSentenceId, setCurrentReadingSentenceId] =
    useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isWaitingForRecording, setIsWaitingForRecording] = useState(false);
  const [recordingResult, setRecordingResult] = useState(null);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [pronunciationEnabled, setPronunciationEnabled] = useState(true);
  const [pronunciationScores, setPronunciationScores] = useState({});
  const [microphonePermission, setMicrophonePermission] = useState(null);

  // Browser voices
  const [voices, setVoices] = useState([]);

  const readingTimeoutRef = useRef(null);
  const readingStateRef = useRef({
    isReading: false,
    currentIndex: 0,
    shouldStop: false,
  });
  const sentenceRefs = useRef({});
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Preload audio durations for the whole lesson
  useEffect(() => {
    let active = true;
    const loaders = [];
    if (currentLesson?.storyData?.content?.length) {
      currentLesson.storyData.content.forEach((s) => {
        if (s.audioUrl) {
          const a = new Audio();
          a.preload = "metadata";
          a.src = s.audioUrl;
          const onLoaded = () => {
            const d = Number.isFinite(a.duration) ? a.duration : 0;
            durationsRef.current[s.id] = d;
            if (active) {
              const total = Object.values(durationsRef.current).reduce(
                (acc, v) => acc + (Number.isFinite(v) ? v : 0),
                0
              );
              setLessonTotalDuration(total);
            }
          };
          a.addEventListener("loadedmetadata", onLoaded);
          loaders.push({ a, onLoaded });
        }
      });
    }
    return () => {
      active = false;
      loaders.forEach(({ a, onLoaded }) =>
        a.removeEventListener("loadedmetadata", onLoaded)
      );
    };
  }, [currentLesson]);

  // --- Player state ---
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // durations for each sentence id (from audio metadata)
  const durationsRef = useRef({});
  const [lessonTotalDuration, setLessonTotalDuration] = useState(0);
  const [lessonElapsed, setLessonElapsed] = useState(0);

  // Format mm:ss
  const fmt = (s) => {
    if (!Number.isFinite(s)) return "00:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const stepSeconds = (delta) => {
    if (audioRef.current && Number.isFinite(audioRef.current.currentTime)) {
      const next = Math.max(
        0,
        Math.min((audioRef.current.currentTime || 0) + delta, duration || 0)
      );
      audioRef.current.currentTime = next;
    }
  };

  const togglePlayPause = () => {
    if (isReading) {
      stopReading();
    } else {
      readAllSentences();
    }
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      try {
        audioRef.current.playbackRate = rate;
      } catch {}
    }
  };

  // Sum durations before a given sentence index
  const sumDurationsBeforeIndex = useCallback(
    (idx) => {
      if (!currentLesson?.storyData?.content) return 0;
      let sum = 0;
      for (let i = 0; i < idx; i++) {
        const sid = currentLesson.storyData.content[i].id;
        const d = durationsRef.current[sid] || 0;
        sum += Number.isFinite(d) ? d : 0;
      }
      return sum;
    },
    [currentLesson]
  );

  /* ------------------------------ Load voices ----------------------------- */
  useEffect(() => {
    if (!supportsTTS) return;
    const loadVoices = () =>
      setVoices(window.speechSynthesis.getVoices() || []);
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const pickVoice = useCallback(() => {
    if (!voices.length) return null;
    const byName = voices.find(
      (v) =>
        (v.name || "")
          .toLowerCase()
          .includes(PREFERRED_VOICE_NAME.toLowerCase()) ||
        (v.voiceURI || "")
          .toLowerCase()
          .includes(PREFERRED_VOICE_NAME.toLowerCase())
    );
    if (byName) return byName;
    const byLang = voices.find((v) =>
      (v.lang || "")
        .toLowerCase()
        .startsWith(PREFERRED_VOICE_LANG.toLowerCase())
    );
    if (byLang) return byLang;
    return voices.find((v) => (v.lang || "").startsWith("en")) || voices[0];
  }, [voices]);

  const speak = useCallback(
    (text) => {
      const toSay = (text || "").trim();
      if (!toSay) return;

      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }

      if (supportsTTS) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(toSay);
          const v = pickVoice();
          if (v) utter.voice = v;
          utter.lang = v?.lang || PREFERRED_VOICE_LANG || "en-US";
          utter.rate = Math.min(2, Math.max(0.5, playbackRate || 1));
          utter.pitch = 1;
          utter.volume = 1;
          window.speechSynthesis.speak(utter);
          return;
        } catch (e) {
          console.error("TTS failed, fallback to MP3:", e);
        }
      }

      // MP3 fallback
      const url = `https://cdn13674550.b-cdn.net/SNA-audio/words/${toSay.toLowerCase()}.mp3`;
      audioRef.current = new Audio(url);
      try {
        audioRef.current.playbackRate = playbackRate;
      } catch {}
      audioRef.current.play().catch((err) => {
        console.error("TTS+MP3 fallback failed:", err);
      });
    },
    [pickVoice, playbackRate]
  );

  /* -------------------------- Microphone permission -------------------------- */
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({
          name: "microphone",
        });
        setMicrophonePermission(permissionStatus.state);
        permissionStatus.onchange = () =>
          setMicrophonePermission(permissionStatus.state);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());
        setMicrophonePermission("granted");
      }
    } catch (error) {
      if (error.name === "NotAllowedError") setMicrophonePermission("denied");
      else setMicrophonePermission("prompt");
    }
  }, []);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicrophonePermission("granted");
      return true;
    } catch {
      setMicrophonePermission("denied");
      return false;
    }
  }, []);

  useEffect(() => {
    checkMicrophonePermission();
    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, [checkMicrophonePermission]);

  const initializeSpeechRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => setIsRecording(true);

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const confidence = event.results[0][0].confidence;
        handleRecognitionResult(transcript, confidence);
      };

      recognitionRef.current.onerror = (event) => {
        setIsRecording(false);
        setIsWaitingForRecording(false);
        if (event.error === "no-speech") {
          setRecordingResult({
            success: false,
            message: "لم يتم سماع أي صوت. حاول مرة أخرى.",
            userText: "",
            originalText:
              currentLesson?.storyData?.content[
                readingStateRef.current.currentIndex - 1
              ]?.text || "",
          });
          setShowRecordingModal(true);
        }
      };

      recognitionRef.current.onend = () => setIsRecording(false);
    } else {
      console.log("❌ Speech recognition not supported");
    }
  };

  /* --------------------------- Scroll to sentence --------------------------- */
  const scrollToCurrentSentence = useCallback(
    (sentenceId) => {
      if (autoScroll && sentenceRefs.current[sentenceId]) {
        sentenceRefs.current[sentenceId].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    [autoScroll]
  );

  /* --------------------------- Simple pronunciation eval -------------------------- */
  const calculateSimilarity = (text1, text2) => {
    const clean1 = text1
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();
    const clean2 = text2
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();
    const words1 = clean1.split(/\s+/);
    const words2 = clean2.split(/\s+/);
    let matches = 0;
    const maxLength = Math.max(words1.length, words2.length);
    words1.forEach((word, i) => {
      if (words2[i] && word === words2[i]) matches++;
    });
    return (matches / maxLength) * 100;
  };

  const evaluatePronunciation = (userText, originalText, confidence) => {
    const similarity = calculateSimilarity(userText, originalText);
    const confidenceScore = confidence * 100;
    const overallScore = similarity * 0.6 + confidenceScore * 0.4;
    if (overallScore >= 85)
      return {
        level: "excellent",
        message: "ممتاز! نطق رائع 🎉",
        color: "green",
        score: Math.round(overallScore),
      };
    if (overallScore >= 70)
      return {
        level: "good",
        message: "جيد جداً! 👏",
        color: "blue",
        score: Math.round(overallScore),
      };
    if (overallScore >= 50)
      return {
        level: "fair",
        message: "جيد، لكن يمكن تحسينه 💪",
        color: "yellow",
        score: Math.round(overallScore),
      };
    return {
      level: "poor",
      message: "حاول مرة أخرى 🔄",
      color: "red",
      score: Math.round(overallScore),
    };
  };

  const handleRecognitionResult = (transcript, confidence) => {
    const currentSentenceIndex = readingStateRef.current.currentIndex - 1;
    const originalSentence =
      currentLesson.storyData.content[currentSentenceIndex];
    if (originalSentence) {
      const evaluation = evaluatePronunciation(
        transcript,
        originalSentence.text,
        confidence
      );
      setRecordingResult({
        success: true,
        userText: transcript,
        originalText: originalSentence.text,
        evaluation,
        confidence: Math.round(confidence * 100),
      });
      setPronunciationScores((prev) => ({
        ...prev,
        [originalSentence.id]: evaluation.score,
      }));
      setShowRecordingModal(true);
      setIsWaitingForRecording(false);
    }
  };

  /* ------------------------- Recording (start/skip) ------------------------ */
  const startRecording = useCallback(async () => {
    if (!recognitionRef.current) {
      alert("التسجيل الصوتي غير مدعوم في متصفحك. جرب Chrome أو Edge");
      return;
    }
    try {
      if (microphonePermission === "denied") {
        const granted = await requestMicrophonePermission();
        if (!granted) {
          alert("تم رفض إذن الميكروفون. فعِّل الإذن من إعدادات المتصفح.");
          return;
        }
      }
      setRecordingResult(null);
      recognitionRef.current.start();
    } catch (error) {
      setIsRecording(false);
      setIsWaitingForRecording(false);
      if (error.name === "NotAllowedError") {
        setMicrophonePermission("denied");
        alert("تم رفض إذن الميكروفون. الرجاء السماح بالوصول للميكروفون.");
      }
    }
  }, [microphonePermission, requestMicrophonePermission]);

  const skipRecording = () => {
    setIsWaitingForRecording(false);
    setShowRecordingModal(false);
    continueToNextSentence();
  };

  const continueToNextSentence = () => {
    setShowRecordingModal(false);
    setRecordingResult(null);
    if (!readingStateRef.current.shouldStop) {
      readingTimeoutRef.current = setTimeout(() => {
        window.speakNextSentence?.();
      }, 1000);
    }
  };

  /* ------------------------------- Words/Sidebar ------------------------------ */
  const handleWordClick = useCallback((wordData) => {
    setSelectedWordData(wordData);
    setActiveWord(wordData.word);
    setSidebarOpen(true);
  }, []);

  const closeSidebar = () => {
    setSidebarOpen(false);
    setActiveWord(null);
  };

  /* ---------------------------- Play sentence audio --------------------------- */
  const playSentenceAudio = useCallback(
    (audioUrl) => {
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      try {
        audio.playbackRate = playbackRate;
      } catch {}

      audio.onloadedmetadata = () => {
        const d = Number.isFinite(audio.duration) ? audio.duration : 0;
        setDuration(d);
      };
      audio.ontimeupdate = () => {
        const now = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
        setCurrentTime(now);
        const base = sumDurationsBeforeIndex(
          readingStateRef.current.currentIndex
        );
        setLessonElapsed(base + now);
      };
      audio.onended = () => {
        setCurrentTime(0);
        const base = sumDurationsBeforeIndex(
          readingStateRef.current.currentIndex
        );
        setLessonElapsed(base);
      };
      audio.onerror = () => {
        setDuration(0);
        setCurrentTime(0);
      };

      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    },
    [playbackRate, sumDurationsBeforeIndex]
  );

  // Speak a single word
  const playWordAudio = useCallback(
    (word) => {
      const clean = (word || "").replace(/[^\w'-]/g, "");
      if (!clean) return;
      speak(clean);
    },
    [speak]
  );

  /* ------------------------------- Read all sentences ------------------------------ */
  const readAllSentences = useCallback(() => {
    if (!currentLesson || !currentLesson.storyData?.content?.length) return;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    readingStateRef.current = {
      isReading: true,
      currentIndex: 0,
      shouldStop: false,
    };
    setIsReading(true);
    setReadingProgress(0);
    setIsWaitingForRecording(false);
    setShowRecordingModal(false);

    const speakNextSentence = () => {
      const { currentIndex, shouldStop } = readingStateRef.current;
      const totalSentences = currentLesson.storyData.content.length;

      if (shouldStop || currentIndex >= totalSentences) {
        setIsReading(false);
        setCurrentReadingSentenceId(null);
        setReadingProgress(100);
        readingStateRef.current.isReading = false;
        if (loopEnabled && !shouldStop) {
          setTimeout(() => {
            if (!readingStateRef.current.shouldStop) readAllSentences();
          }, 400);
        }
        return;
      }

      const sentence = currentLesson.storyData.content[currentIndex];
      // set base elapsed so the total timer jumps immediately to the start of this sentence
      setLessonElapsed(sumDurationsBeforeIndex(currentIndex));
      const progress = ((currentIndex + 1) / totalSentences) * 100;

      setCurrentReadingSentenceId(sentence.id);
      setReadingProgress(progress);
      scrollToCurrentSentence(sentence.id);

      if (sentence.audioUrl) {
        playSentenceAudio(sentence.audioUrl);
        if (audioRef.current) {
          audioRef.current.onended = () => {
            if (!readingStateRef.current.shouldStop) {
              readingStateRef.current.currentIndex++;
              if (pronunciationEnabled) {
                // فتح المودل تلقائياً بدلاً من إظهار الـ CTA
                setIsWaitingForRecording(true);
                setShowRecordingModal(true);
              } else {
                readingTimeoutRef.current = setTimeout(speakNextSentence, 500);
              }
            }
          };

          audioRef.current.onerror = () => {
            if (!readingStateRef.current.shouldStop) {
              readingStateRef.current.currentIndex++;
              if (pronunciationEnabled) {
                // فتح المودل تلقائياً بدلاً من إظهار الـ CTA
                setIsWaitingForRecording(true);
                setShowRecordingModal(true);
              } else {
                readingTimeoutRef.current = setTimeout(speakNextSentence, 500);
              }
            }
          };
        }
      } else {
        readingStateRef.current.currentIndex++;
        if (pronunciationEnabled) {
          // فتح المودل تلقائياً للجمل التي ليس لها ملف صوتي
          setIsWaitingForRecording(true);
          setShowRecordingModal(true);
        } else {
          readingTimeoutRef.current = setTimeout(speakNextSentence, 1000);
        }
      }
    };

    // expose to continue after recording
    window.speakNextSentence = speakNextSentence;
    speakNextSentence();
  }, [
    currentLesson,
    scrollToCurrentSentence,
    pronunciationEnabled,
    playSentenceAudio,
    loopEnabled,
    sumDurationsBeforeIndex,
  ]);

  /* --------------------------------- Stop -------------------------------- */
  const stopReading = useCallback(() => {
    readingStateRef.current.shouldStop = true;
    readingStateRef.current.isReading = false;

    setIsReading(false);
    setCurrentReadingSentenceId(null);
    setReadingProgress(0);
    setIsWaitingForRecording(false);
    setShowRecordingModal(false);

    if (recognitionRef.current && isRecording) recognitionRef.current.abort();
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
    }
    if (readingTimeoutRef.current) {
      clearTimeout(readingTimeoutRef.current);
      readingTimeoutRef.current = null;
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setCurrentTime(0);
    setDuration(0);
    readingStateRef.current.currentIndex = 0;
  }, [isRecording]);

  useEffect(() => {
    return () => {
      readingStateRef.current.shouldStop = true;
      if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, []);

  /* ---------------------------------- UI ---------------------------------- */
  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Lesson not found
          </h2>
          <p className="text-gray-500">
            The requested lesson could not be found.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MicrophonePermissionAlert
        permission={microphonePermission}
        onRequestPermission={requestMicrophonePermission}
      />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="p-2 text-[var(--secondary-color)] hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={29} />
            </Link>
            {isReading && (
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300 ease-out"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {Math.round(readingProgress)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
            <img
              src={currentLevel.image}
              alt={currentLevel.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 ">
              {currentLesson.title}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base line-clamp-2">
              {currentLesson.description}
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-24">
          {currentLesson.storyData.content.map((sentence) => (
            <Sentence
              key={sentence.id}
              ref={(el) => (sentenceRefs.current[sentence.id] = el)}
              sentence={sentence}
              onWordClick={handleWordClick}
              activeWord={activeWord}
              isCurrentlyReading={currentReadingSentenceId === sentence.id}
              wordDefinitions={currentLesson.wordDefinitions}
              pronunciationScore={pronunciationScores[sentence.id]}
              onPlaySentenceAudio={playSentenceAudio}
              onPlayWordAudio={playWordAudio}
            />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        selectedWordData={selectedWordData}
        onClose={closeSidebar}
        onPlayWordAudio={playWordAudio}
      />

      {/* Recording modal */}
      <RecordingModal
        isOpen={showRecordingModal}
        isRecording={isRecording}
        isWaitingForRecording={isWaitingForRecording}
        recordingResult={recordingResult}
        onStartRecording={startRecording}
        originalText={
          currentLesson?.storyData?.content?.[
            readingStateRef.current.currentIndex - 1
          ]?.text || ""
        }
        onSkipRecording={skipRecording}
        onContinue={continueToNextSentence}
      />

      {/* Mini Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-4xl">
          <div className="mx-4 mb-3 rounded-2xl bg-white shadow-[0_-6px_24px_rgba(0,0,0,0.08)] border border-gray-100">
            {/* Progress bar */}
            <div
              className="h-1 w-full bg-gray-200 rounded-t-2xl overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (
                  !audioRef.current ||
                  !Number.isFinite(duration) ||
                  duration === 0
                )
                  return;
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.min(
                  1,
                  Math.max(0, (e.clientX - rect.left) / rect.width)
                );
                const t = ratio * duration;
                audioRef.current.currentTime = t;
              }}
            >
              <div
                className="h-full bg-[var(--primary-color)] transition-[width]"
                style={{
                  width: lessonTotalDuration
                    ? `${
                        (Math.min(lessonElapsed, lessonTotalDuration) /
                          lessonTotalDuration) *
                        100
                      }%`
                    : duration
                    ? `${(Math.min(currentTime, duration) / duration) * 100}%`
                    : `${readingProgress}%`,
                }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between px-4 py-2">
              {/* Left: play/skip/loop */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary-color)] text-white hover:bg-[var(--secondary-color)] transition-colors"
                  title={isReading ? "إيقاف" : "تشغيل"}
                >
                  {isReading ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  onClick={() => stepSeconds(-5)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 grid place-items-center"
                  title="رجوع 5 ثوانٍ"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={() => stepSeconds(5)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 grid place-items-center"
                  title="تقديم 5 ثوانٍ"
                >
                  <RotateCcw size={18} className="-scale-x-100" />
                </button>

                <button
                  onClick={() => setLoopEnabled((v) => !v)}
                  className={`w-9 h-9 rounded-full grid place-items-center ${
                    loopEnabled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  } hover:bg-emerald-100`}
                  title="تكرار الدرس"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17 1l4 4-4 4V6H7a3 3 0 00-3 3v2H2V9a5 5 0 015-5h10V1zm-10 22l-4-4 4-4v3h10a3 3 0 003-3v-2h2v2a5 5 0 01-5 5H7v3z" />
                  </svg>
                </button>
              </div>

              {/* Center: time */}
              <div className="flex items-center gap-1 text-[11px] text-gray-600">
                <span className="tabular-nums">
                  {lessonTotalDuration
                    ? fmt(lessonElapsed)
                    : fmt(currentTime) || "00:00"}{" "}
                </span>
                <span className="text-gray-300">/</span>
                <span className="tabular-nums">
                  {lessonTotalDuration
                    ? fmt(lessonTotalDuration)
                    : duration
                    ? fmt(duration)
                    : `${Math.round(readingProgress)}%`}
                </span>
              </div>

              {/* Right: speed & expand */}
              <div className="relative flex items-center gap-2">
                <div className="group relative">
                  <button
                    className="px-3 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium"
                    title="السرعة"
                  >
                    {playbackRate.toFixed(2).replace(/\.00$/, "")}x ▾
                  </button>
                  <div className="absolute -right-2 bottom-9 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {[0.75, 1, 1.25, 1.5, 1.75].map((r) => (
                      <button
                        key={r}
                        onClick={() => handleSpeedChange(r)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          Math.abs(playbackRate - r) < 0.001
                            ? "text-[var(--primary-color)] bg-gray-50 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {r}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz FAB */}
      <Link
        to={`/level/${levelId}/lesson/${lessonId}/quiz`}
        className="fixed bottom-20 right-6 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
        style={{ width: "60px", height: "60px" }}
      >
        <PiExam size={30} />
      </Link>
    </div>
  );
}
