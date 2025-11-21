const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HealthReport = sequelize.define('HealthReport', {
    reportId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'report_id'
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
    reportType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'report_type',
      validate: {
        isIn: [['weekly', 'monthly']]
      }
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'end_date'
    },
    healthScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'health_score'
    },
    healthGrade: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'health_grade',
      validate: {
        isIn: [['excellent', 'good', 'average', 'caution', 'danger']]
      }
    },
    weightScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'weight_score'
    },
    mealScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'meal_score'
    },
    activityScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'activity_score'
    },
    excretionScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'excretion_score'
    },
    symptomScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'symptom_score'
    },
    reminderCompletionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'reminder_completion_rate'
    },
    weightTrend: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'weight_trend'
    },
    mealTrend: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'meal_trend'
    },
    activityTrend: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'activity_trend'
    },
    symptomSummary: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'symptom_summary'
    },
    keyChanges: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'key_changes'
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'pdf_url'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'health_reports',
    timestamps: false,
    indexes: [
      { fields: ['pet_id', 'report_type'] },
      { fields: ['start_date', 'end_date'] }
    ]
  });

  HealthReport.associate = (models) => {
    HealthReport.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    HealthReport.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return HealthReport;
};

