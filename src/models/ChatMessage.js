// models/ChatMessage.js
// 챗봇 대화 메시지 저장 모델
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ChatMessage = sequelize.define("ChatMessage", {
    messageId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      field: 'message_id'
    },
    healthCheckId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'health_check_id',
      // references 제거: healthCheckId가 NULL일 수 있고, 케어 관리 상담에는 health_check가 없음
      // 외래키 제약조건은 데이터베이스 레벨에서 제거해야 함
      comment: '건강상태 상담 시 연결 (케어 관리 상담은 NULL)'
    },
    petId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'pet_id',
      references: {
        model: 'pets',
        key: 'pet_id'
      },
      comment: '반려동물 ID (모든 상담에 필수)'
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id'
      },
      comment: '사용자 ID'
    },
    conversationType: {
      type: DataTypes.ENUM('health_status', 'care_management'),
      allowNull: false,
      field: 'conversation_type',
      comment: '상담 유형: health_status(건강상태 상담), care_management(케어 관리 상담)'
    },
    role: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
      comment: '메시지 발신자: user(사용자), assistant(챗봇)'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '메시지 내용'
    },
    messageOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'message_order',
      comment: '대화 순서 (같은 상담 세션 내에서 정렬용)'
    }
  }, {
    tableName: 'chat_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['health_check_id', 'message_order'], name: 'idx_chat_messages_check_order' },
      { fields: ['pet_id', 'conversation_type', 'created_at'], name: 'idx_chat_messages_pet_type_time' },
      { fields: ['user_id', 'created_at'], name: 'idx_chat_messages_user_time' }
    ]
  });

  ChatMessage.associate = (models) => {
    ChatMessage.belongsTo(models.HealthCheck, { 
      foreignKey: 'health_check_id', 
      as: 'healthCheck',
      constraints: false // healthCheckId가 NULL일 수 있으므로 외래키 제약조건 비활성화
    });
    ChatMessage.belongsTo(models.Pet, { 
      foreignKey: 'pet_id', 
      as: 'pet' 
    });
    ChatMessage.belongsTo(models.User, { 
      foreignKey: 'user_id', 
      as: 'user' 
    });
  };

  return ChatMessage;
};
