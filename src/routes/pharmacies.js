/**
 * 동물약국 라우터
 */

const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');

// CSV 데이터 import (관리자용)
router.post('/import', pharmacyController.importCSVData);

// 약국 회원가입
router.post('/register', pharmacyController.registerPharmacy);

// 약국 로그인
router.post('/login', pharmacyController.loginPharmacy);

// 약국 이메일 중복 확인
router.get('/check-email', pharmacyController.checkEmail);

// 사업자번호 중복 확인
router.get('/check-business-number', pharmacyController.checkBusinessNumber);

// 주변 동물약국 검색
router.get('/nearby', pharmacyController.findNearby);

// 키워드 검색
router.get('/search', pharmacyController.searchByKeyword);

// 네이버 지도 API용 마커 데이터 조회
router.get('/markers', pharmacyController.getMapMarkers);

// 24시간 운영 약국 조회
router.get('/24hour', pharmacyController.get24HourPharmacies);

// 평점 높은 약국 조회
router.get('/top-rated', pharmacyController.getTopRated);

// 동물약국 상세 정보 조회 (맨 마지막에 위치 - :pharmacyId 패턴이 다른 라우트와 충돌 방지)
router.get('/:pharmacyId', pharmacyController.getDetail);

module.exports = router;

