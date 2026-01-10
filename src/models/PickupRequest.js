/**
 * PickupRequest Model
 * 픽업 요청 모델
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PickupRequest = sequelize.define(
    'PickupRequest',
    {
      pickupId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '픽업 요청 ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '픽업 요청한 고객 ID',
      },
      pharmacyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '픽업 요청 받은 약국 ID',
      },
      status: {
        type: DataTypes.ENUM(
          'REQUESTED',   // 유저 요청
          'REJECTED',    // 불가능
          'WAITING',     // 재고 없음 (발주 중)
          'ACCEPTED',    // 확인 (픽업 수락)
          'PREPARING',   // 준비 중
          'READY',       // 픽업 가능
          'COMPLETED',   // 픽업 완료
          'CANCELED'     // 취소됨
        ),
        allowNull: false,
        defaultValue: 'REQUESTED',
        comment: '픽업 상태',
      },
      totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '총 금액 (약국에서 입력)',
      },
      estimatedPickupDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '예상 픽업일 (3일 또는 5일 후)',
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '요청 일시',
      },
      acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '수락 일시',
      },
      preparedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '준비 시작 일시',
      },
      readyAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '픽업 가능 일시',
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '픽업 완료 일시',
      },
      canceledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '취소 일시',
      },
      autoCancelDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '자동 취소 예정일 (5일 후)',
      },
      customerMemo: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '고객 요청 메모',
      },
      pharmacyMemo: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '약국 메모 (거절/대기 사유 등)',
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '거절 사유',
      },
      cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '취소 사유',
      },
      canceledBy: {
        type: DataTypes.ENUM('USER', 'PHARMACY', 'AUTO'),
        allowNull: true,
        comment: '취소 주체 (사용자/약국/자동)',
      },
    },
    {
      tableName: 'pickup_requests',
      timestamps: true,
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['pharmacyId'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['requestedAt'],
        },
        {
          fields: ['autoCancelDate'],
        },
      ],
    }
  );

  PickupRequest.associate = (models) => {
    // 고객과의 관계
    PickupRequest.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'customer',
    });

    // 약국과의 관계
    PickupRequest.belongsTo(models.Pharmacy, {
      foreignKey: 'pharmacyId',
      as: 'pharmacy',
    });

    // 픽업 상품 목록
    PickupRequest.hasMany(models.PickupProduct, {
      foreignKey: 'pickupId',
      as: 'products',
      onDelete: 'CASCADE',
    });
  };

  return PickupRequest;
};
