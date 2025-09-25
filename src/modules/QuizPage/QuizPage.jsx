import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { levelsAndLesson } from "../../config/levelsAndLesson/levelsAndLesson";
import {
  ArrowLeft,
  Award,
  BarChart3,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";

// مكون الاحتفال بالورق المتطاير
const ConfettiCelebration = ({ show, onComplete }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (show) {
      // إنشاء قطع الورق المتطاير - عدد أكبر
      const pieces = [];
      for (let i = 0; i < 100; i++) {
        // زاد من 50 إلى 100
        pieces.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 2, // تقليل التأخير
          duration: 4 + Math.random() * 2, // مدة أطول
          color: [
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
            "#FFA07A",
            "#98D8C8",
            "#F7DC6F",
            "#BB8FCE",
            "#85C1E9",
            "#FF69B4",
            "#32CD32",
            "#FFD700",
            "#FF4500",
          ][Math.floor(Math.random() * 12)], // ألوان أكثر
          size: 12 + Math.random() * 10, // حجم أكبر (كان 8-14، أصبح 12-22)
          rotation: Math.random() * 360,
        });
      }
      setConfettiPieces(pieces);

      // إزالة الاحتفال بعد 5 ثوانِ
      const timer = setTimeout(() => {
        onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animation: `confettiAnimation ${piece.duration}s ease-out ${piece.delay}s forwards`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
};

export const QuizPage = () => {
  const { levelId, lessonId } = useParams();
  const levelIdNum = parseInt(levelId);
  const lessonIdNum = parseInt(lessonId);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [progress, setProgress] = useState({});
  const [questions, setQuestions] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // مسارات الملفات الصوتية - يمكنك تغييرها حسب مسارات ملفاتك
  const soundFiles = {
    correct: "/assets/sounds/rightanswer-95219.mp3", // صوت الإجابة الصحيحة
    incorrect: "/assets/sounds/error-04-199275.mp3", // صوت الإجابة الخاطئة
    complete: "/assets/sounds/accepter-2-394924.mp3", // صوت إكمال الاختبار
    click: "/assets/sounds/mouse-click-4-393911.mp3", // صوت النقر
  };

  const playSound = (soundType) => {
    if (!soundEnabled) return;

    try {
      const audio = new Audio(soundFiles[soundType]);
      audio.volume = 0.7;
      audio.play().catch((error) => {
        console.log("Sound play error:", error);
      });
    } catch (error) {
      console.log("Sound error:", error);
    }
  };

  // البحث عن المستوى والدرس المناسبين
  const currentLevel = levelsAndLesson.find((level) => level.id === levelIdNum);
  const currentLesson = currentLevel?.lessons.find(
    (lesson) => lesson.id === lessonIdNum
  );

  // البحث عن الدرس التالي
  const getCurrentLessonIndex = () => {
    if (!currentLevel || !currentLesson) return -1;
    return currentLevel.lessons.findIndex(
      (lesson) => lesson.id === lessonIdNum
    );
  };

  const getNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (
      currentIndex === -1 ||
      currentIndex === currentLevel.lessons.length - 1
    ) {
      return null;
    }
    return currentLevel.lessons[currentIndex + 1];
  };

  const nextLesson = getNextLesson();

  console.log(currentLevel);

  useEffect(() => {
    if (currentLesson) {
      const generatedQuestions = generateQuestionsFromLesson(currentLesson);
      setQuestions(generatedQuestions);
    }

    const savedProgress =
      JSON.parse(localStorage.getItem("quizProgress")) || {};
    setProgress(savedProgress);
  }, [currentLesson]);

  const generateQuestionsFromLesson = (lesson) => {
    if (!lesson) return [];

    const questions = [];
    const wordDefinitions = lesson.wordDefinitions;
    const words = Object.keys(wordDefinitions);

    // توليد عدد عشوائي من الأسئلة بين 5 و 10
    const minQuestions = 5;
    const maxQuestions = 10;
    const numberOfQuestions =
      Math.floor(Math.random() * (maxQuestions - minQuestions + 1)) +
      minQuestions;

    // التأكد من أن عدد الكلمات المتاحة كافي لعدد الأسئلة المطلوب
    const availableWords = Math.min(numberOfQuestions, words.length);

    // ناخد كلمات بشكل عشوائي حسب العدد المحدد
    shuffleArray(words)
      .slice(0, availableWords)
      .forEach((word) => {
        const correctAnswer = wordDefinitions[word].translation;
        const wrongAnswers = shuffleArray(
          Object.values(wordDefinitions)
            .map((item) => item.translation)
            .filter((t) => t !== correctAnswer)
        ).slice(0, 3);

        questions.push({
          question: `ما معنى كلمة "${word}"؟`,
          options: shuffleArray([correctAnswer, ...wrongAnswers]),
          correctAnswer: correctAnswer,
          type: "vocabulary",
        });
      });

    return questions;
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleAnswerClick = (option) => {
    setSelectedAnswer(option);

    // تشغيل الصوت المناسب
    if (option === questions[currentQuestion].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
      playSound("correct");
    } else {
      playSound("incorrect");
    }

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedAnswer(null);
      } else {
        setShowScore(true);
        // تشغيل صوت الإكمال
        setTimeout(() => playSound("complete"), 500);
      }
    }, 1000);
  };

  useEffect(() => {
    if (showScore) {
      saveProgress();
      // تشغيل الاحتفال إذا كانت النسبة أكبر من 50%
      const successPercentage = (score / questions.length) * 100;
      if (successPercentage > 50) {
        setTimeout(() => setShowConfetti(true), 1000);
      }
    }
  }, [showScore, score, questions.length]);

  const saveProgress = () => {
    const progressKey = `level-${levelId}-lesson-${lessonId}`;
    const newProgress = {
      ...progress,
      [progressKey]: {
        score: score,
        total: questions.length,
        completed: true,
        date: new Date().toISOString(),
        levelId: levelIdNum,
        lessonId: lessonIdNum,
        levelTitle: currentLevel.levelTitle,
        lessonTitle: currentLesson.title,
      },
    };

    setProgress(newProgress);
    localStorage.setItem("quizProgress", JSON.stringify(newProgress));
  };

  const getAnswerClass = (option) => {
    if (!selectedAnswer) return "";

    if (option === questions[currentQuestion].correctAnswer) {
      return "bg-green-100 border-green-500 text-green-800";
    }

    if (
      option === selectedAnswer &&
      option !== questions[currentQuestion].correctAnswer
    ) {
      return "bg-red-100 border-red-500 text-red-800";
    }

    return "";
  };

  if (!currentLevel || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="arabic_font text-2xl font-semibold text-gray-700 mb-2">
            الدرس غير موجود
          </h2>
          <Link to="/" className="arabic_font text-blue-500 hover:underline">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="arabic_font min-h-screen bg-gray-50 flex items-center justify-center">
        جاري تحميل الأسئلة...
      </div>
    );
  }

  return (
    <>
      {/* CSS للاحتفال والتأثيرات */}
      <style>{`
        @keyframes confettiAnimation {
          0% {
            transform: translateY(-30vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes bounceGentle {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .animate-bounce-gentle {
          animation: bounceGentle 2s infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <Link
              to={`/show-lesson/${levelId}/${lessonId}`}
              className="arabic_font flex items-center justify-end text-lg text-[var(--secondary-color)] hover:text-teal-700 mb-6"
            >
              <ArrowLeft size={20} className="ml-1" />
              العودة إلى الدرس
            </Link>

            {/* زر التحكم في الصوت */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) {
                  playSound("click");
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={soundEnabled ? "إيقاف الصوت" : "تشغيل الصوت"}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span className="arabic_font text-sm">
                {soundEnabled ? "الصوت مفعل" : "الصوت معطل"}
              </span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              {/* اليسار: صورة + العنوان */}
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                  <img
                    src={currentLevel.image}
                    alt={currentLevel.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                  <h2 className="text-xs sm:text-sm text-gray-500">
                    {currentLevel.levelTitle}
                  </h2>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                    {currentLesson.title}
                  </h1>
                </div>
              </div>

              {/* اليمين: عدّاد السؤال */}
              <span className="arabic_font text-center bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 py-1 rounded-full">
                سؤال {currentQuestion + 1} من {questions.length}
              </span>
            </div>

            {/* الوصف */}
            <p className="text-gray-600 text-sm sm:text-base mb-6 text-center sm:text-left">
              {currentLesson.description}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {showScore ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center relative">
              {/* الاحتفال بالورق المتطاير */}
              <ConfettiCelebration
                show={showConfetti}
                onComplete={() => setShowConfetti(false)}
              />

              <div className="flex justify-center mb-6">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    Math.round((score / questions.length) * 100) > 50
                      ? "bg-green-100 animate-bounce-gentle"
                      : "bg-gray-100"
                  }`}
                >
                  <Award
                    size={48}
                    className={
                      Math.round((score / questions.length) * 100) > 50
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  />
                </div>
              </div>

              <h2
                className={`arabic_font text-2xl font-bold mb-2 ${
                  Math.round((score / questions.length) * 100) > 50
                    ? "text-green-600"
                    : "text-gray-800"
                }`}
              >
                {Math.round((score / questions.length) * 100) > 50
                  ? "مبروك! أداء ممتاز! 🎉"
                  : "تهانينا! لقد أكملت الاختبار"}
              </h2>
              <p className="arabic_font text-lg text-gray-600 mb-2">
                درجتك: <span className="font-bold">{score}</span> من{" "}
                <span className="arabic_font font-bold">
                  {questions.length}
                </span>
              </p>
              <p className="arabic_font text-gray-500 mb-6">
                نسبة النجاح:{" "}
                <span
                  className={`font-bold arabic_font ${
                    Math.round((score / questions.length) * 100) > 50
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  %{Math.round((score / questions.length) * 100)}
                </span>
              </p>

              {/* رسالة تشجيعية إضافية للنجاح */}
              {Math.round((score / questions.length) * 100) > 50 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="arabic_font text-green-800 font-medium">
                    أحسنت! لقد تجاوزت المستوى المطلوب بنجاح 🌟
                  </p>
                </div>
              )}

              <div className="flex flex-col justify-center gap-4">
                <Link
                  to={`/show-lesson/${levelId}/${lessonId}`}
                  onClick={() => playSound("click")}
                  className="arabic_font bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  العودة إلى الدرس
                </Link>

                {/* زر الدرس التالي - يظهر فقط إذا كان هناك درس تالي */}
                {nextLesson && (
                  <Link
                    to={`/show-lesson/${levelId}/${nextLesson.id}`}
                    onClick={() => playSound("click")}
                    className="arabic_font gap-2 flex items-center justify-center bg-[var(--secondary-color)] hover:bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} className="ml-1" />
                    الدرس التالي: {nextLesson.title}
                  </Link>
                )}

                <Link
                  to="/progress"
                  onClick={() => playSound("click")}
                  className="arabic_font gap-2 flex items-center justify-center text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <BarChart3 size={20} className="ml-1" />
                  عرض التقدم
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="arabic_font text-xl font-semibold text-gray-800 mb-6">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(option)}
                    disabled={selectedAnswer !== null}
                    className={`w-full arabic_font text-black text-left p-4 rounded-lg border transition-all duration-200 ${
                      selectedAnswer
                        ? getAnswerClass(option)
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    } ${selectedAnswer !== null && "cursor-not-allowed"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
