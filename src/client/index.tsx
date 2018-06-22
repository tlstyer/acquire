import 'normalize.css';
import './global.css';

import { ClientManager } from './clientManager';

const clientManager = new ClientManager();

clientManager.manage();
