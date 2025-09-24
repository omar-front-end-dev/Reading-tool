import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { X, Play, Pause, RotateCcw, Volume2, BookOpen, Languages } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { levelsAndLesson } from "../../config/levelsAndLesson/levelsAndLesson";

/* ------------------------------------------------------------------ */
/* TTS support + config                                               */
/* ------------------------------------------------------------------ */
const supportsTTS =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

const PREFERRED_VOICE_NAME = "Google UK English Female";
const PREFERRED_VOICE_LANG = "en-GB";

/* ------------------------------------------------------------------ */
/* Helper: quick Arabic fallback from wordDefinitions                 */
/* ------------------------------------------------------------------ */
const translateOnTheFly = (text, dict = {}) => {
  if (!text) return "";
  return text
    .split(/\s+/)
    .map((w) => {
      const clean = w.replace(/[.,!?;:'"]/g, "");
      return (
        dict[clean]?.translation || dict[clean.toLowerCase()]?.translation || w
      );
    })
    .join(" ");
};

/* ------------------------------------------------------------------ */
/* Sidebar                                                            */
/* ------------------------------------------------------------------ */
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
  isOpen: PropTypes.bool,
  selectedWordData: PropTypes.object,
  onClose: PropTypes.func,
  onPlayWordAudio: PropTypes.func,
};

/* ------------------------------------------------------------------ */
/* Microphone permission alert                                        */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* ClickableWord                                                      */
/* ------------------------------------------------------------------ */
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

/* Sentence                                                           */
/* ------------------------------------------------------------------ */
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
      showTranslation,
    },
    ref
  ) => {
    const words = sentence.text.split(" ");
    const arabicLine =
      sentence.translationAr ||
      translateOnTheFly(sentence.text, wordDefinitions);

    return (
      <div ref={ref} className="relative">
        <div className="flex items-center mb-2">
          <p
            className={`text-lg leading-relaxed w-fit text-gray-800 transition-all duration-500 rounded-lg ${
              isCurrentlyReading
                ? "underline underline-offset-8 decoration-4 decoration-red-500 shadow-xl transform scale-[1.02] bg-yellow-50 p-2"
                : "hover:bg-gray-50 "
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

        {/* Arabic translation under the English line - with transition */}
        {arabicLine && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showTranslation ? "max-h-20 opacity-100 mb-2" : "max-h-0 opacity-0"
            }`}
          >
            <p className="arabic_font text-base text-gray-700 pr-1">
              {arabicLine}
            </p>
          </div>
        )}

        {typeof pronunciationScore === "number" && (
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
    translationAr: PropTypes.string,
  }).isRequired,
  onWordClick: PropTypes.func.isRequired,
  activeWord: PropTypes.string,
  isCurrentlyReading: PropTypes.bool,
  wordDefinitions: PropTypes.object.isRequired,
  pronunciationScore: PropTypes.number,
  onPlaySentenceAudio: PropTypes.func.isRequired,
  onPlayWordAudio: PropTypes.func.isRequired,
  showTranslation: PropTypes.bool.isRequired,
};

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
export function ShowLessonSecondRound() {
  const { levelId, lessonId } = useParams();
  const levelIdNum = Number(levelId);
  const lessonIdNum = Number(lessonId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState(null);
  const [showTranslations, setShowTranslations] = useState(false); // New state for translation toggle

  const currentLevel = levelsAndLesson.find((level) => level.id === levelIdNum);
  const currentLesson =
    currentLevel?.lessons.find((lesson) => lesson.id === lessonIdNum) || null;

  const [activeWord, setActiveWord] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [currentReadingSentenceId, setCurrentReadingSentenceId] =
    useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [pronunciationScores, setPronunciationScores] = useState({});
  const [microphonePermission, setMicrophonePermission] = useState(null);

  // voices
  const [voices, setVoices] = useState([]);

  // refs
  const readingTimeoutRef = useRef(null);
  const readingStateRef = useRef({
    isReading: false,
    currentIndex: 0,
    shouldStop: false,
  });
  const sentenceRefs = useRef({});
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // player state
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const durationsRef = useRef({});
  const [lessonTotalDuration, setLessonTotalDuration] = useState(0);
  const [lessonElapsed, setLessonElapsed] = useState(0);

  const [showEndActions, setShowEndActions] = useState(false);
  const [noPauseBetween, setNoPauseBetween] = useState(true);

  // set the required next-round URL
  const NEXT_ROUND_URL = `/show-lesson/${levelId}/${lessonId}`;

  /* ---------------- Preload audio durations ---------------- */
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

  /* ---------------- Helpers ---------------- */
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
      setShowEndActions(false);
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

  /* ---------------- Voices ---------------- */
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
    const byName =
      voices.find(
        (v) =>
          (v.name || "")
            .toLowerCase()
            .includes(PREFERRED_VOICE_NAME.toLowerCase()) ||
          (v.voiceURI || "")
            .toLowerCase()
            .includes(PREFERRED_VOICE_NAME.toLowerCase())
      ) || null;
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

  /* ---------------- Mic permission + speech recognition ---------------- */
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

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const confidence = event.results[0][0].confidence;
        handleRecognitionResult(transcript, confidence);
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error === "no-speech") {
          const currentSentenceIndex = readingStateRef.current.currentIndex - 1;
          const originalText =
            currentLesson?.storyData?.content?.[currentSentenceIndex]?.text ||
            "";
          console.warn("No speech detected. Original text:", originalText);
        }
      };
    } else {
      console.log("❌ Speech recognition not supported");
    }
  };

  /* ---------------- Scroll helper ---------------- */
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

  /* ---------------- Pronunciation scoring (simple) ---------------- */
  const calculateSimilarity = (text1, text2) => {
    const clean = (t) =>
      t
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();
    const words1 = clean(text1).split(/\s+/);
    const words2 = clean(text2).split(/\s+/);
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
    const score = Math.round(overallScore);
    if (overallScore >= 85)
      return {
        level: "excellent",
        message: "ممتاز! نطق رائع 🎉",
        color: "green",
        score,
      };
    if (overallScore >= 70)
      return { level: "good", message: "جيد جداً! 👏", color: "blue", score };
    if (overallScore >= 50)
      return {
        level: "fair",
        message: "جيد، لكن يمكن تحسينه 💪",
        color: "yellow",
        score,
      };
    return { level: "poor", message: "حاول مرة أخرى 🔄", color: "red", score };
  };

  const handleRecognitionResult = (transcript, confidence) => {
    const currentSentenceIndex = readingStateRef.current.currentIndex - 1;
    const originalSentence =
      currentLesson?.storyData?.content?.[currentSentenceIndex];
    if (originalSentence) {
      const evaluation = evaluatePronunciation(
        transcript,
        originalSentence.text,
        confidence
      );
      setPronunciationScores((prev) => ({
        ...prev,
        [originalSentence.id]: evaluation.score,
      }));
    }
  };

  /* ---------------- Word click (open sidebar) ---------------- */
  const handleWordClick = useCallback((wordData) => {
    setSelectedWordData(wordData);
    setActiveWord(wordData.word);
    setSidebarOpen(true);
  }, []);
  const closeSidebar = () => {
    setSidebarOpen(false);
    setActiveWord(null);
  };

  /* ---------------- Manual sentence audio play ---------------- */
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
      };
      audio.onended = () => {
        setCurrentTime(0);
      };
      audio.onerror = () => {
        setDuration(0);
        setCurrentTime(0);
      };

      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    },
    [playbackRate]
  );

  /* ---------------- Word speak ---------------- */
  const playWordAudio = useCallback(
    (word) => {
      const clean = (word || "").replace(/[^\w'-]/g, "");
      if (!clean) return;
      speak(clean);
    },
    [speak]
  );

  /* ---------------- Read all sentences (auto/continuous) ---------------- */
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

    const speakNextSentence = () => {
      const { currentIndex, shouldStop } = readingStateRef.current;
      const totalSentences = currentLesson.storyData.content.length;

      if (shouldStop || currentIndex >= totalSentences) {
        setIsReading(false);
        setCurrentReadingSentenceId(null);
        setReadingProgress(100);
        readingStateRef.current.isReading = false;

        // show end actions panel
        setShowEndActions(true);

        if (loopEnabled && !shouldStop) {
          setTimeout(() => {
            if (!readingStateRef.current.shouldStop) readAllSentences();
          }, 200);
        }
        return;
      }

      const sentence = currentLesson.storyData.content[currentIndex];

      setLessonElapsed(sumDurationsBeforeIndex(currentIndex));
      const progress = ((currentIndex + 1) / totalSentences) * 100;
      setCurrentReadingSentenceId(sentence.id);
      setReadingProgress(progress);
      scrollToCurrentSentence(sentence.id);

      if (sentence.audioUrl) {
        const audio = new Audio(sentence.audioUrl);
        audioRef.current = audio;
        try {
          audio.playbackRate = playbackRate;
        } catch {}

        audio.onloadedmetadata = () => {
          const d = Number.isFinite(audio.duration) ? audio.duration : 0;
          setDuration(d);
        };
        audio.ontimeupdate = () => {
          const now = Number.isFinite(audio.currentTime)
            ? audio.currentTime
            : 0;
          setCurrentTime(now);
          const base = sumDurationsBeforeIndex(
            readingStateRef.current.currentIndex
          );
          setLessonElapsed(base + now);
        };

        const advance = () => {
          if (readingStateRef.current.shouldStop) return;

          if (noPauseBetween) {
            readingStateRef.current.currentIndex++;
            speakNextSentence();
            return;
          }

          if (recognitionRef.current?.start) {
            recognitionRef.current.onend = () => {
              recognitionRef.current.onend = null;
              readingStateRef.current.currentIndex++;
              speakNextSentence();
            };
            recognitionRef.current.start();
          } else {
            readingStateRef.current.currentIndex++;
            speakNextSentence();
          }
        };

        audio.onended = advance;
        audio.onerror = advance;

        audio.play().catch((err) => {
          console.error("Error playing audio:", err);
          advance();
        });
      } else {
        readingStateRef.current.currentIndex++;
        speakNextSentence();
      }
    };

    window.speakNextSentence = speakNextSentence;
    speakNextSentence();
  }, [
    currentLesson,
    scrollToCurrentSentence,
    loopEnabled,
    sumDurationsBeforeIndex,
    playbackRate,
    noPauseBetween,
  ]);

  /* ---------------- Stop reading ---------------- */
  const stopReading = useCallback(() => {
    readingStateRef.current.shouldStop = true;
    readingStateRef.current.isReading = false;

    setIsReading(false);
    setCurrentReadingSentenceId(null);
    setReadingProgress(0);

    recognitionRef.current?.abort?.();

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
  }, []);

  /* ---------------- Cleanup ---------------- */
  useEffect(() => {
    return () => {
      readingStateRef.current.shouldStop = true;
      if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);
      recognitionRef.current?.abort?.();
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

  /* ---------------- UI ---------------- */
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
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        selectedWordData={selectedWordData}
        onClose={closeSidebar}
        onPlayWordAudio={playWordAudio}
      />

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
          </div>
          
          {/* Translation Toggle Button */}
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
              showTranslations 
                ? "bg-[var(--primary-color)] text-white shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title={showTranslations ? "إخفاء الترجمة" : "إظهار الترجمة"}
          >
            <Languages size={20} />
            <span className="text-sm arabic_font font-medium">
              {showTranslations ? "إخفاء الترجمة" : "إظهار الترجمة"}
            </span>
          </button>
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
              showTranslation={showTranslations}
            />
          ))}
        </div>
      </div>

      {/* End-of-lesson actions (responsive) */}
      {showEndActions && (
        <div
          className="fixed inset-x-3 bottom-24 sm:bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto w-full max-w-[680px] bg-white/95 backdrop-blur border border-gray-200 shadow-xl rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <span className="arabic_font text-sm sm:text-base text-gray-700 text-center sm:text-right">
                انتهت الجولة 🎉
              </span>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowEndActions(false);
                    readingStateRef.current = {
                      isReading: true,
                      currentIndex: 0,
                      shouldStop: false,
                    };
                    setIsReading(true);
                    setReadingProgress(0);
                    readAllSentences();
                  }}
                  className="arabic_font w-full sm:w-auto text-sm px-4 py-2 rounded-full bg-[var(--secondary-color)] text-white hover:bg-[var(--primary-color)] active:scale-[.98] transition"
                >
                  ابدأ من جديد
                </button>

                <Link
                  to={NEXT_ROUND_URL}
                  className="arabic_font w-full sm:w-auto text-sm px-4 py-2 rounded-full bg-[var(--primary-color)] text-white hover:bg-[var(--secondary-color)] active:scale-[.98] transition text-center"
                >
                  الذهاب إلى الجولة الثالثة
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Player */}
      <div className="fixed z-50 bottom-0 left-0 right-0">
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
              {/* Left: play / skip */}
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
              </div>

              {/* Center: time */}
              <div className="flex items-center gap-1 text-[11px] text-gray-600">
                <span className="tabular-nums">
                  {lessonTotalDuration ? fmt(lessonElapsed) : fmt(currentTime)}
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

              {/* Right: speed */}
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
    </div>
  );
}