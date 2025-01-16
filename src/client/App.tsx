import { Router } from '@solidjs/router';
import 'normalize.css';
import styles from './App.module.css';
import { Header } from './components/Header';
import { ExamplesPage } from './pages/examples/ExamplesPage';

const routes = [
  {
    path: '/',
    component: () => (
      <>
        <h1>Acquire</h1>
        <a href="/examples">Examples</a>
      </>
    ),
  },
  {
    path: '/examples',
    component: () => <ExamplesPage />,
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
