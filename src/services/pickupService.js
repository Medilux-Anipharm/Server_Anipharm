/**
 * Pickup Service
 * 픽업 관련 비즈니스 로직
 */

const { PickupRequest, PickupProduct, User, Pharmacy } = require('../models');
const { Op } = require('sequelize');

class PickupService {
  /**
   * 픽업 요청 생성
   * @param {number} userId - 사용자 ID
   * @param {number} pharmacyId - 약국 ID
   * @param {Array} products - 상품 목록
   * @param {string} customerMemo - 고객 메모
   * @param {number} estimatedDays - 예상 픽업 기간 (3 또는 5일)
   */
  async createPickupRequest(userId, pharmacyId, products, customerMemo, estimatedDays = 5) {
    const transaction = await require('../models').sequelize.transaction();

    try {
      // 약국 존재 확인
      const pharmacy = await Pharmacy.findByPk(pharmacyId);
      if (!pharmacy) {
        throw new Error('약국을 찾을 수 없습니다.');
      }

      // 예상 픽업일 계산
      const estimatedPickupDate = new Date();
      estimatedPickupDate.setDate(estimatedPickupDate.getDate() + estimatedDays);

      // 자동 취소일 계산 (요청일로부터 5일 후)
      const autoCancelDate = new Date();
      autoCancelDate.setDate(autoCancelDate.getDate() + 5);

      // 픽업 요청 생성
      const pickupRequest = await PickupRequest.create(
        {
          userId,
          pharmacyId,
          status: 'REQUESTED',
          customerMemo,
          estimatedPickupDate,
          autoCancelDate,
          requestedAt: new Date(),
        },
        { transaction }
      );

      // 상품 목록 생성
      const pickupProducts = products.map((product) => ({
        pickupId: pickupRequest.pickupId,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        productName: product.productName,
        manufacturer: product.manufacturer,
        quantity: product.quantity || 1,
        petName: product.petName,
        petType: product.petType,
        note: product.note,
      }));

      await PickupProduct.bulkCreate(pickupProducts, { transaction });

      await transaction.commit();

      // 생성된 픽업 요청 조회 (상품 포함)
      return await this.getPickupRequestById(pickupRequest.pickupId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 픽업 요청 상세 조회
   * @param {number} pickupId - 픽업 요청 ID
   */
  async getPickupRequestById(pickupId) {
    const pickup = await PickupRequest.findByPk(pickupId, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['userId', 'name', 'phone', 'email'],
        },
        {
          model: Pharmacy,
          as: 'pharmacy',
          attributes: ['pharmacyId', 'name', 'phone', 'address', 'addressDetail'],
        },
        {
          model: PickupProduct,
          as: 'products',
        },
      ],
    });

    if (!pickup) {
      throw new Error('픽업 요청을 찾을 수 없습니다.');
    }

    return pickup;
  }

  /**
   * 사용자의 픽업 요청 목록 조회
   * @param {number} userId - 사용자 ID
   * @param {string} status - 상태 필터 (선택)
   */
  async getUserPickupRequests(userId, status = null) {
    const where = { userId };
    if (status) {
      where.status = status;
    }

    return await PickupRequest.findAll({
      where,
      include: [
        {
          model: Pharmacy,
          as: 'pharmacy',
          attributes: ['pharmacyId', 'name', 'phone', 'address'],
        },
        {
          model: PickupProduct,
          as: 'products',
        },
      ],
      order: [['requestedAt', 'DESC']],
    });
  }

