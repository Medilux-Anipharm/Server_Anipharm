//LLM 판단결과 챗봇 결과
const { DataTypes } = require("sequelize");
const { TRIAGE_LEVEL } = require("../constants/HealthCheck");

module.exports = (sequelize) => {
    const HealthAssessment = sequelize.define("HealthAssessment", {
        assessmentId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'assessment_id'
        },
        healthCheckId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'health_check_id',
            references: {
                model: 'health_checks',
                key: 'check_id'
            }
        },
        triageLevel: {
            type: DataTypes.ENUM(Object.values(TRIAGE_LEVEL)),
            allowNull: false,
            field: 'triage_level'
        },
        recommendedActions: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'recommended_actions'
        },
        healthCheckSummary: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'health_check_summary'
        }
    }, {
        sequelize: sequelize,
        modelName: 'HealthAssessment',
        tableName: 'health_assessments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
    HealthAssessment.associate = (models) => {
        HealthAssessment.belongsTo(models.HealthCheck, { foreignKey: 'health_check_id', as: 'healthCheck' });
    };
    return HealthAssessment;
}