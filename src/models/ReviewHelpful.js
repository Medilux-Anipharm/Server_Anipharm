const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReviewHelpful = sequelize.define('ReviewHelpful', {
    helpfulId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'helpful_id'
    },
    reviewId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'review_id',
      references: {
        model: 'facility_reviews',
        key: 'review_id'
      }
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'review_helpful',
    timestamps: false,
    indexes: [
      { 
        fields: ['user_id', 'review_id'], 
        unique: true, 
        name: 'unique_user_review' 
      }
    ]
  });

  ReviewHelpful.associate = (models) => {
    ReviewHelpful.belongsTo(models.FacilityReview, { foreignKey: 'review_id', as: 'review' });
    ReviewHelpful.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return ReviewHelpful;
};

