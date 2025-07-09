import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserDashboard.styles.css";

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [rating, setRating] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [ratingUpdatedTrigger, setRatingUpdatedTrigger] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/user/stores`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        });
        setStores(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStores();
  }, [filters, ratingUpdatedTrigger]);

  const handleRating = async (storeId, value) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/user/stores/${storeId}/rating`,
        { rating: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStores((prev) =>
        prev.map((store) =>
          store.id === storeId ? { ...store, user_rating: value } : store
        )
      );
      setRatingUpdatedTrigger((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

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
    <div className="user-container">
      <h1>User Dashboard</h1>
      <button
        onClick={() => setShowPasswordModal(true)}
        className="update-pass-button"
      >
        Update Password
      </button>
      <button onClick={handleLogout} className="user-logout-button">
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

      <div className="user-filter">
        <input
          type="text"
          placeholder="Search by Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="user-input"
        />
        <input
          type="text"
          placeholder="Search by Address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          className="user-input"
        />
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Overall Rating</th>
            <th>Your Rating</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.address}</td>
              <td>{store.overall_rating || "No ratings"}</td>
              <td>{store.user_rating || "Not rated"}</td>
              <td>
                <select
                  value={rating[store.id] || ""}
                  onChange={(e) => {
                    setRating({ ...rating, [store.id]: e.target.value });
                    handleRating(store.id, parseInt(e.target.value));
                  }}
                  className="user-select"
                >
                  <option value="">Rate</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserDashboard;
