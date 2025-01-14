import styles from './Username.module.css';

export function Username(props: { username: string }) {
  return <span class={styles.root}>{props.username}</span>;
}
