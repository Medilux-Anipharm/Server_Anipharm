const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'user_id'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'password_hash'
    },
    nickname: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 20]
      }
    },
    profileImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'profile_image_url'
    },
    profileShape: {
      type: DataTypes.STRING(10),
      defaultValue: 'circle',
      field: 'profile_shape',
      validate: {
        isIn: [['circle', 'square']]
      }
    },
    bio: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    locationCity: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'location_city'
    },
    locationDistrict: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'location_district'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_email_verified'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['email'], name: 'idx_users_email' },
      { fields: ['nickname'], name: 'idx_users_nickname' },
      { fields: ['latitude', 'longitude'], name: 'idx_users_location' }
    ]
  });

  User.associate = (models) => {
    User.hasMany(models.Pet, { foreignKey: 'user_id', as: 'pets' });
    User.hasMany(models.SocialLogin, { foreignKey: 'user_id', as: 'socialLogins' });
    User.hasMany(models.FacilityReview, { foreignKey: 'user_id', as: 'reviews' });
    User.hasMany(models.HealthRecord, { foreignKey: 'user_id', as: 'healthRecords' });
  };

  return User;
};

