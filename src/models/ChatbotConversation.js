const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChatbotConversation = sequelize.define('ChatbotConversation', {
    conversationId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'conversation_id'
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
    conversationType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'conversation_type',
      validate: {
        isIn: [['health_check', 'care_management']]
      }
    },
    healthCheckFormId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'health_check_form_id'
    },
    triageResult: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'triage_result',
      validate: {
        isIn: [['BLUE', 'GREEN', 'AMBER', 'RED']]
      }
    },
    triageMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'triage_message'
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_completed'
    },
    isSavedToDiary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_saved_to_diary'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at'
    }
  }, {
    tableName: 'chatbot_conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id', 'conversation_type'] },
      { fields: ['created_at'], order: 'DESC' }
    ]
  });

  ChatbotConversation.associate = (models) => {
    ChatbotConversation.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    ChatbotConversation.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    ChatbotConversation.hasMany(models.ChatbotMessage, { foreignKey: 'conversation_id', as: 'messages' });
    ChatbotConversation.hasOne(models.HealthCheckForm, { foreignKey: 'conversation_id', as: 'healthCheckForm' });
    ChatbotConversation.hasOne(models.ConversationSummary, { foreignKey: 'conversation_id', as: 'summary' });
  };

  return ChatbotConversation;
};

