const moment = require('moment');
let { dbUtil, } = global.appContext;

const getRecord = async (key) => {
  let query = dbUtil.squel.select().from('profile.key_value')
    .where('profile_key = ?', key);
  let data = await dbUtil.executeQuery(query.toParam());
  let result = (data && data.rows && data.rows.length > 0) ? data.rows[0] : null;
  if (result) {
    return {
      key: result.profile_key,
      value: JSON.parse(result.profile_value),
    };
  }
  return null;
};

const setRecord = async (key, value) => {
  let existRecord = getRecord(key);

  let query;
  if (existRecord) {
    query = dbUtil.squel.update().table('profile.key_value')
      .set('modified_at', moment().format('YYYY-MM-DD HH:mm:ssZZ'))
      .set('profile_value', JSON.stringify(value))
      .where('profile_key = ?', key);
  } else {
    query = dbUtil.squel.insert().into('profile.key_value')
      .set('profile_value', JSON.stringify(value))
      .set('profile_key', key);
  }
  await dbUtil.executeQuery(query.toParam());
};

module.exports = {
  getRecord,
  setRecord,
};