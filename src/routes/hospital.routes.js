/**
 * 동물병원 라우터
 */

const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

// CSV 데이터 import (관리자용)
router.post('/import', hospitalController.importCSVData);

// 주변 동물병원 검색
router.get('/nearby', hospitalController.findNearby);

// 키워드로 동물병원 검색
router.get('/search', hospitalController.searchByKeyword);

// 네이버 지도 API용 마커 데이터 조회
router.get('/markers', hospitalController.getMapMarkers);

// 24시간 운영 병원 조회
router.get('/24hour', hospitalController.get24HourHospitals);

// 평점 높은 병원 조회
router.get('/top-rated', hospitalController.getTopRated);

// 동물병원 상세 정보 조회
router.get('/:hospitalId', hospitalController.getDetail);

module.exports = router;

