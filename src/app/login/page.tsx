'use client'
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from 'lucide-react';
import styles from './login.module.css';
import { useState } from "react";
import { loginRequest } from "@/services/auth.service";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from '@/components/toast/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  
  const { login } = useAuth();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const { showToast } = useToast();
const handleLogin = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  try {

    const data = await loginRequest(email, password);

    // save token
    login(data.access_token, data.user);

    router.push("/dashboard");

  } catch (error) {

    showToast("Login failed");

  }

};

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1>Welcome Back</h1>
          <p>Please enter your credentials to access the admin portal.</p>
        </header>

        <form className={styles.form} onSubmit={handleLogin}>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.icon} size={20}/>
              <input
                type="email"
                placeholder="admin@store.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label>Password</label>
              <a href="#" className={styles.forgotLink}>Forgot Password?</a>
            </div>

            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} size={20}/>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className={styles.submitButton}
            onSubmit={handleLogin}
            >
            Sign In to Dashboard
            <ArrowRight size={20}/>
          </button>

        </form>

        <div className={styles.divider}></div>

      </div>

      <div className={styles.copyright}>
        © 2026 KINGFOX ADMIN.
      </div>
    </div>
  );
}