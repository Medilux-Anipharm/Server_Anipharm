const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacilityInventory = sequelize.define('FacilityInventory', {
    inventoryId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'inventory_id'
    },
    pharmacyId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'pharmacy_id',
      references: {
        model: 'pharmacies',
        key: 'pharmacy_id'
      }
    },
    productName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'product_name'
    },
    productCategory: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'product_category'
    },
    isInStock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_in_stock'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'facility_inventory',
    timestamps: false,
    indexes: [
      { fields: ['pharmacy_id'] },
      { fields: ['product_name'] }
    ]
  });

  FacilityInventory.associate = (models) => {
    FacilityInventory.belongsTo(models.Pharmacy, { foreignKey: 'pharmacy_id', as: 'pharmacy' });
  };

  return FacilityInventory;
};

