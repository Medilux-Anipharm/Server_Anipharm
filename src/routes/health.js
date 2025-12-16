const express = require('express');
const router = express.Router();
const healthRecordController = require('../controllers/healthRecordController');
const { authenticate } = require('../middleware/auth');

/**
 * 건강 기록 생성
 * POST /api/health/records
 */
router.post('/records', authenticate, healthRecordController.createHealthRecord);

/**
 * 건강 기록 수정
 * PUT /api/health/records/:recordId
 */
router.put('/records/:recordId', authenticate, healthRecordController.updateHealthRecord);

/**
 * 건강 기록 삭제
 * DELETE /api/health/records/:recordId
 */
router.delete('/records/:recordId', authenticate, healthRecordController.deleteHealthRecord);

/**
 * 배변 사진 저장/업데이트
 * PUT /api/health/records/:recordId/feces-photo
 */
router.put('/records/:recordId/feces-photo', authenticate, healthRecordController.saveFecesPhoto);

/**
 * 증상 사진 추가
 * POST /api/health/records/:recordId/symptom-photos
 */
router.post('/records/:recordId/symptom-photos', authenticate, healthRecordController.addSymptomPhoto);

/**
 * 증상 사진 삭제
 * DELETE /api/health/records/:recordId/symptom-photos
 */
router.delete('/records/:recordId/symptom-photos', authenticate, healthRecordController.removeSymptomPhoto);

/**
 * 증상 사진 전체 교체
 * PUT /api/health/records/:recordId/symptom-photos
 */
router.put('/records/:recordId/symptom-photos', authenticate, healthRecordController.updateSymptomPhotos);

module.exports = router;

