const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AccountLock = sequelize.define('AccountLock', {
    lockId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'lock_id'
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'user_id'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address'
    },
    lockedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'locked_at'
    },
    unlockAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'unlock_at'
    },
    isUnlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_unlocked'
    }
  }, {
    tableName: 'account_locks',
    timestamps: false,
    indexes: [
      { fields: ['email'] },
      { fields: ['unlock_at', 'is_unlocked'] }
    ]
  });

  return AccountLock;
};

