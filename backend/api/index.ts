
import { Hono } from 'hono';

import adminsRouter from './admins';
import teachersRouter from './teachers';
import rolesRouter from './roles';
import authRouter from './auth';
import identityRouter from './identity';

const api = new Hono();

api.route('/admins', adminsRouter);
api.route('/teachers', teachersRouter);
api.route('/roles', rolesRouter);
api.route('/auth', authRouter);
api.route('/identity', identityRouter);

export default api;
