const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pet = sequelize.define('Pet', {
    petId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'pet_id'
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
    name: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    species: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['강아지', '고양이']]
      }
    },
    breed: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['male', 'female', 'neutered_male', 'neutered_female']]
      }
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'birth_date'
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    profileImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'profile_image_url'
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_primary'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'display_order'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted'
    }
  }, {
    tableName: 'pets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['user_id', 'display_order'] }
    ]
  });

  Pet.associate = (models) => {
    Pet.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner' });
    Pet.hasMany(models.PetHealthConcern, { foreignKey: 'pet_id', as: 'healthConcerns' });
    Pet.hasMany(models.HealthRecord, { foreignKey: 'pet_id', as: 'healthRecords' });
    Pet.hasMany(models.HealthReport, { foreignKey: 'pet_id', as: 'healthReports' });
    Pet.hasMany(models.HealthScore, { foreignKey: 'pet_id', as: 'healthScores' });
    Pet.hasMany(models.Reminder, { foreignKey: 'pet_id', as: 'reminders' });
    Pet.hasMany(models.HealthCheckForm, { foreignKey: 'pet_id', as: 'healthCheckForms' });
    Pet.hasMany(models.FacilityReview, { foreignKey: 'pet_id', as: 'reviews' });
  };

  return Pet;
};

