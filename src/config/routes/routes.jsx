import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../../layouts/Layout";
import {
  ErrorPage,
  Reading,
  ReadingProgressTracker,
  QuizPage,
  ShowLesson,
  ShowLessonFirstRound,
  ShowLessonSecondRound,
  Home,
  ListeningProgressTracker,
} from "../../modules/index";
import { ListeningHome } from "../../pages/ListeningHome";
import { ListeningLessonPage } from "../../pages/ListeningLessonPage";
import { PronounceHomePage } from "../../pages/PronounceHomePage";
import { TopicsPage } from "../../pages/TopicsPage";
import { MobileLessonPage } from "../../pages/MobileLessonPage";
import { DesktopConversationPage } from "../../pages/DesktopConversationPage";

export const Routes = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "reading",
        element: <Reading />,
      },
      {
        path: "reading/show-lesson/:levelId/:lessonId",
        element: <ShowLesson />,
      },
      {
        path: "reading/show-lesson-first-round/:levelId/:lessonId",
        element: <ShowLessonFirstRound />,
      },
      {
        path: "reading/show-lesson-second-round/:levelId/:lessonId",
        element: <ShowLessonSecondRound />,
      },
      {
        path: "reading/level/:levelId/lesson/:lessonId/quiz",
        element: <QuizPage />,
      },
      {
        path: "reading/progress",
        element: <ReadingProgressTracker />,
      },
      {
        path: "listening/progress",
        element: <ListeningProgressTracker />,
      },
      {
        path: "listening/home",
        element: <ListeningHome />,
      },
      {
        path: "listening/lesson/:id",
        element: <ListeningLessonPage />,
      },
      {
        path: "pronounce/home",
        element: <PronounceHomePage />,
      },
      {
        path: "pronounce/topics/:lessonNumber",
        element: <TopicsPage />,
      },
      {
        path: "pronounce/mobile/:lessonNumber/:topicId/:conversationId",
        element: <MobileLessonPage />,
      },
      {
        path: "pronounce/desktop/:lessonNumber/:topicId/:conversationId",
        element: <DesktopConversationPage />,
      },
    ],
  },
]);
