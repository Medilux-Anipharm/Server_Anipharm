const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LoginAttempt = sequelize.define('LoginAttempt', {
    attemptId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'attempt_id'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'ip_address'
    },
    isSuccess: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_success'
    },
    failureReason: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'failure_reason'
    },
    attemptedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'attempted_at'
    }
  }, {
    tableName: 'login_attempts',
    timestamps: false,
    indexes: [
      { fields: ['email', 'attempted_at'] },
      { fields: ['ip_address', 'attempted_at'] }
    ]
  });

  return LoginAttempt;
};

