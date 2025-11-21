const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LoginSession = sequelize.define('LoginSession', {
    sessionId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'session_id'
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
    sessionToken: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'session_token'
    },
    refreshToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'refresh_token'
    },
    deviceInfo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'device_info'
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address'
    },
    locationInfo: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'location_info'
    },
    isAutoLogin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_auto_login'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at'
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'last_activity_at'
    }
  }, {
    tableName: 'login_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['session_token'] },
      { fields: ['expires_at'] }
    ]
  });

  LoginSession.associate = (models) => {
    LoginSession.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return LoginSession;
};

