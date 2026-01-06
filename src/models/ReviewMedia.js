const { DataTypes, Model, Sequelize } = require("sequelize");

module.exports = (sequelize) => {
    const ReviewMedia = sequelize.define('ReviewMedia', {
        mediaId : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true,
            field : 'media_id'
        },
        reviewId : {
            type : DataTypes.BIGINT,
            allowNull : false,
            field : 'review_id',
            references : {
                model : 'reviews',
                key : 'review_id'
            }

        },
        mediaUrl : {
            type : DataTypes.STRING(500),
            allowNull : false,
            field : 'media_url',
            comment : '지도 리뷰 미디어 url'
        },
        mediaType : {
            type : DataTypes.ENUM('image', 'video'),
            allowNull : false,
            field : 'media_type',
            comment : '미디어 타입 (이미지, 비디오)'
        }
    }, {
        tableName : 'review_media',
        timestamps : true,
        createdAt : 'created_at',
        updatedAt : false,
        indexes : [
            {fields : ['review_id'], name : 'idx_review_media_review_id'}
        ]
    });

    ReviewMedia.associate = (models) => {
        ReviewMedia.belongsTo(models.Review, {
            foreignKey : 'reviewId',
            as : 'review'
        })
    }

    return ReviewMedia

}// end module