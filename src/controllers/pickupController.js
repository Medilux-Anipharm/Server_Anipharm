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
  try {
    const userId = req.user.userId;
    const { pharmacyId, products, customerMemo, estimatedDays } = req.body;

    // 유효성 검사
    if (!pharmacyId) {
      return res.status(400).json({
        success: false,
        message: '약국을 선택해주세요.',
      });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: '픽업할 상품을 선택해주세요.',
      });
    }

    // estimatedDays는 3 또는 5만 가능
    const validEstimatedDays = [3, 5].includes(estimatedDays) ? estimatedDays : 5;

    const pickup = await pickupService.createPickupRequest(
      userId,
      pharmacyId,
      products,
      customerMemo,
      validEstimatedDays
    );

    res.status(201).json({
      success: true,
      message: '픽업 요청이 성공적으로 생성되었습니다.',
      data: pickup,
    });
  } catch (error) {
    console.error('픽업 요청 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '픽업 요청 생성 중 오류가 발생했습니다.',
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
  try {
    const { pickupId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const pickup = await pickupService.getPickupRequestById(pickupId);

    // 권한 확인 (본인 또는 약국 관계자만 조회 가능)
    if (
      pickup.userId !== userId &&
      userRole !== 'pharmacy' &&
      userRole !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: '해당 픽업 요청을 조회할 권한이 없습니다.',
      });
    }

    res.json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    console.error('픽업 요청 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '픽업 요청 조회 중 오류가 발생했습니다.',
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
 * GET /api/pickup/pharmacy/requests?status=REQUESTED
 */
exports.getPharmacyPickupRequests = async (req, res) => {
  try {
    const pharmacyId = req.user.pharmacyId;
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
    const pharmacyId = req.user.pharmacyId;

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
  try {
    const { pickupId } = req.params;
    const pharmacyId = req.user.pharmacyId;
    const {
      status,
      pharmacyMemo,
      rejectionReason,
      cancelReason,
      totalAmount,
      estimatedPickupDate,
      productPrices,
    } = req.body;

    if (!pharmacyId) {
      return res.status(403).json({
        success: false,
        message: '약국 권한이 필요합니다.',
      });
    }

    if (!status) {
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

    const pickup = await pickupService.updatePickupStatus(
      pickupId,
      pharmacyId,
      status,
      additionalData
    );

    // 상태 변경 시 고객에게 알림 전송
    // TODO: 알림 시스템 구현 후 연동
    // await notificationService.sendPickupStatusNotification(pickup);

    res.json({
      success: true,
      message: '픽업 상태가 업데이트되었습니다.',
      data: pickup,
    });
  } catch (error) {
    console.error('픽업 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '픽업 상태 업데이트 중 오류가 발생했습니다.',
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
    const pharmacyId = req.user.pharmacyId;

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
    const pharmacyId = req.user.pharmacyId;
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
