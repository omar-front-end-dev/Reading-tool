import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { levelsAndLesson } from "../../config/levelsAndLesson/levelsAndLesson";
import { ArrowLeft, Award, BarChart3 } from "lucide-react";
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

  // البحث عن المستوى والدرس المناسبين
  const currentLevel = levelsAndLesson.find((level) => level.id === levelIdNum);
  const currentLesson = currentLevel?.lessons.find(
    (lesson) => lesson.id === lessonIdNum
  );

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

    if (option === questions[currentQuestion].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedAnswer(null);
      } else {
        setShowScore(true);
      }
    }, 1000);
  };

  useEffect(() => {
    if (showScore) {
      saveProgress();
    }
  }, [showScore, score]); // سيتم استدعاء saveProgress عندما يتغير showScore أو score

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-end">
          <Link
            to={`/show-lesson/${levelId}/${lessonId}`}
            className="arabic_font flex items-center justify-end text-lg text-[var(--secondary-color)] hover:text-teal-700 mb-6"
          >
            <ArrowLeft size={20} className="ml-1" />
            العودة إلى الدرس
          </Link>
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
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <Award size={48} className="text-green-600" />
              </div>
            </div>

            <h2 className="arabic_font text-2xl font-bold text-gray-800 mb-2">
              تهانينا! لقد أكملت الاختبار
            </h2>
            <p className="arabic_font text-lg text-gray-600 mb-2">
              درجتك: <span className="font-bold">{score}</span> من{" "}
              <span className="arabic_font font-bold">{questions.length}</span>
            </p>
            <p className="arabic_font text-gray-500 mb-6">
              نسبة النجاح:{" "}
              <span className="font-bold">
                {Math.round((score / questions.length) * 100)}%
              </span>
            </p>

            <div className="flex justify-center space-x-4">
              <Link
                to={`/show-lesson/${levelId}/${lessonId}`}
                className="arabic_font bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-6 py-2 rounded-lg transition-colors"
              >
                العودة إلى الدرس
              </Link>
              <Link
                to="/progress"
                className="arabic_font gap-2 flex items-center text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
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
  );
};
