const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HealthRecord = sequelize.define('HealthRecord', {
    recordId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'record_id'
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
    recordDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'record_date'
    },
    recordType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'record_type',
      validate: {
        isIn: [['meal', 'water', 'urine', 'feces', 'activity', 'weight', 'symptom']]
      }
    },
    mealAmount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      field: 'meal_amount'
    },
    waterAmount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      field: 'water_amount'
    },
    urineColor: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'urine_color'
    },
    fecesConsistency: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'feces_consistency'
    },
    fecesColor: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'feces_color'
    },
    fecesPhotoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'feces_photo_url'
    },
    activityMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'activity_minutes'
    },
    weightKg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'weight_kg'
    },
    symptoms: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    symptomPhotoUrls: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'symptom_photo_urls'
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    }
  }, {
    tableName: 'health_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['pet_id', 'record_date', 'record_type'] },
      { fields: ['pet_id', 'record_type'] }
    ]
  });

  HealthRecord.associate = (models) => {
    HealthRecord.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    HealthRecord.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return HealthRecord;
};

