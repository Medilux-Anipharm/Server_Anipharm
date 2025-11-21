const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotificationSetting = sequelize.define('NotificationSetting', {
    settingId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'setting_id'
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    messageEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'message_enabled'
    },
    commentEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'comment_enabled'
    },
    likeEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'like_enabled'
    },
    reminderEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'reminder_enabled'
    },
    systemEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'system_enabled'
    },
    quietStartTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'quiet_start_time'
    },
    quietEndTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'quiet_end_time'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'notification_settings',
    timestamps: false
  });

  NotificationSetting.associate = (models) => {
    NotificationSetting.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return NotificationSetting;
};

