"use client";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import styles from "./login.module.css";
import { useState } from "react";
import { loginRequest } from "@/services/auth.service";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/components/toast/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = await loginRequest(email, password);
      login(data.access_token, data.user);
      showToast("Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (error) {
      showToast("Login failed. Please check your credentials.");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Decorative background elements */}
      <div className={styles.bgDecor1}></div>
      <div className={styles.bgDecor2}></div>
      <div className={styles.bgDecor3}></div>

      <div className={styles.wrapper}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <div className={styles.logoBadge}>KF</div>
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Admin Portal</p>
            <p className={styles.description}>
              Enter your credentials to access the dashboard
            </p>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleLogin}>
            {/* Email Input */}
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div
                className={`${styles.inputWrapper} ${errors.email ? styles.inputError : ""}`}
              >
                <Mail className={styles.icon} size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@kingfox.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors({ ...errors, email: undefined });
                  }}
                  disabled={isLoading}
                  className={styles.input}
                />
              </div>
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Password Input */}
            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                {/* <a href="#" className={styles.forgotLink}>
                  Forgot Password?
                </a> */}
              </div>
              <div
                className={`${styles.inputWrapper} ${errors.password ? styles.inputError : ""}`}
              >
                <Lock className={styles.icon} size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors({ ...errors, password: undefined });
                  }}
                  disabled={isLoading}
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                  disabled={isLoading}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                Remember me on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`${styles.submitButton} ${isLoading ? styles.loading : ""}`}
              disabled={isLoading}
            >
              <span className={styles.buttonContent}>
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight size={20} />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}></div>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.footerText}>Secure admin access only</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        © 2026 KINGFOX ADMIN PORTAL. All rights reserved.
      </div>
    </div>
  );
}
