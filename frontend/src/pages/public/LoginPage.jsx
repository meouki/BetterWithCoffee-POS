import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Coffee, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './LoginPage.module.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const user = await login(username, password);
            toast.success(`Welcome back, ${user.name}!`);

            // Route based on role if they didn't come from a specific page
            if (from === '/') {
                if (user.role === 'Cashier') navigate('/pos', { replace: true });
                else navigate('/dashboard/overview', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            toast.error(err.message);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500); // match animation duration
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            {/* Background Image Side (Desktop Only) */}
            <div className={styles.heroSide}>
                <div className={styles.heroImage} />
                <div className={styles.heroOverlay} />
                
                <div className={styles.heroText}>
                    <h2 className={styles.heroTitle}>Precision in Every <span className={styles.accent}>Pour.</span></h2>
                    <p className={styles.heroSubtitle}>Your craft coffee experience, powered by PulsePoint.</p>
                </div>
            </div>

            {/* Login Form Side */}
            <div className={styles.formSide}>
                <div className={styles.bgGlow}></div>
                
                <form
                    className={`${styles.card} ${isShaking ? styles.shake : ''}`}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.header}>
                        <div className={styles.logoWrapper}>
                            <Coffee size={32} />
                        </div>
                        <h1 className={styles.title}>Welcome Back</h1>
                        <p className={styles.subtitle}>Sign in to access your system.</p>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.loginBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className={styles.spinner}></div>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>© 2026 Better with Coffee POS System</p>
                </div>
            </div>
        </div>
    );
}
