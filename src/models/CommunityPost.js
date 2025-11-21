const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CommunityPost = sequelize.define('CommunityPost', {
    postId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'post_id'
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
    postType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'post_type',
      validate: {
        isIn: [['local', 'free', 'qna']]
      }
    },
    locationLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      field: 'location_latitude'
    },
    locationLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      field: 'location_longitude'
    },
    locationRange: {
      type: DataTypes.INTEGER,
      defaultValue: 5000,
      field: 'location_range'
    },
    isQuestion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_question'
    },
    hasAcceptedAnswer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_accepted_answer'
    },
    isForSale: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_for_sale'
    },
    salePrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sale_price'
    },
    isNegotiable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_negotiable'
    },
    isSold: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_sold'
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imageUrls: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'image_urls'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count'
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'like_count'
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'comment_count'
    },
    scrapCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'scrap_count'
    },
    isReported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_reported'
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_hidden'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted'
    }
  }, {
    tableName: 'community_posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['post_type', 'created_at'] },
      { fields: ['location_latitude', 'location_longitude'] }
    ]
  });

  CommunityPost.associate = (models) => {
    CommunityPost.belongsTo(models.User, { foreignKey: 'user_id', as: 'author' });
    CommunityPost.hasMany(models.PostComment, { foreignKey: 'post_id', as: 'comments' });
    CommunityPost.hasMany(models.PostLike, { foreignKey: 'post_id', as: 'likes' });
    CommunityPost.hasMany(models.PostScrap, { foreignKey: 'post_id', as: 'scraps' });
    CommunityPost.hasMany(models.PostReport, { foreignKey: 'reported_id', as: 'reports', scope: { reported_type: 'post' } });
  };

  return CommunityPost;
};

