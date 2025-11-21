const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PetHealthConcern = sequelize.define('PetHealthConcern', {
    concernId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'concern_id'
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
    concernType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'concern_type'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'pet_health_concerns',
    timestamps: false,
    indexes: [
      { fields: ['pet_id'] }
    ]
  });

  PetHealthConcern.associate = (models) => {
    PetHealthConcern.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
  };

  return PetHealthConcern;
};

