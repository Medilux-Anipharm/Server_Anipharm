const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReminderCompletion = sequelize.define('ReminderCompletion', {
    completionId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'completion_id'
    },
    reminderId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'reminder_id',
      references: {
        model: 'reminders',
        key: 'reminder_id'
      }
    },
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'scheduled_date'
    },
    completedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'completed_date'
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_completed'
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'reminder_completions',
    timestamps: false,
    indexes: [
      { fields: ['reminder_id', 'scheduled_date'] }
    ]
  });

  ReminderCompletion.associate = (models) => {
    ReminderCompletion.belongsTo(models.Reminder, { foreignKey: 'reminder_id', as: 'reminder' });
  };

  return ReminderCompletion;
};

