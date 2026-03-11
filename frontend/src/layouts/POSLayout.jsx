import { Outlet } from 'react-router-dom';
import styles from './POSLayout.module.css';

export default function POSLayout() {
    return (
        <div className={styles.posLayout}>
            <Outlet />
        </div>
    );
}
