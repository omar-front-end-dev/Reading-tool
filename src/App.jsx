import { RouterProvider } from "react-router-dom";
import { Routes } from "./config/routes/routes";

function App() {
  return (
    <>
      <RouterProvider router={Routes} />
    </>
  );
}

export default App;
