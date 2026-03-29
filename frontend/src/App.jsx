import { Navigate, Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { checkAuth } from "./authSlice"
import ProblemsPage from "./pages/ProblemsPage"
import ProblemSolverPage from "./pages/problemSolverPage"

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <SignUp />
        }
      />

      <Route
        path="/problems"
        element={isAuthenticated ? <ProblemsPage /> : <Navigate to="/login" replace />}
      />

      <Route path="/problems/:id"      element={isAuthenticated ? <ProblemSolverPage /> : <Navigate to="/login" replace />} />
      <Route path="/problems/:id/:tab" element={isAuthenticated ? <ProblemSolverPage /> : <Navigate to="/login" replace />} />
    </Routes>   
  );
}

export default App;