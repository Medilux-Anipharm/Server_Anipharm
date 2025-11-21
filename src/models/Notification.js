const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    notificationId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'notification_id'
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
    notificationType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'notification_type',
      validate: {
        isIn: [['message', 'comment', 'like', 'scrap', 'reminder', 'review', 'system']]
      }
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    content: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    relatedType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'related_type'
    },
    relatedId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'related_id'
    },
    actionUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'action_url'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_read'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'notifications',
    timestamps: false,
    indexes: [
      { fields: ['user_id', 'is_read', 'created_at'] }
    ]
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Notification;
};

