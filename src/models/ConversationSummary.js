const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConversationSummary = sequelize.define('ConversationSummary', {
    summaryId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'summary_id'
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
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    petId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'pet_id',
      references: {
        model: 'pets',
        key: 'pet_id'
      }
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    summaryContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'summary_content'
    },
    keyPoints: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'key_points'
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_favorite'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'conversation_summaries',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['user_id', 'is_favorite'] }
    ]
  });

  ConversationSummary.associate = (models) => {
    ConversationSummary.belongsTo(models.ChatbotConversation, { foreignKey: 'conversation_id', as: 'conversation' });
    ConversationSummary.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    ConversationSummary.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
  };

  return ConversationSummary;
};

