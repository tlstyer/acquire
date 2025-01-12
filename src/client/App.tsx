import { Router } from '@solidjs/router';
import 'normalize.css';
import './App.module.css';
import { Examples } from './pages/examples/Examples';

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
    component: () => <Examples />,
  },
];

export function App() {
  return <Router>{routes}</Router>;
}
