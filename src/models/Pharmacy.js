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
    isLateNight: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_late_night'
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
    tableName: 'pharmacies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['latitude', 'longitude'], name: 'idx_pharmacy_location' },
      { fields: ['rating_average'] }
    ]
  });

  Pharmacy.associate = (models) => {
    Pharmacy.hasMany(models.FacilityPhoto, { 
      foreignKey: 'facility_id', 
      as: 'photos',
      scope: { facility_type: 'pharmacy' }
    });
    Pharmacy.hasMany(models.FacilityReview, { 
      foreignKey: 'facility_id', 
      as: 'reviews',
      scope: { facility_type: 'pharmacy' }
    });
    Pharmacy.hasMany(models.FacilityInventory, { foreignKey: 'pharmacy_id', as: 'inventory' });
  };

  return Pharmacy;
};

