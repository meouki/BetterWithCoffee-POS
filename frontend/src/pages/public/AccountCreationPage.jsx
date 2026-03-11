import styles from './AccountCreationPage.module.css';

export default function AccountCreationPage() {
    return (
        <div className={styles.accountPage}>
            <div className={styles.overlay} />
            <div className={styles.formContainer}>
                <h2 className={styles.headerTitle}>Create Account</h2>
                <p className={styles.headerText}>
                    Internal registration portal. Requires Admin access code.
                </p>

                <div className={styles.formGroup}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className={styles.inputField}
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        className={styles.inputField}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className={styles.inputField}
                    />
                    <button className={`pos-btn ${styles.submitBtn}`}>
                        Register Account
                    </button>
                </div>
            </div>
        </div>
    );
}
