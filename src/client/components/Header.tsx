import styles from './Header.module.css';

export function Header() {
  return (
    <div class={styles.root}>
      <span class={styles.name}>
        <a href="/">Acquire</a>
      </span>

      <span class={styles.middle} />

      <span
        classList={{ [styles.connection]: true, [styles.connecting]: true }}
        title="Connecting..."
      />
    </div>
  );
}
