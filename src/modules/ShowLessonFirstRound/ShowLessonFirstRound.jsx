import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { X, Volume2, BookOpen } from "lucide-react";
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
        <div className="flex justify-end p-4 sm:px-6">
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

/* ------------------------------------------------------------------ */
/* Sentence (simplified: no ref, no highlight/progress badge)         */
/* ------------------------------------------------------------------ */
const Sentence = ({
  sentence,
  onWordClick,
  activeWord,
  wordDefinitions,
  onPlaySentenceAudio,
  onPlayWordAudio,
}) => {
  const words = sentence.text.split(" ");

  return (
    <div className="relative">
      <div className="flex items-center mb-2">
        <p className={`text-lg leading-relaxed w-fit text-gray-800`}>
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
    </div>
  );
};

Sentence.propTypes = {
  sentence: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    audioUrl: PropTypes.string,
    translationAr: PropTypes.string,
  }).isRequired,
  onWordClick: PropTypes.func.isRequired,
  activeWord: PropTypes.string,
  wordDefinitions: PropTypes.object.isRequired,
  onPlaySentenceAudio: PropTypes.func.isRequired,
  onPlayWordAudio: PropTypes.func.isRequired,
};

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
export function ShowLessonFirstRound() {
  const { levelId, lessonId } = useParams();
  const levelIdNum = Number(levelId);
  const lessonIdNum = Number(lessonId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState(null);
  const [activeWord, setActiveWord] = useState(null);

  const currentLevel = levelsAndLesson.find((level) => level.id === levelIdNum);
  const currentLesson =
    currentLevel?.lessons.find((lesson) => lesson.id === lessonIdNum) || null;

  // TTS voices
  const [voices, setVoices] = useState([]);
  const audioRef = useRef(null);

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

      // stop any audio
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
          utter.rate = 1; // fixed, simpler UI
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
        audioRef.current.playbackRate = 1;
      } catch {}
      audioRef.current.play().catch((err) => {
        console.error("TTS+MP3 fallback failed:", err);
      });
    },
    [pickVoice]
  );

  /* ---------------- Manual sentence audio play ---------------- */
  const playSentenceAudio = useCallback((audioUrl) => {
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
      audio.playbackRate = 1;
    } catch {}
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  }, []);

  /* ---------------- Word speak ---------------- */
  const playWordAudio = useCallback(
    (word) => {
      const clean = (word || "").replace(/[^\w'-]/g, "");
      if (!clean) return;
      speak(clean);
    },
    [speak]
  );

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

  /* ---------------- Cleanup ---------------- */
  useEffect(() => {
    return () => {
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

  const NEXT_ROUND_URL = `/show-lesson-second-round/${levelId}/${lessonId}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        selectedWordData={selectedWordData}
        onClose={closeSidebar}
        onPlayWordAudio={playWordAudio}
      />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 text-[var(--secondary-color)] hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={29} />
            </Link>
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
              sentence={sentence}
              onWordClick={handleWordClick}
              activeWord={activeWord}
              wordDefinitions={currentLesson.wordDefinitions}
              onPlaySentenceAudio={playSentenceAudio}
              onPlayWordAudio={playWordAudio}
            />
          ))}
        </div>
      </div>

      {/* Next round button */}
      <Link
        to={NEXT_ROUND_URL}
        className="fixed bottom-6 right-6 arabic_font text-sm font-medium px-5 py-3 rounded-full bg-[var(--primary-color)] text-white hover:bg-[var(--secondary-color)] active:scale-[.98] transition shadow-xl"
      >
        الذهاب إلى الجولة التالية
      </Link>
    </div>
  );
}
