module.exports = {
  apps: [
    {
      name: "work-management-backend",
      script: "backend/server.js",
      watch: true
    },
    {
      name: "work-management-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run start",
      watch: true
    }
  ]
};
