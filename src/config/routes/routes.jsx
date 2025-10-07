import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../../layouts/Layout";
import {
  ErrorPage,
  Reading,
  ProgressTracker,
  QuizPage,
  ShowLesson,
  ShowLessonFirstRound,
  ShowLessonSecondRound,
  Home,
} from "../../modules/index";
import { ListeningHome } from "../../pages/ListeningHome";
import { ListeningLessonPage } from "../../pages/ListeningLessonPage";

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
        element: <ProgressTracker />,
      },
      {
        path: "listening/home",
        element: <ListeningHome />,
      },
      {
        path: "listening/lesson/:id",
        element: <ListeningLessonPage />,
      }
    ],
  },
]);