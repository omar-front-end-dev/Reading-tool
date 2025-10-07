import { RouterProvider } from "react-router-dom";
import { Routes } from "./config/routes/routes";
import { ProgressProvider } from "./contexts/ProgressContext";

function App() {
  return (
    <ProgressProvider>
      <RouterProvider router={Routes} />
    </ProgressProvider>
  );
}

export default App;
