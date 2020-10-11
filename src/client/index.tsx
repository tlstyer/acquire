import 'normalize.css';
import { ClientManager } from './clientManager';
import './global.scss';

const clientManager = new ClientManager();

clientManager.manage();
