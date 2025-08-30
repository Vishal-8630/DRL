import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import styles from "./Login.module.scss";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import { authStart, authSuccess, authEnd } from "../../features/auth";
import api from "../../api/axios";
import { addMessage } from "../../features/message";
import { selectAuthLoading, selectUser } from "../../features/auth/authSelectors";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectAuthLoading);
  const user = useSelector(selectUser);

  if (user) return <Navigate to='/' replace />

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "username") {
      setUsername(value);
      if (usernameError) setUsernameError("");
    } else if (id === "password") {
      setPassword(value);
      if (passwordError) setPasswordError("");
    }
  };

  const resetValues = () => {
    setUsername("");
    setPassword("");
    setUsernameError("");
    setPasswordError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authStart());

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });
      const obj = response.data;
      dispatch(authSuccess(obj.data.user));
      dispatch(addMessage({ type: "success", text: obj.message || "Login successful" }));
      resetValues();
      navigate("/");
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        setUsernameError(errors.username || "");
        setPasswordError(errors.password || "");
      }
      dispatch(authEnd());
      dispatch(addMessage({ type: "error", text: error.response?.data?.message || "Login failed" }));
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2 className={styles.title}>Login</h2>

        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <div className={styles.inputWrapper}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              value={username}
              id="username"
              placeholder="Enter username"
              onChange={handleInputChange}
            />
          </div>
          {usernameError && <p className={styles.errorText}>{usernameError}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputWrapper}>
            <FaLock className={styles.icon} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              id="password"
              placeholder="Enter password"
              onChange={handleInputChange}
            />
            <span
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {passwordError && <p className={styles.errorText}>{passwordError}</p>}
        </div>

        <div className={styles.formOptions}>
          <label>
            <input type="checkbox" /> Remember me
          </label>
        </div>

        <button type="submit" className={styles.loginBtn} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className={styles.footerText}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;