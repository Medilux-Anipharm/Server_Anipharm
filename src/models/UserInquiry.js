const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserInquiry = sequelize.define('UserInquiry', {
    inquiryId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'inquiry_id'
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
    title: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachmentUrls: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'attachment_urls'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'in_progress', 'completed']]
      }
    },
    ticketNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'ticket_number'
    },
    adminReply: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'admin_reply'
    },
    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'replied_at'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'user_inquiries',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] }
    ]
  });

  UserInquiry.associate = (models) => {
    UserInquiry.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return UserInquiry;
};

