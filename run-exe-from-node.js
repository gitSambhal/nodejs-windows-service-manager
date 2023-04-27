const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

let count = 1
console.log('my the count');
const interval = setInterval(() => {
  const date = new Date().toLocaleString()
  console.log(`${count} : ${date}`)
  count++;
  if (count > 5) {
    clearInterval(interval)
    console.log('Exiting the mys count');
  }
}, 1000);

let binaryPath = './counter'
let fullPath = binaryPath
let command, commandArgs;
const args = [];

const normalizePath = (value) => path.sep == '/' ? value : value.replace(/\\/g, '/')

if (os.platform() === 'darwin') {
  binaryPath += '-macos'
  command = "open";
  fullPath = normalizePath((binaryPath))

  commandArgs = ["-a", "Terminal", fullPath, ...args];
} else if (os.platform() === 'win32') {
  binaryPath += '-win.exe';
  command = "cmd.exe";
  fullPath = normalizePath(path.resolve(binaryPath))
  commandArgs = ["/c", "start", "cmd.exe", "/k", fullPath, ...args];
} else {
  console.error("Unsupported platform:", os.platform());
  process.exit(1);
}

const childProcess = spawn(command, commandArgs, {
  stdio: ['ignore', 'pipe', 'pipe', 'pipe'],
});

console.log("Spawned child process with PID:", childProcess.pid);

// Listen for stdout data from the child process and print it to the parent process's console
childProcess.stdout.on('data', (data) => {
  console.log('stdout: ' + data);
  process.stdout.write(data);
});

// Listen for stderr data from the child process and print it to the parent process's console
childProcess.stderr.on('data', (data) => {
  console.log('stderr: ' + data);
  process.stderr.write(data);
});

childProcess.stdio[2].on('data', (data) => {
  console.log('stderr2: ' + data);
  process.stdout.write(data);
});

// Listen for when the child process exits
childProcess.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});



