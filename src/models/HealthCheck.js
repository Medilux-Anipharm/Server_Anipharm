// src/models/HealthCheck.js
// 건강상담모드 챗봇 전에 자가진단하는 모델

const {DataTypes} = require('sequelize');
const { CONCERNS, CONCERN_LABELS, APPETITE, APPETITE_LABELS,
     ACTIVITY, ACTIVITY_LABELS, TEMPERATURE, TEMPERATURE_LABELS,
      NOTE, NOTE_LABELS, TRIAGE_LEVEL, TRIAGE_LEVEL_LABELS } = require('../constants/HealthCheck');

module.exports = (sequelize) => {
    const HealthCheck = sequelize.define('HealthCheck', {
        checkId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'check_id'
        },
        petId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'pet_id',
            references: {  
                model: 'pets',
                key: 'pet_id'
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
        concernType: {
            type: DataTypes.JSONB,
            allowNull: false,
            field: 'concern_type',
            validate: {
                isValid(value) {
                    if (!Array.isArray(value) || value.length < 1 || value.length > 5) {
                        throw new Error('건강고민은 1~5개여야 합니다');
                    }
                    // 배열의 각 값이 유효한 concern인지 확인
                    const validConcerns = Object.values(CONCERNS);
                    for (const concern of value) {
                        if (!validConcerns.includes(concern)) {
                            throw new Error(`유효하지 않은 건강 고민입니다: ${concern}`);
                        }
                    }
                }
            }
        },
        appetite: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'appetite',
            validate: {
                isIn: [Object.values(APPETITE)]
            }
        },
        activity: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'activity',
            validate: {
                isIn: [Object.values(ACTIVITY)]
            }
        },
        temperature: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'temperature',
            validate: {
                isIn: [Object.values(TEMPERATURE)]
            }
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'note'
        },
    }, {
        sequelize: sequelize,
        modelName: 'HealthCheck',
        tableName: 'health_checks',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
          { fields: ['pet_id'] }
        ]
      }
    );
    
    HealthCheck.associate = (models) => {
        HealthCheck.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
        HealthCheck.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        HealthCheck.hasMany(models.ChatMessage, { foreignKey: 'health_check_id', as: 'messages' });
    };
    
    return HealthCheck;
};   
