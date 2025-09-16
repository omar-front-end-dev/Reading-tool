import { Link } from "react-router-dom";

export const ErrorPage = () => {
  return (
    <div className="p-3 flex items-center justify-center min-h-screen bg-gray-100">
      <div style={{maxWidth: "300px", minWidth: "40%"}} className="text-center p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold primary-color">404</h1>
        <p className="mt-4 text-2xl font-semibold text-gray-800">
          Page Not Found
        </p>
        <p className="mt-2 text-gray-600">An unexpected error occurred</p>
        <div className="flex items-center justify-center ">
          <Link
            to={"/"}
            className="flex w-7/12 hover:bg-slate-900 transition-all  items-center justify-center  text-white rounded-lg mt-6 px-4 py-3 bg-[var(--primary-color)]"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
