import styles from './OrdersPage.module.css';

export default function OrdersPage() {
    return (
        <div className={styles.pageContainer}>
            <h2 className={styles.title}>All Orders</h2>

            <div className={styles.emptyState}>
                <p>This page handles full order history pagination.</p>
                <p>Currently viewing recent orders on Overview.</p>
            </div>
        </div>
    );
}
