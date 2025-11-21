const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    messageId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'message_id'
    },
    threadId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'thread_id',
      references: {
        model: 'message_threads',
        key: 'thread_id'
      }
    },
    senderId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'sender_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    receiverId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'receiver_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 2000]
      }
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
    isDeletedBySender: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted_by_sender'
    },
    isDeletedByReceiver: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted_by_receiver'
    },
    isDeletedForAll: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted_for_all'
    },
    replyToMessageId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'reply_to_message_id',
      references: {
        model: 'messages',
        key: 'message_id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'messages',
    timestamps: false,
    indexes: [
      { fields: ['thread_id', 'created_at'] },
      { fields: ['sender_id'] },
      { fields: ['receiver_id', 'is_read'] }
    ]
  });

  Message.associate = (models) => {
    Message.belongsTo(models.MessageThread, { foreignKey: 'thread_id', as: 'thread' });
    Message.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
    Message.belongsTo(models.User, { foreignKey: 'receiver_id', as: 'receiver' });
    Message.belongsTo(models.Message, { foreignKey: 'reply_to_message_id', as: 'replyTo' });
    Message.hasMany(models.MessageAttachment, { foreignKey: 'message_id', as: 'attachments' });
  };

  return Message;
};

