const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HealthCheckForm = sequelize.define('HealthCheckForm', {
    formId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'form_id'
    },
    conversationId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'conversation_id'
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
    symptoms: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    appetiteLevel: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'appetite_level',
      validate: {
        isIn: [['normal', 'decreased', 'none']]
      }
    },
    waterIntake: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'water_intake',
      validate: {
        isIn: [['normal', 'increased', 'decreased']]
      }
    },
    activityLevel: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'activity_level',
      validate: {
        isIn: [['normal', 'decreased', 'lethargic']]
      }
    },
    behavioralChanges: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'behavioral_changes'
    },
    otherNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'other_notes'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'health_check_forms',
    timestamps: false,
    indexes: [
      { fields: ['pet_id'] }
    ]
  });

  HealthCheckForm.associate = (models) => {
    HealthCheckForm.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
  };

  return HealthCheckForm;
};

