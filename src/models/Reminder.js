const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reminder = sequelize.define('Reminder', {
    reminderId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'reminder_id'
    },
    petId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'pet_id',
      references: {
        model: 'pets',
        key: 'pet_id'
      }
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
    reminderType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'reminder_type',
      validate: {
        isIn: [['medication', 'grooming', 'bath', 'vaccination', 'checkup']]
      }
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medicationName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'medication_name'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date'
    },
    recurrenceType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'recurrence_type',
      validate: {
        isIn: [['daily', 'weekly', 'monthly']]
      }
    },
    recurrenceInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'recurrence_interval'
    },
    nextDueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'next_due_date'
    },
    isNotificationEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_notification_enabled'
    },
    notificationTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'notification_time'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'reminders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['pet_id'] },
      { fields: ['next_due_date', 'is_active'] }
    ]
  });

  Reminder.associate = (models) => {
    Reminder.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    Reminder.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Reminder.hasMany(models.ReminderCompletion, { foreignKey: 'reminder_id', as: 'completions' });
  };

  return Reminder;
};

