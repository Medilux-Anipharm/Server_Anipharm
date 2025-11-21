const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HealthScore = sequelize.define('HealthScore', {
    scoreId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'score_id'
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
    scoreDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'score_date'
    },
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'total_score'
    },
    grade: {
      type: DataTypes.STRING(20),
      allowNull: true
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'health_scores',
    timestamps: false,
    indexes: [
      { fields: ['pet_id', 'score_date'], unique: true }
    ]
  });

  HealthScore.associate = (models) => {
    HealthScore.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
  };

  return HealthScore;
};

