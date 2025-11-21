const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PostReport = sequelize.define('PostReport', {
    reportId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'report_id'
    },
    reportedType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'reported_type',
      validate: {
        isIn: [['post', 'comment']]
      }
    },
    reportedId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'reported_id'
    },
    reporterUserId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'reporter_user_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    reason: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [['spam', 'abuse', 'fraud', 'inappropriate', 'other']]
      }
    },
    reasonDetail: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'reason_detail'
    },
    evidenceUrls: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'evidence_urls'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'reviewing', 'resolved', 'rejected']]
      }
    },
    adminNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'admin_note'
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'resolved_at'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'post_reports',
    timestamps: false,
    indexes: [
      { fields: ['reported_type', 'reported_id'] },
      { fields: ['status', 'created_at'] }
    ]
  });

  PostReport.associate = (models) => {
    PostReport.belongsTo(models.User, { foreignKey: 'reporter_user_id', as: 'reporter' });
  };

  return PostReport;
};

