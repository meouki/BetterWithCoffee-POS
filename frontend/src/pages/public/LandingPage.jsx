import { ChevronRight, Coffee, Zap, BarChart3, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

export default function LandingPage() {
    return (
        <div className={styles.landingPage}>

            {/* Hero Section with Cinematic Background */}
            <section className={styles.heroSection}>
                <div className={styles.heroImage} />
                <div className={styles.heroOverlayDark} />
                <div className={styles.heroOverlayBottom} />

                {/* Content */}
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span>Point of Sale System</span>
                    </div>
                    <h1 className={styles.title}>
                        Better with<br />
                        <span className={styles.titleItalic}>Coffee.</span>
                    </h1>
                    <p className={styles.subtitle}>
                        The ultimate craft coffee experience, powered by a seamless, touch-first point-of-sale system.
                    </p>

                    <div className={styles.buttonGroup}>
                        <Link to="/pos" className={`pos-btn ${styles.primaryBtn}`}>
                            Explore POS <ChevronRight />
                        </Link>
                        <Link to="/dashboard" className={`pos-btn ${styles.secondaryBtn}`}>
                            Access Admin
                        </Link>
                        <Link to="/docs" className={`pos-btn ${styles.docsBtn}`}>
                            <BookOpen size={16} /> Docs
                        </Link>
                    </div>
                </div>
            </section>


            {/* Value Propositions */}
            <section className={styles.valueSection}>
                <div className={styles.valueContainer}>
                    <div className={styles.valueHeader}>
                        <h2 className={styles.valueTitle}>Precision in Every Pour.</h2>
                        <p className={styles.valueSubtitle}>From the cashier's instrument to the manager's cockpit, everything is tactile, fast, and connected.</p>
                    </div>

                    <div className={styles.grid}>
                        {/* Prop 1 */}
                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <Zap size={32} className={styles.icon} />
                            </div>
                            <h3 className={styles.cardTitle}>Under 30 Seconds</h3>
                            <p className={styles.cardText}>Touch-first interface built for speed. Process full orders, apply modifiers, and compute change instantly without breaking eye contact.</p>
                        </div>

                        {/* Prop 2 */}
                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <Coffee size={32} className={styles.icon} />
                            </div>
                            <h3 className={styles.cardTitle}>Complex Modifiers</h3>
                            <p className={styles.cardText}>Sugar levels, milk alternatives, extra shots. Handle highly customized specialty orders effortlessly with our intuitive bottom sheets.</p>
                        </div>

                        {/* Prop 3 */}
                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <BarChart3 size={32} className={styles.icon} />
                            </div>
                            <h3 className={styles.cardTitle}>Manager's Cockpit</h3>
                            <p className={styles.cardText}>Live sales tracking, automated best-seller algorithms, and critical stock alerts in a dense, desktop-first dashboard.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p className={styles.footerText}>
                    © 2026 PulsePoint POS System.
                </p>
                <Link to="/docs" className={styles.footerDocsLink}>
                    <BookOpen size={13} /> Documentation
                </Link>
            </footer>
        </div>
    );
}
