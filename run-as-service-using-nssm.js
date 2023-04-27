
const { spawnSync, exec } = require('child_process');
const path = require('path');

// Define the name and path of your service executable
const SERVICE_NAME = 'xservice';
const servicePath1 = 'C:\\my-files\\counter-win-v1.exe';
const servicePath2 = 'C:\\my-files\\counter-win-v2.exe';

function normalizePath(value) {
  return (path.sep == '/' ? value : value.replace(/\\/g, '/'));
}


async function executeNssmCommand(args) {
  const result = spawnSync('nssm', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    const errMessage = `Failed to execute command: ${result.stderr}`;
    console.error(errMessage);
    throw new Error(errMessage);
  }
}

async function installService(serviceName, servicePath) {
  console.log('Installing the service');
  await executeNssmCommand(['install', serviceName, normalizePath(servicePath)]);
}

async function updateServicePath(serviceName, servicePath) {
  console.log('Updating the service executable path');
  await executeNssmCommand(['set', serviceName, 'ImagePath', normalizePath(servicePath)]);
}

async function startService(serviceName) {
  console.log('Restarting the service');
  await executeNssmCommand(['restart', serviceName]);
}

async function removeService(serviceName) {
  console.log('Stopping the service');
  await stopService(serviceName);
  if (!await serviceExists(serviceName)) {
    console.log('The service does not exist, skipping removal');
    return;
  }
  console.log('Removing the service');
  await executeNssmCommand(['remove', serviceName, 'confirm']);
}

async function stopService(serviceName) {
  if (!await serviceExists(serviceName)) {
    console.log('The service does not exist, skipping stop');
    return;
  }
  console.log('Stopping the service');
  await executeNssmCommand(['stop', serviceName]);
}

async function serviceExists(serviceName) {
  return new Promise((resolve) => {
    exec(`sc query ${serviceName}`, (err, stdout, stderr) => {
      const doesExist = !(err || stderr);
      console.log('🚀 ~ file: run-as-service-using-sc.js:63 ~ exec ~ doesExist:', doesExist);
      return resolve(doesExist);
    });
  });
}

async function main() {
  await removeService(SERVICE_NAME);
  await installService(SERVICE_NAME, servicePath1);
  await startService(SERVICE_NAME);
  setTimeout(async () => {
    console.log('Running timeout stopping the service');
    await removeService(SERVICE_NAME)
    await installService(SERVICE_NAME, servicePath2)
    await startService(SERVICE_NAME)
  }, 15 * 1000)
}

main();