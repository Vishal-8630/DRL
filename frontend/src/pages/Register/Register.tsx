import { useState } from "react";
import styles from "./Register.module.scss";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaIdCard,
  FaEyeSlash,
  FaEye,
} from "react-icons/fa"; // icons
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import { authStart, authSuccess, authEnd } from "../../features/auth";
import api from "../../api/axios";
import { addMessage } from "../../features/message";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { selectAuthLoading, selectUser } from "../../features/auth/authSelectors";

const Register = () => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ fullname?: string; email?: string; username?: string; password?: string}>({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectAuthLoading);
  const user = useSelector(selectUser);

  if (user) return <Navigate to='/' replace />

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "fullname") setFullname(value);
    if (name === "username") setUsername(value);
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const resetValues = () => {
    setFullname("");
    setUsername("");
    setEmail("");
    setPassword("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authStart());

    try {
      const response = await api.post("/auth/register", {
        fullname,
        username,
        email,
        password,
      });
      const obj = response.data;
      dispatch(authSuccess(obj.data.user));
      dispatch(
        addMessage({
          type: "success",
          text: obj.message || "Registration successfull",
        })
      );
      resetValues();
      navigate("/");
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        setErrors(errors);
      }
      dispatch(authEnd());
      dispatch(
        addMessage({
          type: "error",
          text: error.response?.data?.message || "Registration failed",
        })
      );
    }
  };

  return (
    <div className={styles.registerContainer}>
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <h2 className={styles.title}>Register</h2>

        <div className={styles.formGroup}>
          <label htmlFor="fullname">Full Name</label>
          <div className={styles.inputWrapper}>
            <FaIdCard className={styles.icon} />
            <input
              type="text"
              value={fullname}
              id="fullname"
              name="fullname"
              placeholder="Enter your full name"
              onChange={handleInputChange}
            />
          </div>
          {errors.fullname && <p className={styles.errorText}>{errors.fullname}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <div className={styles.inputWrapper}>
            <FaEnvelope className={styles.icon} />
            <input
              type="email"
              value={email}
              id="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleInputChange}
            />
          </div>
          {errors.email && <p className={styles.errorText}>{errors.email}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <div className={styles.inputWrapper}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              value={username}
              id="username"
              name="username"
              placeholder="Choose a username"
              onChange={handleInputChange}
            />
          </div>
          {errors.username && <p className={styles.errorText}>{errors.username}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputWrapper}>
            <FaLock className={styles.icon} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              id="password"
              name="password"
              placeholder="Set your password"
              onChange={handleInputChange}
            />
            <span
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && <p className={styles.errorText}>{errors.password}</p>}
        </div>

        <button type="submit" className={styles.registerBtn} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className={styles.footerText}>
          Already a user? <Link to='/login'>Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;