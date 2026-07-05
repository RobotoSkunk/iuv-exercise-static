
import { Hono } from 'hono';

import adminsRouter from './admins';
import teachersRouter from './teachers';
import rolesRouter from './roles';

const api = new Hono();

api.route('/admins', adminsRouter);
api.route('/teachers', teachersRouter);
api.route('roles', rolesRouter);

export default api;
