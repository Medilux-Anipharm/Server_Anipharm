const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacilityPhoto = sequelize.define('FacilityPhoto', {
    photoId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'photo_id'
    },
    facilityType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'facility_type',
      validate: {
        isIn: [['pharmacy', 'hospital']]
      }
    },
    facilityId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'facility_id'
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'image_url'
    },
    imageOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'image_order'
    },
    isReported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_reported'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'facility_photos',
    timestamps: false,
    indexes: [
      { fields: ['facility_type', 'facility_id'] },
      { fields: ['user_id'] }
    ]
  });

  FacilityPhoto.associate = (models) => {
    FacilityPhoto.belongsTo(models.User, { foreignKey: 'user_id', as: 'uploader' });
  };

  return FacilityPhoto;
};

