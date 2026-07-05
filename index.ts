
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

import path from 'path';

import { initDatabase } from './backend/database';
import api from './backend/api';

await initDatabase();


const server = new Hono();

server.route('/api', api);
server.get('/*', serveStatic({ root: path.join(process.cwd(), 'static') }));


export default server;
