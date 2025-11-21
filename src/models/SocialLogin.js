const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SocialLogin = sequelize.define('SocialLogin', {
    socialLoginId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'social_login_id'
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
    provider: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['kakao', 'naver', 'google']]
      }
    },
    providerUserId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'provider_user_id'
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'access_token'
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token'
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'token_expires_at'
    }
  }, {
    tableName: 'social_logins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { 
        fields: ['provider', 'provider_user_id'], 
        unique: true, 
        name: 'unique_provider_user' 
      },
      { 
        fields: ['user_id', 'provider'], 
        name: 'idx_social_user_provider' 
      }
    ]
  });

  SocialLogin.associate = (models) => {
    SocialLogin.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return SocialLogin;
};

