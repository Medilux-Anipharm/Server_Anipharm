const { DataTypes, Model, Sequelize } = require("sequelize");

module.export = (sequelize) => {
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
            type : DataTypes.ENUM('image', 'png'),
            allowNull : false,
            field : 'media_type',
            comment : '미디어 타입 (이미지)'
        }
    },{ 
        tableName : 'review_media',
        timestamps : true,
        createdAt : 'created_at',
        updateAt : false,
        indexes : [
            {field : ['review_id'], name : ['idx_review_id']}
        ]
    }
)

    ReviewMedia.associate = (models) => {
        ReviewMedia.belongsTo(models.Review, {
            foreignKey : 'review_id',
            as : 'reviews'
        })
    }

    return ReviewMedia

}// end module