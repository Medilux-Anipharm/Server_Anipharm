const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserFavorite = sequelize.define('UserFavorite', {
    favoriteId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'favorite_id'
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'user_favorites',
    timestamps: false,
    indexes: [
      { 
        fields: ['user_id', 'facility_type', 'facility_id'], 
        unique: true 
      },
      { fields: ['user_id'] }
    ]
  });

  UserFavorite.associate = (models) => {
    UserFavorite.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return UserFavorite;
};

