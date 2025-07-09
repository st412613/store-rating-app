import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StoreOwnerDashboard.styles.css";

function StoreOwnerDashboard() {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/store/ratings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRatings(res.data.ratings);
        setAverageRating(res.data.averageRating);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRatings();
  }, []);

  const handlePasswordUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/auth/update-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOldPassword("");
      setNewPassword("");
      setShowPasswordModal(false);
      window.alert(res.data.message || "Password updated successfully");
    } catch (error) {
      window.alert(error.response?.data?.error || "Error updating password");
    }
  };

  return (
    <div className="store-owner-container">
      <h1>Store Owner Dashboard</h1>
      <button
        onClick={() => setShowPasswordModal(true)}
        className="update-pass-button"
      >
        Update Password
      </button>
      <button onClick={handleLogout} className="store-owner-logout-button">
        Logout
      </button>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              className="close-button"
              onClick={() => setShowPasswordModal(false)}
            >
              &times;
            </span>
            <h2>Update Password</h2>
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="user-input pop-input"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="user-input pop-input"
            />
            <button
              onClick={handlePasswordUpdate}
              className="update-pass-button submit-pop-btn"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      <p>Average Rating: {averageRating || "No ratings"}</p>
      <h2>Ratings</h2>
      <table className="store-owner-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {ratings.map((rating, index) => (
            <tr key={index}>
              <td>{rating.name}</td>
              <td>{rating.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StoreOwnerDashboard;
