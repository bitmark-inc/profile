const Redis = require('redis');


let redisClient;
const initialize = (option) => {
  if (!option || !option.host || !option.port) {
    throw new Error('Redis required server configuration!');
  }
  redisClient = Redis.createClient(option.port, option.host);
};

const get = (key) => {
  return new Promise((resolve, reject) => {
    if (!redisClient) {
      reject(new Error('Need initialize redis client first!'));
      return;
    }
    redisClient.get(key, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

const set = (key, data, expiredTime) => {
  return new Promise((resolve, reject) => {
    if (!redisClient) {
      reject(new Error('Need initialize redis client first!'));
      return;
    }
    if (expiredTime) {
      redisClient.set(key, data, 'EX', expiredTime, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      redisClient.set(key, data, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    }
  });
};

const promiseGetData = async (key) => {
  try {
    let data = await get(key);
    data = data ? JSON.parse(data) : data;
    return data;
  } catch (error) {
    throw error;
  }
};

const promiseSetData = async (key, data, expiredTime) => {
  try {
    data = JSON.stringify(data);
    return await set(key, data, expiredTime);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  initialize,
  get,
  set,
  promiseGetData,
  promiseSetData,
};