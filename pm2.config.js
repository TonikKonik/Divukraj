module.exports = {
  apps: [{
    name: "divukraj",
    script: "npm",
    args: "start",
    env: { PORT: 3002, NODE_ENV: "production" }
  }]
}