/**
 * Pickup Routes
 * 픽업 요청 관련 라우트
 */

const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');
const { authenticate } = require('../middleware/auth');

// ==========================================
// 고객용 엔드포인트
// ==========================================

/**
 * 픽업 요청 생성
 * POST /api/pickup/request
 * 인증 필요
 */
router.post('/request', authenticate, pickupController.createPickupRequest);

/**
 * 내 픽업 요청 목록 조회
 * GET /api/pickup/my-requests?status=REQUESTED
 * 인증 필요
 */
router.get('/my-requests', authenticate, pickupController.getMyPickupRequests);

/**
 * 픽업 요청 상세 조회
 * GET /api/pickup/:pickupId
 * 인증 필요
 */
router.get('/:pickupId', authenticate, pickupController.getPickupRequestDetail);

/**
 * 픽업 취소 (고객)
 * PUT /api/pickup/:pickupId/cancel
 * 인증 필요
 */
router.put('/:pickupId/cancel', authenticate, pickupController.cancelPickupRequest);

// ==========================================
// 약국용 엔드포인트
// ==========================================

/**
 * 약국의 픽업 요청 목록 조회
 * GET /api/pickup/pharmacy/requests?status=REQUESTED
 * 인증 필요 (약국 권한)
 */
router.get(
  '/pharmacy/requests',
  authenticate,
  pickupController.getPharmacyPickupRequests
);

/**
 * 약국 통계 조회
 * GET /api/pickup/pharmacy/stats
 * 인증 필요 (약국 권한)
 */
router.get(
  '/pharmacy/stats',
  authenticate,
  pickupController.getPharmacyStats
);

/**
 * 픽업 상태 업데이트 (약국)
 * PUT /api/pickup/pharmacy/:pickupId/status
 * 인증 필요 (약국 권한)
 *
 * Request Body:
 * {
 *   "status": "ACCEPTED" | "REJECTED" | "WAITING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED",
 *   "pharmacyMemo": "메모",
 *   "rejectionReason": "거절 사유",
 *   "cancelReason": "취소 사유",
 *   "totalAmount": 50000,
 *   "estimatedPickupDate": "2026-01-13T00:00:00Z",
 *   "productPrices": [
 *     { "productId": 1, "unitPrice": 25000, "quantity": 2 }
 *   ]
 * }
 */
router.put(
  '/pharmacy/:pickupId/status',
  authenticate,
  pickupController.updatePickupStatus
);

/**
 * 픽업 완료 처리 (약국)
 * PUT /api/pickup/pharmacy/:pickupId/complete
 * 인증 필요 (약국 권한)
 */
router.put(
  '/pharmacy/:pickupId/complete',
  authenticate,
  pickupController.completePickup
);

/**
 * 픽업 취소 (약국)
 * PUT /api/pickup/pharmacy/:pickupId/cancel
 * 인증 필요 (약국 권한)
 */
router.put(
  '/pharmacy/:pickupId/cancel',
  authenticate,
  pickupController.cancelPickupByPharmacy
);

// ==========================================
// 관리자용 엔드포인트
// ==========================================

/**
 * 자동 취소 실행 (스케줄러용)
 * POST /api/pickup/auto-cancel
 * 인증 필요 (관리자 권한)
 */
router.post(
  '/auto-cancel',
  authenticate,
  pickupController.runAutoCancel
);

module.exports = router;
