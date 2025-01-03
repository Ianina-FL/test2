const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const leads = sequelize.define(
    'leads',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.TEXT,
      },

      status: {
        type: DataTypes.ENUM,

        values: ['New', 'Contacted', 'Qualified', 'Lost'],
      },

      category: {
        type: DataTypes.ENUM,

        values: ['Corporate', 'Individual', 'Government'],
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  leads.associate = (db) => {
    db.leads.belongsToMany(db.contacts, {
      as: 'contacts',
      foreignKey: {
        name: 'leads_contactsId',
      },
      constraints: false,
      through: 'leadsContactsContacts',
    });

    db.leads.belongsToMany(db.contacts, {
      as: 'contacts_filter',
      foreignKey: {
        name: 'leads_contactsId',
      },
      constraints: false,
      through: 'leadsContactsContacts',
    });

    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    db.leads.hasMany(db.activities, {
      as: 'activities_lead',
      foreignKey: {
        name: 'leadId',
      },
      constraints: false,
    });

    db.leads.hasMany(db.contacts, {
      as: 'contacts_lead',
      foreignKey: {
        name: 'leadId',
      },
      constraints: false,
    });

    db.leads.hasMany(db.notes, {
      as: 'notes_lead',
      foreignKey: {
        name: 'leadId',
      },
      constraints: false,
    });

    //end loop

    db.leads.belongsTo(db.users, {
      as: 'owner',
      foreignKey: {
        name: 'ownerId',
      },
      constraints: false,
    });

    db.leads.belongsTo(db.organizations, {
      as: 'organization',
      foreignKey: {
        name: 'organizationId',
      },
      constraints: false,
    });

    db.leads.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.leads.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return leads;
};
