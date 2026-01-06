const { DataTypes, Model, Sequelize } = require("sequelize");

module.exports = (sequelize) => {
    const ReviewKeyword = sequelize.define('ReviewKeyword', {
        reviewKeywordId : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true,
            field: 'review_keyword_id'
        },
        reviewId : {
            type: DataTypes.BIGINT,
            allowNull : false,
            field: 'review_id',
            references : {
                model : 'reviews',
                key : 'review_id'
            }

        },
        keyword : {
            type: DataTypes.STRING(60),
            allowNull : false,
            comment : '리뷰 키워드(태그)'
        }
    }, {
        tableName : 'review_keywords',
        timestamps : true,
        createdAt : 'created_at',
        updatedAt : false,
        indexes : [
            {fields : ['review_id'], name : 'idx_review_keyword_review_id'},
            {fields : ['keyword'], name : 'idx_review_keyword_keyword'},
        ]
    });

    ReviewKeyword.associate = (models) => {
        ReviewKeyword.belongsTo(models.Review, {
            foreignKey : 'review_id',
            as :'review'
        });
    };

    return ReviewKeyword;
};