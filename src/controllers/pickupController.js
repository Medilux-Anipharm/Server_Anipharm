/**
 * Pickup Controller
 * 픽업 요청 관련 컨트롤러
 */

const pickupService = require('../services/pickupService');

/**
 * 픽업 요청 생성 (고객)
 * POST /api/pickup/request
 */
exports.createPickupRequest = async (req, res) => {
  const logger = require('../utils/logger');
  
  try {
    const userId = req.user?.userId;
    const { pharmacyId, products, customerMemo, estimatedDays } = req.body;

    logger.info(`[PickupController] 픽업 요청 생성 요청 - userId: ${userId}, pharmacyId: ${pharmacyId}, products: ${products?.length || 0}개`);
    logger.info(`[PickupController] 요청 본문:`, JSON.stringify({ pharmacyId, products, customerMemo, estimatedDays }, null, 2));

    // 유효성 검사
    if (!userId) {
      logger.error('[PickupController] userId가 없습니다.');
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    if (!pharmacyId) {
      logger.error('[PickupController] pharmacyId가 없습니다.');
      return res.status(400).json({
        success: false,
        message: '약국을 선택해주세요.',
      });
    }

    if (!products || products.length === 0) {
      logger.error('[PickupController] products가 없거나 비어있습니다.');
      return res.status(400).json({
        success: false,
        message: '픽업할 상품을 선택해주세요.',
      });
    }

    // products 유효성 검사
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product.categoryId || !product.categoryName || !product.productName) {
        logger.error(`[PickupController] 상품 ${i + 1}의 필수 필드가 누락되었습니다:`, product);
        return res.status(400).json({
          success: false,
          message: `상품 ${i + 1}의 필수 정보가 누락되었습니다.`,
        });
      }
    }

    // estimatedDays는 3 또는 5만 가능
    const validEstimatedDays = [3, 5].includes(estimatedDays) ? estimatedDays : 5;

    logger.info(`[PickupController] 서비스 호출 시작 - userId: ${userId}, pharmacyId: ${pharmacyId}, estimatedDays: ${validEstimatedDays}`);

    const pickup = await pickupService.createPickupRequest(
      userId,
      pharmacyId,
      products,
      customerMemo,
      validEstimatedDays
    );

    logger.info(`[PickupController] 픽업 요청 생성 성공 - pickupId: ${pickup.pickupId}`);

    res.status(201).json({
      success: true,
      message: '픽업 요청이 성공적으로 생성되었습니다.',
      data: pickup,
    });
  } catch (error) {
    logger.error('[PickupController] 픽업 요청 생성 오류:', error);
    logger.error('[PickupController] 에러 스택:', error.stack);
    
    res.status(500).json({
      success: false,
      message: error.message || '픽업 요청 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * 내 픽업 요청 목록 조회 (고객)
 * GET /api/pickup/my-requests?status=REQUESTED
 */
exports.getMyPickupRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    const pickups = await pickupService.getUserPickupRequests(userId, status);

    res.json({
      success: true,
      data: pickups,
      count: pickups.length,
    });
  } catch (error) {
    console.error('픽업 요청 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '픽업 요청 목록 조회 중 오류가 발생했습니다.',
    });
  }
};

/**
 * 픽업 요청 상세 조회
 * GET /api/pickup/:pickupId
 */
