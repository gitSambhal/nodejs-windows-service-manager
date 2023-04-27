const { spawnSync, exec } = require('child_process');
const path = require('path');

// Define the name and path of your service executable
const SERVICE_NAME = 'xservice';
const servicePath1 = 'C:\\my-files\\counter-win-v1.exe';
const servicePath2 = 'C:\\my-files\\counter-win-v2.exe';

function normalizePath(value) {
  return (path.sep == '/' ? value : value.replace(/\\/g, '/'));
}

// Install the service
function installTheService(serviceName, serviceExePath) {
  return new Promise((resolve, reject) => {
    console.log('Installing the service');
    const installResult = spawnSync('nssm', ['install', serviceName, normalizePath(path.resolve(serviceExePath))], { encoding: 'utf8' });
    if (installResult.status !== 0) {
      const errMessage = `Failed to install service: ${installResult.stderr}`;
      console.error(errMessage);
      return reject(new Error(errMessage));
    }
    return resolve();
  });
}


// Update the service executable path
function updateTheServicePath(serviceName, serviceExePath) {
  return new Promise((resolve, reject) => {
    console.log('Update the service executable path');
    const setPathResult = spawnSync('nssm', ['set', serviceName, 'ImagePath', normalizePath(path.resolve(serviceExePath))], { encoding: 'utf8' });
    if (setPathResult.status !== 0) {
      const errMessage = `Failed to update service executable path: ${setPathResult.stderr}`;
      console.error(errMessage);
      return reject(new Error(errMessage));
    }
    return resolve();
  });
}

// Start the service
function startTheService(serviceName) {
  return new Promise((resolve, reject) => {
    console.log('Restarting the service');
    const startResult = spawnSync('nssm', ['restart', serviceName], { encoding: 'utf8' });
    if (startResult.status !== 0) {
      const errMessage = `Failed to start service: ${startResult.stderr}`;
      console.error(errMessage);
      return reject(new Error(errMessage));
    }
    return resolve();
  });
}

// Remove the service
function removeTheService(serviceName) {
  return new Promise(async (resolve, reject) => {
    if (!await serviceExists(serviceName)) {
      return resolve()
    }
    await stopService(serviceName);
    console.log('Removing service');
    const removeResult = spawnSync('nssm', ['remove', serviceName, 'confirm'], { encoding: 'utf8' });
    console.log('🚀 ~ file: run-as-service.js:65 ~ returnnewPromise ~ removeResult:', removeResult);
    if (removeResult.status !== 0) {
      const errMessage = `Failed to remove service: ${removeResult.stderr}`;
      console.error(errMessage);
      return reject(new Error(errMessage));
    }
    return resolve();
  });
}

function stopService(serviceName) {
  return new Promise(async (resolve, reject) => {
    console.log('Stopping service');
    if (!await serviceExists(serviceName)) {
      return resolve()
    }
    const stopResult = spawnSync('nssm', ['stop', serviceName], { encoding: 'utf8' });
    if (stopResult.status !== 0) {
      const errMessage = `Failed to stop service: ${stopResult.stderr}`;
      console.error(errMessage);
      return reject(new Error(errMessage));
    }
    return resolve()
  })
}

async function serviceExists(serviceName) {
  return new Promise((resolve, reject) => {
    exec(`sc query ${serviceName}`, (err, stdout, stderr) => {
      const doesExist = !(err || stderr);
      console.log('🚀 ~ file: run-as-service.js:95 ~ exec ~ doesExist:', doesExist);
      return resolve(doesExist)
    });
  });
}

async function main() {
  await removeTheService(SERVICE_NAME);
  await installTheService(SERVICE_NAME, servicePath1);
  await startTheService(SERVICE_NAME);
  setTimeout(async () => {
    console.log('Running timeout stopping the service');
    await removeTheService(SERVICE_NAME)
    await installTheService(SERVICE_NAME, servicePath2)
    await startTheService(SERVICE_NAME)
  }, 15 * 1000)
}

main();