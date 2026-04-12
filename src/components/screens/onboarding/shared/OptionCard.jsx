import styles from './OptionCard.module.css';

function OptionCard({ label, selected, onTap }) {
  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onTap}
      type="button"
    >
      {label}
    </button>
  );
}

export { OptionCard };
