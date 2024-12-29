module.exports = {
  apps: [
    {
      name: 'mao',
      script: 'index.js', // our entry point
      watch: false,
      restart_delay: 5000, // restart bot 5 seconds after crash
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
