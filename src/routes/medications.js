/**
 * 약제품 라우터
 */

const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');

// JSON 데이터 import (관리자용)
router.post('/import', medicationController.importJSONData);

// 키워드로 약제품 검색
router.get('/search', medicationController.searchByKeyword);

// 건강 고민별 약제품 추천
router.get('/recommend', medicationController.recommendByHealthConcern);

// 사용자 메시지에서 약제품 키워드 추출 (테스트용)
router.post('/extract-keywords', medicationController.extractKeywords);

// 약제품 상세 정보 조회 (마지막에 위치 - 동적 라우트)
router.get('/:medicationId', medicationController.getDetail);

module.exports = router;

