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
      type: DataTypes.STRING(20),
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
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    businessHours: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'business_hours'
    },
    isOpenNow: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'is_open_now'
    },
    isLateNight: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_late_night'
    },
    hasParking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_parking'
    },
    parkingInfo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'parking_info'
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

