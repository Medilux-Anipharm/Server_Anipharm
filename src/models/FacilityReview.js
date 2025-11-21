const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacilityReview = sequelize.define('FacilityReview', {
    reviewId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'review_id'
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
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    petId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'pet_id',
      references: {
        model: 'pets',
        key: 'pet_id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000]
      }
    },
    keywords: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    photoUrls: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'photo_urls'
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'helpful_count'
    },
    isReported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_reported'
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_hidden'
    }
  }, {
    tableName: 'facility_reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['facility_type', 'facility_id'] },
      { fields: ['user_id'] },
      { fields: ['rating'] },
      { fields: ['created_at'] }
    ]
  });

  FacilityReview.associate = (models) => {
    FacilityReview.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    FacilityReview.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    FacilityReview.hasMany(models.ReviewHelpful, { foreignKey: 'review_id', as: 'helpfuls' });
  };

  return FacilityReview;
};