exports.getPickupRequestDetail = async (req, res) => {
  const logger = require('../utils/logger');
  
  try {
    const { pickupId } = req.params;
    const userId = req.user?.userId;
    
    logger.info(`[PickupController] 픽업 요청 상세 조회 시작 - pickupId: ${pickupId}, userId: ${userId}`);

    if (!userId) {
      logger.error('[PickupController] userId가 없습니다.');
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const pickup = await pickupService.getPickupRequestById(pickupId);

    // 권한 확인 (본인만 조회 가능)
    // userId를 숫자로 변환하여 비교
    const pickupUserId = typeof pickup.userId === 'string' ? parseInt(pickup.userId, 10) : pickup.userId;
    const currentUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    logger.info(`[PickupController] 권한 확인 - pickup.userId: ${pickupUserId}, currentUserId: ${currentUserId}`);

    if (pickupUserId !== currentUserId) {
      logger.warn(`[PickupController] 권한 없음 - pickup.userId: ${pickupUserId}, currentUserId: ${currentUserId}`);
      return res.status(403).json({
        success: false,
        message: '해당 픽업 요청을 조회할 권한이 없습니다.',
      });
    }

    logger.info(`[PickupController] 픽업 요청 상세 조회 성공 - pickupId: ${pickupId}`);

    res.json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    logger.error('[PickupController] 픽업 요청 상세 조회 오류:', error);
    logger.error('[PickupController] 에러 스택:', error.stack);
    
    res.status(500).json({
      success: false,
      message: error.message || '픽업 요청 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * 픽업 취소 (고객)
 * PUT /api/pickup/:pickupId/cancel
 */
exports.cancelPickupRequest = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const userId = req.user.userId;
    const { cancelReason } = req.body;

    const pickup = await pickupService.cancelPickupByUser(
      pickupId,
      userId,
      cancelReason
    );

    res.json({
      success: true,
      message: '픽업 요청이 취소되었습니다.',
      data: pickup,
    });
  } catch (error) {
    console.error('픽업 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '픽업 취소 중 오류가 발생했습니다.',
    });
  }
};

/**
 * 약국의 픽업 요청 목록 조회
 * GET /api/pickup/pharmacy/request?status=REQUESTED
 */
exports.getPharmacyPickupRequests = async (req, res) => {
  try {
    const pharmacyId = req.pharmacy?.pharmacyId;
    const { status } = req.query;

    if (!pharmacyId) {
      return res.status(403).json({
        success: false,
        message: '약국 권한이 필요합니다.',
      });
    }

    const pickups = await pickupService.getPharmacyPickupRequests(
      pharmacyId,
      status
    );

    res.json({
      success: true,
      data: pickups,
      count: pickups.length,
    });
  } catch (error) {
    console.error('약국 픽업 요청 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '픽업 요청 목록 조회 중 오류가 발생했습니다.',
    });
  }
};

/**
 * 약국 통계 조회
 * GET /api/pickup/pharmacy/stats
 */
exports.getPharmacyStats = async (req, res) => {
  try {
    const pharmacyId = req.pharmacy?.pharmacyId;

    if (!pharmacyId) {
      return res.status(403).json({
        success: false,
        message: '약국 권한이 필요합니다.',
      });
    }

    const stats = await pickupService.getPharmacyStats(pharmacyId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('약국 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '통계 조회 중 오류가 발생했습니다.',
    });
  }
};

/**
 * 픽업 상태 업데이트 (약국)
 * PUT /api/pickup/pharmacy/:pickupId/status
 */
exports.updatePickupStatus = async (req, res) => {
  const logger = require('../utils/logger');
  
  try {
    const { pickupId } = req.params;
    const pharmacyId = req.pharmacy?.pharmacyId;
    const {
      status,
      pharmacyMemo,
      rejectionReason,
      cancelReason,
      totalAmount,
      estimatedPickupDate,
      productPrices,
    } = req.body;

    logger.info('========================================');
    logger.info('[PickupController] 픽업 상태 업데이트 요청 시작');
    logger.info('[PickupController] req.params:', JSON.stringify(req.params, null, 2));
    logger.info('[PickupController] req.pharmacy:', JSON.stringify(req.pharmacy, null, 2));
    logger.info('[PickupController] req.body:', JSON.stringify(req.body, null, 2));
    logger.info('[PickupController] pickupId (원본):', pickupId, typeof pickupId);
    logger.info('[PickupController] pharmacyId:', pharmacyId, typeof pharmacyId);
    logger.info('[PickupController] status:', status, typeof status);

    // pickupId를 숫자로 변환
    const pickupIdNum = parseInt(pickupId, 10);
    if (isNaN(pickupIdNum)) {
      logger.error('[PickupController] pickupId가 유효한 숫자가 아님:', pickupId);
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 픽업 요청 ID입니다.',
      });
    }

    if (!pharmacyId) {
      logger.error('[PickupController] 약국 권한 없음 - req.pharmacy:', req.pharmacy);
      return res.status(403).json({
        success: false,
        message: '약국 권한이 필요합니다.',
      });
    }

    if (!status) {
      logger.error('[PickupController] 상태가 없음');
      return res.status(400).json({
        success: false,
        message: '상태를 선택해주세요.',
      });
    }

    const additionalData = {
      pharmacyMemo,
      rejectionReason,
      cancelReason,
      totalAmount,
      estimatedPickupDate,
      productPrices,
    };

    logger.info('[PickupController] 서비스 호출 시작...');
    logger.info('[PickupController] 서비스 파라미터:', {
      pickupId: pickupIdNum,
      pharmacyId,
      status,
      additionalData,
    });

    const pickup = await pickupService.updatePickupStatus(
      pickupIdNum,
      pharmacyId,
      status,
      additionalData
    );

    logger.info('[PickupController] 서비스 호출 성공');
    logger.info('[PickupController] 업데이트된 픽업 요청:', {
      pickupId: pickup.pickupId,
      status: pickup.status,
      pharmacyId: pickup.pharmacyId,
    });

    // 상태 변경 시 고객에게 알림 전송
    // TODO: 알림 시스템 구현 후 연동
    // await notificationService.sendPickupStatusNotification(pickup);

    logger.info('[PickupController] 픽업 상태 업데이트 성공');
    logger.info('========================================');

    res.json({
      success: true,
      message: '픽업 상태가 업데이트되었습니다.',
      data: pickup,
    });
  } catch (error) {
    logger.error('========================================');
    logger.error('[PickupController] 픽업 상태 업데이트 오류');
    logger.error('[PickupController] 에러 타입:', error.name);
    logger.error('[PickupController] 에러 메시지:', error.message);
    logger.error('[PickupController] 에러 스택:', error.stack);
    logger.error('========================================');
    
    res.status(500).json({
      success: false,
      message: error.message || '픽업 상태 업데이트 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * 픽업 완료 처리 (약국)
 * PUT /api/pickup/pharmacy/:pickupId/complete
 */
exports.completePickup = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const pharmacyId = req.pharmacy?.pharmacyId;

    if (!pharmacyId) {
      return res.status(403).json({
        success: false,
        message: '약국 권한이 필요합니다.',
      });
    }

    const pickup = await pickupService.completePickup(pickupId, pharmacyId);

    res.json({
      success: true,
      message: '픽업이 완료되었습니다.',
      data: pickup,
    });
  } catch (error) {
    console.error('픽업 완료 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '픽업 완료 처리 중 오류가 발생했습니다.',
    });
  }
};

