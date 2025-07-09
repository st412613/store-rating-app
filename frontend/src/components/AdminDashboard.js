import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.styles.css";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "",
  });
  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [statsRes, usersRes, storesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/stores`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFilter = async () => {
    try {
      const token = localStorage.getItem("token");
      const usersRes = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        }
      );
      const storesRes = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/admin/stores`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        }
      );
      setUsers(usersRes.data);
      setStores(storesRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddUser = async () => {
    setErrorMessage("");
    const { name, email, password, address, role } = newUser;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;

    if (name.length < 20 || name.length > 60) {
      return setErrorMessage("Name must be between 20 and 60 characters.");
    }
    if (!emailRegex.test(email)) {
      return setErrorMessage("Invalid email format.");
    }
    if (!passwordRegex.test(password)) {
      return setErrorMessage(
        "Password must be 8-16 chars with at least 1 uppercase and 1 special character."
      );
    }
    if (address.length > 400) {
      return setErrorMessage("Address should be under 400 characters.");
    }
    if (!["admin", "normal", "store_owner"].includes(role)) {
      return setErrorMessage("Role must be admin, normal, or store_owner.");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/admin/users`,
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 201) {
        alert(res.data.message || "User added successfully");
        setNewUser({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "",
        });
        const updatedUsers = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(updatedUsers.data);
        setShowUserModal(false);
        fetchDashboardData();
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Error adding user.";
      setErrorMessage(msg);
    }
  };

  const handleAddStore = async () => {
    setErrorMessage("");
    const { name, email, address, owner_id } = newStore;

    if (!name || !email || !address || !owner_id) {
      return setErrorMessage("All fields are required.");
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/admin/stores`,
        newStore,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 201) {
        alert(res.data.message || "User added successfully");
        setNewStore({ name: "", email: "", address: "", owner_id: "" });
        setShowStoreModal(false);
        fetchDashboardData();
        const updatedStores = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/admin/stores`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStores(updatedStores.data);
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Error adding store.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setShowUserModal(true)} className="admin-button">
          + Add New User
        </button>
        <button
          onClick={() => setShowStoreModal(true)}
          className="admin-button"
        >
          + Add New Store
        </button>
        <button onClick={handleLogout} className="admin-logout-button">
          Logout
        </button>
      </div>

      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              className="close-button"
              onClick={() => setShowUserModal(false)}
            >
              &times;
            </span>
            <h2>Add New User</h2>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="admin-input-box"
            />
            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="admin-input-box"
            />
            <input
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="admin-input-box"
            />
            <input
              placeholder="Address"
              value={newUser.address}
              onChange={(e) =>
                setNewUser({ ...newUser, address: e.target.value })
              }
              className="admin-input-box"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="admin-input-box"
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="normal">Normal</option>
              <option value="store_owner">Store Owner</option>
            </select>
            <button
              onClick={handleAddUser}
              className="admin-button popup-button"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {showStoreModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              className="close-button"
              onClick={() => setShowStoreModal(false)}
            >
              &times;
            </span>
            <h2>Add New Store</h2>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <input
              placeholder="Store Name"
              value={newStore.name}
              onChange={(e) =>
                setNewStore({ ...newStore, name: e.target.value })
              }
              className="admin-input-box"
            />
            <input
              placeholder="Store Email"
              value={newStore.email}
              onChange={(e) =>
                setNewStore({ ...newStore, email: e.target.value })
              }
              className="admin-input-box"
            />
            <input
              placeholder="Store Address"
              value={newStore.address}
              onChange={(e) =>
                setNewStore({ ...newStore, address: e.target.value })
              }
              className="admin-input-box"
            />
            <input
              placeholder="Owner ID"
              value={newStore.owner_id}
              onChange={(e) =>
                setNewStore({ ...newStore, owner_id: e.target.value })
              }
              className="admin-input-box"
            />
            <button
              onClick={handleAddStore}
              className="admin-button popup-button"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      <div className="admin-stats">
        <p>Total Users: {stats.totalUsers}</p>
        <p>Total Stores: {stats.totalStores}</p>
        <p>Total Ratings: {stats.totalRatings}</p>
      </div>

      <h2>Filter Users/Stores</h2>
      <div className="admin-filter">
        <input
          type="text"
          placeholder="Filter by Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="admin-input"
        />
        <input
          type="text"
          placeholder="Filter by Email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          className="admin-input"
        />
        <input
          type="text"
          placeholder="Filter by Address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          className="admin-input"
        />
        <input
          type="text"
          placeholder="Filter by Role"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="admin-input"
        />
        <button onClick={handleFilter} className="admin-button">
          Apply Filters
        </button>
      </div>

      <h2>Users</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Role</th>
            <th>User id</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.address}</td>
              <td>{user.role}</td>
              <td>{user.id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Stores</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.email}</td>
              <td>{store.address}</td>
              <td>{store.rating || "No ratings"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
