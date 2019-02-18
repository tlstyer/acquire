import 'normalize.css';
import './global.scss';

import { ClientManager } from './clientManager';

const clientManager = new ClientManager();

clientManager.manage();
