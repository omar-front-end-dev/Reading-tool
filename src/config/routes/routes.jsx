import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../../layouts/Layout";
import { ErrorPage, HomePage, ProgressTracker, QuizPage, ShowLesson, ShowLessonFirstRound, ShowLessonSecondRound } from "../../modules/index";

export const Routes = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Layout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "show-lesson/:levelId/:lessonId",
        element: <ShowLesson />,
      },
      {
        path: "show-lesson-first-round/:levelId/:lessonId",
        element: <ShowLessonFirstRound />,
      },
      {
        path: "show-lesson-second-round/:levelId/:lessonId",
        element: <ShowLessonSecondRound />,
      },
      {
        path: "level/:levelId/lesson/:lessonId/quiz",
        element: <QuizPage />,
      },
      {
        path: "progress",
        element: <ProgressTracker />,
      },
    ],
  },
]);
