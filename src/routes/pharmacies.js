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

// 키워드 검색
router.get('/search', veterinaryPharmacyController.searchByKeyword);

// 동물약국 상세 정보 조회
router.get('/:pharmacyId', veterinaryPharmacyController.getDetail);

// 네이버 지도 API용 마커 데이터 조회
router.get('/markers', veterinaryPharmacyController.getMapMarkers);

// 24시간 운영 약국 조회
router.get('/24hour', veterinaryPharmacyController.get24HourPharmacies);

// 평점 높은 약국 조회
router.get('/top-rated', veterinaryPharmacyController.getTopRated);

module.exports = router;

