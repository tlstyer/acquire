import { CreateGameExamples } from './CreateGameExamples';
import styles from './Examples.module.css';

export function Examples() {
  return (
    <div class={styles.root}>
      <h1>CreateGame</h1>
      <CreateGameExamples />
    </div>
  );
}
