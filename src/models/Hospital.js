const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hospital = sequelize.define('Hospital', {
    hospitalId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'hospital_id'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    is24h: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_24h'
    },
    isEmergency: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_emergency'
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
    }
  }, {
    tableName: 'veterinary_hospitals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['latitude', 'longitude'], name: 'idx_hospital_location' },
      { fields: ['rating_average'] }
    ]
  });

  Hospital.associate = (models) => {
    // 관계 없음
  };

  return Hospital;
};

