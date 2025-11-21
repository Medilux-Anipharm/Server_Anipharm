const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BlockedUser = sequelize.define('BlockedUser', {
    blockId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'block_id'
    },
    blockerUserId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'blocker_user_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    blockedUserId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'blocked_user_id',
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
    tableName: 'blocked_users',
    timestamps: false,
    indexes: [
      { fields: ['blocker_user_id', 'blocked_user_id'], unique: true },
      { fields: ['blocker_user_id'] }
    ]
  });

  BlockedUser.associate = (models) => {
    BlockedUser.belongsTo(models.User, { foreignKey: 'blocker_user_id', as: 'blocker' });
    BlockedUser.belongsTo(models.User, { foreignKey: 'blocked_user_id', as: 'blocked' });
  };

  return BlockedUser;
};

