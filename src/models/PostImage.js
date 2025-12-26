const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const PostImage = sequelize.define('PostImage', {
        imageId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'image_id'
        },
        postId : {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'post_id',
            references: {
                model: 'community_posts',
                key: 'post_id'
            }
        },
        imageUrl : {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'image_url'
        },
    },{
        tableName : 'post_images',
        timestamps : true,
        createdAt : 'created_at',
        updatedAt : 'updated_at',
        indexes : [
            { fields : ['post_id'] }
        ]
    });

    PostImage.associate = (models) => {
        PostImage.belongsTo(models.CommunityPost, { foreignKey: 'post_id', as: 'post' });
    };

    return PostImage;
};
