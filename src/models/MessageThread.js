const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MessageThread = sequelize.define('MessageThread', {
    threadId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'thread_id'
    },
    user1Id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user1_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    user2Id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user2_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    lastMessageId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'last_message_id'
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_message_at'
    },
    user1IsPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'user1_is_pinned'
    },
    user1IsMuted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'user1_is_muted'
    },
    user1UnreadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'user1_unread_count'
    },
    user1DeletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'user1_deleted_at'
    },
    user2IsPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'user2_is_pinned'
    },
    user2IsMuted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'user2_is_muted'
    },
    user2UnreadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'user2_unread_count'
    },
    user2DeletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'user2_deleted_at'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'message_threads',
    timestamps: false,
    indexes: [
      { fields: ['user1_id', 'last_message_at'] },
      { fields: ['user2_id', 'last_message_at'] }
    ]
  });

  MessageThread.associate = (models) => {
    MessageThread.belongsTo(models.User, { foreignKey: 'user1_id', as: 'user1' });
    MessageThread.belongsTo(models.User, { foreignKey: 'user2_id', as: 'user2' });
    MessageThread.hasMany(models.Message, { foreignKey: 'thread_id', as: 'messages' });
  };

  return MessageThread;
};

