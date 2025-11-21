const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChatbotMessage = sequelize.define('ChatbotMessage', {
    messageId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'message_id'
    },
    conversationId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'conversation_id',
      references: {
        model: 'chatbot_conversations',
        key: 'conversation_id'
      }
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['user', 'assistant']]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tokensUsed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'tokens_used'
    },
    modelVersion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'model_version'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'chatbot_messages',
    timestamps: false,
    indexes: [
      { fields: ['conversation_id', 'created_at'] }
    ]
  });

  ChatbotMessage.associate = (models) => {
    ChatbotMessage.belongsTo(models.ChatbotConversation, { foreignKey: 'conversation_id', as: 'conversation' });
  };

  return ChatbotMessage;
};