  /**
   * 약국의 픽업 요청 목록 조회
   * @param {number} pharmacyId - 약국 ID
   * @param {string} status - 상태 필터 (선택)
   */
  async getPharmacyPickupRequests(pharmacyId, status = null) {
    const where = { pharmacyId };
    if (status) {
      where.status = status;
    }

    return await PickupRequest.findAll({
      where,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['userId', 'name', 'phone', 'email'],
        },
        {
          model: PickupProduct,
          as: 'products',
        },
      ],
      order: [['requestedAt', 'DESC']],
    });
  }

  /**
   * 약국 통계 조회
   * @param {number} pharmacyId - 약국 ID
   */
  async getPharmacyStats(pharmacyId) {
    // 상태별 카운트
    const statusCounts = await PickupRequest.findAll({
      where: { pharmacyId },
      attributes: [
        'status',
        [require('../models').sequelize.fn('COUNT', require('../models').sequelize.col('pickupId')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const stats = {
      REQUESTED: 0,
      REJECTED: 0,
      WAITING: 0,
      ACCEPTED: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELED: 0,
      todayCompleted: 0,
      weekCompleted: 0,
      monthCompleted: 0,
    };

    statusCounts.forEach((stat) => {
      stats[stat.status] = parseInt(stat.count);
    });

    // 오늘 완료 건수
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    stats.todayCompleted = await PickupRequest.count({
      where: {
        pharmacyId,
        status: 'COMPLETED',
        completedAt: {
          [Op.gte]: todayStart,
        },
      },
    });

    // 이번 주 완료 건수
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    stats.weekCompleted = await PickupRequest.count({
      where: {
        pharmacyId,
        status: 'COMPLETED',
        completedAt: {
          [Op.gte]: weekStart,
        },
      },
    });

    // 이번 달 완료 건수
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    stats.monthCompleted = await PickupRequest.count({
      where: {
        pharmacyId,
        status: 'COMPLETED',
        completedAt: {
          [Op.gte]: monthStart,
        },
      },
    });

    return stats;
  }

  /**
   * 픽업 상태 업데이트
   * @param {number} pickupId - 픽업 요청 ID
   * @param {number} pharmacyId - 약국 ID
   * @param {string} newStatus - 새로운 상태
   * @param {object} additionalData - 추가 데이터 (메모, 금액 등)
   */
  async updatePickupStatus(pickupId, pharmacyId, newStatus, additionalData = {}) {
    const transaction = await require('../models').sequelize.transaction();

    try {
      const pickup = await PickupRequest.findOne({
        where: { pickupId, pharmacyId },
        transaction,
      });

      if (!pickup) {
        throw new Error('픽업 요청을 찾을 수 없습니다.');
      }

      // 상태 변경 검증
      this.validateStatusTransition(pickup.status, newStatus);

      // 업데이트 데이터 준비
      const updateData = { status: newStatus };

      // 상태에 따른 타임스탬프 업데이트
      switch (newStatus) {
        case 'ACCEPTED':
          updateData.acceptedAt = new Date();
          if (additionalData.estimatedPickupDate) {
            updateData.estimatedPickupDate = additionalData.estimatedPickupDate;
          }
          break;
        case 'PREPARING':
          updateData.preparedAt = new Date();
          break;
        case 'READY':
          updateData.readyAt = new Date();
          break;
        case 'COMPLETED':
          updateData.completedAt = new Date();
          break;
        case 'REJECTED':
          updateData.rejectionReason = additionalData.rejectionReason;
          break;
        case 'WAITING':
          updateData.pharmacyMemo = additionalData.pharmacyMemo;
          break;
        case 'CANCELED':
          updateData.canceledAt = new Date();
          updateData.canceledBy = 'PHARMACY';
          updateData.cancelReason = additionalData.cancelReason;
          break;
      }

      // 약국 메모
      if (additionalData.pharmacyMemo) {
        updateData.pharmacyMemo = additionalData.pharmacyMemo;
      }

      // 총 금액
      if (additionalData.totalAmount !== undefined) {
        updateData.totalAmount = additionalData.totalAmount;
      }

      await pickup.update(updateData, { transaction });

      // 상품별 가격 업데이트 (ACCEPTED 상태일 때)
      if (newStatus === 'ACCEPTED' && additionalData.productPrices) {
        for (const priceInfo of additionalData.productPrices) {
          await PickupProduct.update(
            {
              unitPrice: priceInfo.unitPrice,
              totalPrice: priceInfo.unitPrice * priceInfo.quantity,
            },
            {
              where: {
                id: priceInfo.productId,
                pickupId,
              },
              transaction,
            }
          );
        }
      }

      await transaction.commit();

      return await this.getPickupRequestById(pickupId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 사용자가 픽업 취소
   * @param {number} pickupId - 픽업 요청 ID
   * @param {number} userId - 사용자 ID
   * @param {string} cancelReason - 취소 사유
   */
  async cancelPickupByUser(pickupId, userId, cancelReason) {
    const transaction = await require('../models').sequelize.transaction();

    try {
      const pickup = await PickupRequest.findOne({
        where: { pickupId, userId },
        transaction,
      });

      if (!pickup) {
        throw new Error('픽업 요청을 찾을 수 없습니다.');
      }

      // 취소 가능한 상태 확인
      if (!['REQUESTED', 'ACCEPTED', 'WAITING'].includes(pickup.status)) {
        throw new Error('현재 상태에서는 취소할 수 없습니다.');
      }

      await pickup.update(
        {
          status: 'CANCELED',
          canceledAt: new Date(),
          canceledBy: 'USER',
          cancelReason,
        },
        { transaction }
      );

      await transaction.commit();

      return await this.getPickupRequestById(pickupId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 상태 전환 검증
   * @param {string} currentStatus - 현재 상태
   * @param {string} newStatus - 새로운 상태
   */
  validateStatusTransition(currentStatus, newStatus) {
    const allowedTransitions = {
      REQUESTED: ['ACCEPTED', 'REJECTED', 'WAITING', 'CANCELED'],
      WAITING: ['ACCEPTED', 'REJECTED', 'CANCELED'],
      ACCEPTED: ['PREPARING', 'CANCELED'],
      PREPARING: ['READY', 'CANCELED'],
      READY: ['COMPLETED', 'CANCELED'],
      REJECTED: [],
      COMPLETED: [],
      CANCELED: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `${currentStatus} 상태에서 ${newStatus} 상태로 변경할 수 없습니다.`
      );
    }
  }

  /**
   * 자동 취소 처리 (5일 지난 REQUESTED 상태)
   * 스케줄러에서 주기적으로 호출
   */
  async autoCancel() {
    const now = new Date();

    const expiredRequests = await PickupRequest.findAll({
      where: {
        status: 'REQUESTED',
        autoCancelDate: {
          [Op.lte]: now,
        },
      },
    });

    for (const request of expiredRequests) {
      await request.update({
        status: 'CANCELED',
        canceledAt: now,
        canceledBy: 'AUTO',
        cancelReason: '약국 응답 없음 (5일 경과)',
      });

      // 사용자에게 알림 전송
      // TODO: 알림 시스템 구현 후 연동
    }

    return expiredRequests.length;
  }

  /**
   * 픽업 완료 처리 (약국에서 확인)
   * @param {number} pickupId - 픽업 요청 ID
   * @param {number} pharmacyId - 약국 ID
   */
  async completePickup(pickupId, pharmacyId) {
    return await this.updatePickupStatus(pickupId, pharmacyId, 'COMPLETED');
  }
}

module.exports = new PickupService();
