import styles from './Skeleton.module.css';

export default function Skeleton({ width, height, circle, className = '' }) {
    const style = {
        width: width || '100%',
        height: height || '1rem',
        borderRadius: circle ? '50%' : 'var(--radius-sm)',
    };

    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}
