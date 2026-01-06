const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
    const Review = sequelize.define('Review',{
        reviewId : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true,
            field : 'review_id'
        },
        userId : {
            type: DataTypes.BIGINT,
            allowNull : false,
            field : 'user_id',
            references : {
                model : 'users',
                key : 'user_id'
            }
        },
        pharmacyId : {
            type : DataTypes.BIGINT,
            allowNull : true,
            field : 'pharmacy_id',
            references : {
                model : 'pharmacies',
                key : 'pharmacy_id'
            }
        },
        hospitalId : {
            type: DataTypes.BIGINT,
            allowNull : true,
            field : 'hospital_id',
            references : {
                model : 'veterinary_hospitals',
                key : 'hospital_id'
            }
        },
        rating : {
            type : DataTypes.INTEGER,
            allowNull : false,
            validate : {
                min : 1,
                max : 5
            },
            comment : '별점 (1점 ~ 5점)'

        },
        content : {
            type : DataTypes.TEXT,
            allowNull : false,
            comment : '리뷰내용',
        },
        likeCount : {
            type : DataTypes.INTEGER,
            defaultValue : 0,
            comment : '좋아요/공감수',
            field : 'like_count'
        }
    }, {
        tableName : 'reviews',
        timestamps : true,
        createdAt : 'created_at',
        updatedAt : 'updated_at',
        paranoid: true,
        deletedAt : 'deleted_at',
        indexes : [
            {field : ['pharmacy_id'], name : 'idx_pharmacy_id'},
            {field : ['hospital_id'], name : 'idx_hospital_id'},
            {field : ['user_id'], name : 'idx_user_id'},
            {field : ['created_at'], name : 'idx_created_at'},
            {field : ['like_count'], name : 'idx_like_count'},
        ]
    })

    Review.associate = function(models) {
        // 리뷰 작성자 (필수)
        Review.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });

        // 약국 리뷰 (선택)
        Review.belongsTo(models.Pharmacy, {
            foreignKey: 'pharmacyId',
            as: 'pharmacy'
        });

        // 동물병원 리뷰 (선택)
        Review.belongsTo(models.VeterinaryHospital, {
            foreignKey: 'hospitalId',
            as: 'hospital'
        });
    };

    return Review;
}