const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pharmacy = sequelize.define('Pharmacy', {
    pharmacyId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'pharmacy_id'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    addressDetail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'address_detail'
    },
    operatingHours: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'operating_hours',
      comment: 'CSV에서 가져온 운영시간 원본 데이터'
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '홈페이지 URL'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    ratingAverage: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
      field: 'rating_average'
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'review_count'
    },
    pharmacyEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: 'pharmacy_email',
      comment: '약국 계정 이메일'
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'password_hash',
      comment: '비밀번호 해시'
    },
    businessNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'business_number',
      comment: '사업자 등록번호'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
      comment: '계정 활성화 상태'
    }
  }, {
    tableName: 'pharmacies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['latitude', 'longitude'], name: 'idx_pharmacy_location' },
      { fields: ['rating_average'] },
      { fields: ['pharmacy_email'], name: 'idx_pharmacy_email' },
      { fields: ['business_number'], name: 'idx_business_number' }
    ]
  });

  Pharmacy.associate = (models) => {
    // 관계 없음
  };

  return Pharmacy;
};

