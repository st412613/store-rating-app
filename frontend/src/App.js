import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import StoreOwnerDashboard from "./components/StoreOwnerDashboard";

function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" />;
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    if (decoded.role !== role) return <Navigate to="/" />;
    return children;
  } catch (error) {
    return <Navigate to="/" />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/user"
          element={
            <ProtectedRoute role="normal">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-owner"
          element={
            <ProtectedRoute role="store_owner">
              <StoreOwnerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
