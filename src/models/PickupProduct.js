/**
 * PickupProduct Model
 * 픽업 요청 상품 모델
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PickupProduct = sequelize.define(
    'PickupProduct',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '픽업 상품 ID',
      },
      pickupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '픽업 요청 ID',
      },
      categoryId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '카테고리 ID (예: parasite_prevention)',
      },
      categoryName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '카테고리 이름 (예: 구충·예방 관리)',
      },
      productName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '상품명 (사용자가 선택한 상품)',
      },
      manufacturer: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '제조사',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '수량',
      },
      unitPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '단가 (약국에서 입력)',
      },
      totalPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '총 가격 (수량 × 단가)',
      },
      petName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '대상 반려동물 이름',
      },
      petType: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '반려동물 종류 (강아지/고양이)',
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '상품별 메모',
      },
    },
    {
      tableName: 'pickup_products',
      timestamps: true,
      indexes: [
        {
          fields: ['pickupId'],
        },
        {
          fields: ['categoryId'],
        },
      ],
    }
  );

  PickupProduct.associate = (models) => {
    PickupProduct.belongsTo(models.PickupRequest, {
      foreignKey: 'pickupId',
      as: 'pickupRequest',
    });
  };

  return PickupProduct;
};
