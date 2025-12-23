const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PetMedication = sequelize.define('PetMedication',{
        medicationId: {
            type : DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'medication_id'
        },
        originalId:{
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
            field: 'original_id',
            comment: '원본 약제 정보 ID'
        },
        productName:{
            type: DataTypes.STRING(200),
            allowNull: false,
            field: 'product_name',
            comment: '제품명'
        },
        brandName:{
            type:DataTypes.STRING(200),
            allowNull: true,
            field: 'brand_name',
            comment: '브랜드명'

        },
        company:{
            type:DataTypes.STRING(200),
            allowNull:true,
            field: 'company',
            comment: '제조사'
        },
        approvalDate:{
            type:DataTypes.DATEONLY,
            allowNull:true,
            field: 'approval_date',
            comment: '허가일'
        },
        approvalStatus:{
            type:DataTypes.STRING(200),
            allowNull:true,
            field: 'approval_status',
            comment: '허가 상태'
        },
        productType:{
            type:DataTypes.STRING(200),
            allowNull: true,
            field: 'product_type',
            comment: '품목정보'
        },
        manufacturingType:{
            type:DataTypes.STRING(200),
            allowNull: true,
            field: 'manufacturing_type',
            comment: '제조 타입'
        },
       //약제품 상세정보 (text 필드에서 파싱예정)
       indication:{
        type:DataTypes.TEXT,
        allowNull : true,
        comment: '효능효과'
       },
       dosage: {
        type : DataTypes.TEXT,
        allowNull: true,
        comment : '용법용량'
       },
       sideEffects:{
        type:DataTypes.TEXT,
        allowNull: true,
        field: 'side_effects',
        comment: '부작용'
       },
       precautions:{
        type:DataTypes.TEXT,
        allowNull: true,
        field: 'precautions',
        comment: '주의사항'
       },
       storage:{
        type:DataTypes.TEXT,
        allowNull: true,
        field: 'storage',
        comment: '보관방법'
    },
    //원본데이터
    fullText:{
        type:DataTypes.TEXT,
        allowNull: true,
        field: 'full_text',
        comment: '원본 데이터'
    },
    keywords:{
        type:DataTypes.TEXT,
        allowNull: true,
        field: 'keywords',
        comment: '검색 키워드'
    },
    //검색 최적화 필드
    searchText:{
        type:DataTypes.TEXT,
        allowNull: true,
        field: 'search_text',
        comment: '검색용 텍스트 (제품명 + 효능효과 + 키워드)'
    }
    }, {
        tableName: 'pet_medications',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['product_name'] },
            { fields: ['company'] },
            { fields: ['product_type'] },
            { fields: ['approval_status'] },
            { fields: ['search_text'] }
        ]
    });

    PetMedication.associate = (models) => {
       //관계없음
    };

    return PetMedication;
 


}