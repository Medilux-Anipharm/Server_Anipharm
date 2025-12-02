/**
 * 동물약국 라우터
 */

const express = require('express');
const router = express.Router();
const veterinaryPharmacyController = require('../controllers/veterinaryPharmacy');

// CSV 데이터 import (관리자용)
router.post('/import', veterinaryPharmacyController.importCSVData);

// 주변 동물약국 검색
router.get('/nearby', veterinaryPharmacyController.findNearby);

// 네이버 지도 API용 마커 데이터 조회
router.get('/markers', veterinaryPharmacyController.getMapMarkers);

module.exports = router;

