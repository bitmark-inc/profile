const express = require('express');
const multer = require('multer');

const router = express.Router();
const { config, dbUtil } = global.appContext;
const upload = multer({ dest: `${config.saved_file_folder}/temp` });

let { assetAPIs, accountAPIs } = require('./../apis');
router.post('/s/asset/thumbnail', upload.single('file'), assetAPIs.postThumbnail);
router.get('/s/asset/thumbnail', assetAPIs.getThumbnail);

router.post('/s/asset/limit-by-issuer', assetAPIs.postLimitedEdition);
router.get('/s/asset/limit-by-issuer', assetAPIs.getLimitedEdition);

router.get('/s/account/identities', accountAPIs.getIdentities);
router.get('/s/account/identities/:accountNumber', accountAPIs.getIdentity);

router.get('/s/status', (req, res) => res.send({ ok: true }));

router.get('/asset/:assetId/claim', assetAPIs.claimAsset);

router.get('/api/health', async (req, res) => {
  try {
    let query = dbUtil.squel.select().from('pg_catalog.pg_user')
      .where('usename = ?', config.database.user)
      .toParam();
    console.log('query :', query);
    let returnedData = await dbUtil.executeQuery(query);
    console.log('returnedData :', returnedData);
    if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
      res.status(200);
      res.send({ ok: true });
    } else {
      res.status(500);
      res.send({ ok: false });
    }
  } catch (error) {
    console.log('error :', error);
    res.status(500);
    res.send({ ok: false });
  }
});


module.exports = router;
