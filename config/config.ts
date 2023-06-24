// https://umijs.org/config/
import { defineConfig } from 'umi';

import routes from './routes';

const { REACT_APP_ENV } = process.env;

const SERVERIP = 'https://work4u-server.onrender.com';

export default defineConfig({
  routes,
  title: 'Work4u',
  define: {
    SERVERIP: SERVERIP,
  },
  npmClient: 'yarn',
});
