const express = require('express');
const multer = require('multer');

const router = express.Router();
const { config } = global.appContext;
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


module.exports = router;
