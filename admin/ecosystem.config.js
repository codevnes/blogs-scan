export default {
  apps: [
    {
      name: 'blogs-scan',
      script: '../dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'blogs-scan-admin',
      script: 'serve',
      args: '-s dist -l 4000',
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
}; 