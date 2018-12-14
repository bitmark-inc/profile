const pg = require('pg');
const squel = require('squel').useFlavour('postgres');
const types = require('pg').types;

const TIMESTAMPTZ_OID = 1184;
const TIMESTAMP_OID = 1114;
const INT8_TYPE = 20;
const NUMERIC_TYPE = 1700;
types.setTypeParser(TIMESTAMP_OID, (value) => new Date(value).toISOString());
types.setTypeParser(TIMESTAMPTZ_OID, (value) => new Date(value).toISOString());
types.setTypeParser(INT8_TYPE, (val) => parseInt(val));
types.setTypeParser(NUMERIC_TYPE, (val) => parseFloat(val));

let pool;
const initialize = (config) => {
  pool = new pg.Pool(config);
  pool.on('error', (err) => {
    console.error('database connection error', err.message, err.stack);
    throw err;
  });
};

const createClient = async () => {
  return await pool.connect();
};

const executeQuery = async (query, client) => {
  if (!pool) {
    throw new Error('run initialize database pool first!');
  }
  let newClient = !client;
  if (!client) {
    client = await createClient();
  }
  try {
    let result = await client.query(query.text, query.values);
    if (newClient) {
      client.release();
    }
    return result;
  } catch (error) {
    if (newClient) {
      client.release();
    }
    throw error;
  }
};

const beginTransaction = async (client) => {
  await client.query('BEGIN');
  return client;
};

const commitTransaction = async (client) => {
  await client.query('COMMIT');
  client.release();
};

const rollbackTransaction = async (client) => {
  await client.query('ROLLBACK');
  client.release();
};

const executeQueriesInTransaction = async (queries, client) => {
  if (!pool) {
    throw new Error('run initialize database pool first!');
  }
  if (!client) {
    client = await createClient();
  }
  try {
    await beginTransaction(client);
    let results = [];
    for (let query of queries) {
      results.push(await client.query(query.text, query.values));
    }
    await commitTransaction(client);
    return results;
  } catch (error) {
    await rollbackTransaction(client);
    throw error;
  }
};

module.exports = {
  initialize,
  squel,
  executeQuery,
  executeQueriesInTransaction,
  createClient,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
};
