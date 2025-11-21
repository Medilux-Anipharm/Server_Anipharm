const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeviceToken = sequelize.define('DeviceToken', {
    tokenId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'token_id'
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
    deviceType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'device_type',
      validate: {
        isIn: [['ios', 'android', 'web']]
      }
    },
    deviceToken: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'device_token'
    },
    deviceName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'device_name'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'device_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['user_id'] }
    ]
  });

  DeviceToken.associate = (models) => {
    DeviceToken.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return DeviceToken;
};

