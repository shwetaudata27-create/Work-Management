const { exec } = require("child_process");

exec("start-frontend.bat", (err, stdout, stderr) => {
  if (err) console.error(err);
  console.log(stdout);
  console.error(stderr);
});