/**
 * 약국이 픽업 취소
 * PUT /api/pickup/pharmacy/:pickupId/cancel
 */
exports.cancelPickupByPharmacy = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const pharmacyId = req.pharmacy?.pharmacyId;
    const { cancelReason } = req.body;

    if (!pharmacyId) {
      return res.status(403).json({
        success: false,
        message: '약국 권한이 필요합니다.',
      });
    }

    if (!cancelReason) {
      return res.status(400).json({
        success: false,
        message: '취소 사유를 입력해주세요.',
      });
    }

    const pickup = await pickupService.updatePickupStatus(
      pickupId,
      pharmacyId,
      'CANCELED',
      { cancelReason }
    );

    res.json({
      success: true,
      message: '픽업 요청이 취소되었습니다.',
      data: pickup,
    });
  } catch (error) {
    console.error('픽업 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '픽업 취소 중 오류가 발생했습니다.',
    });
  }
};

/**
 * 자동 취소 실행 (스케줄러용)
 * POST /api/pickup/auto-cancel
 */
exports.runAutoCancel = async (req, res) => {
  try {
    // 관리자만 실행 가능
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자 권한이 필요합니다.',
      });
    }

    const canceledCount = await pickupService.autoCancel();

    res.json({
      success: true,
      message: `${canceledCount}건의 픽업 요청이 자동 취소되었습니다.`,
      data: {
        canceledCount,
      },
    });
  } catch (error) {
    console.error('자동 취소 실행 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '자동 취소 실행 중 오류가 발생했습니다.',
    });
  }
};
