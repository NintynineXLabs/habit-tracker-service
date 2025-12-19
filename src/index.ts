import app from './app';

console.log(`Server is running on port ${process.env.PORT || 8000}`);

export default {
  port: process.env.PORT || 8000,
  fetch: app.fetch,
};
