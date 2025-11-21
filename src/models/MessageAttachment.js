const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MessageAttachment = sequelize.define('MessageAttachment', {
    attachmentId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'attachment_id'
    },
    messageId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'message_id',
      references: {
        model: 'messages',
        key: 'message_id'
      }
    },
    fileType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'file_type',
      validate: {
        isIn: [['image', 'file']]
      }
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_url'
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'file_name'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'file_size'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'message_attachments',
    timestamps: false,
    indexes: [
      { fields: ['message_id'] }
    ]
  });

  MessageAttachment.associate = (models) => {
    MessageAttachment.belongsTo(models.Message, { foreignKey: 'message_id', as: 'message' });
  };

  return MessageAttachment;
};

