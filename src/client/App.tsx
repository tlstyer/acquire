import { Router } from '@solidjs/router';
import 'normalize.css';
import styles from './App.module.css';
import { Header } from './components/Header';
import { ExamplesPage } from './pages/examples/ExamplesPage';
import { GamePage } from './pages/game/GamePage';
import { HomePage } from './pages/home/HomePage';

const routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/game',
    component: GamePage,
  },
  {
    path: '/examples',
    component: ExamplesPage,
  },
];

export function App() {
  return (
    <>
      <Header />
      <div class={styles.content}>
        <Router>{routes}</Router>
      </div>
    </>
  );
}
