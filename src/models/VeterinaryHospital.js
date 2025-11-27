const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VeterinaryHospital = sequelize.define('VeterinaryHospital', {
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
    treatsDogs: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'treats_dogs'
    },
    treatsCats: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'treats_cats'
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

  VeterinaryHospital.associate = (models) => {
    VeterinaryHospital.hasMany(models.FacilityPhoto, { 
      foreignKey: 'facility_id', 
      as: 'photos',
      scope: { facility_type: 'hospital' }
    });
    VeterinaryHospital.hasMany(models.FacilityReview, { 
      foreignKey: 'facility_id', 
      as: 'reviews',
      scope: { facility_type: 'hospital' }
    });
  };

  return VeterinaryHospital;
};

