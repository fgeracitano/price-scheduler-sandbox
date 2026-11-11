import { http } from 'msw';
import { setupServer } from 'msw/node';
import { app } from '../../server/app';

/** Routes the app's fetch calls to the real API app, in-process. */
export const server = setupServer(http.all('*/api/*', ({ request }) => app.fetch(request)));
