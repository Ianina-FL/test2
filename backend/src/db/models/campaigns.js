const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const campaigns = sequelize.define(
    'campaigns',
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

        values: ['Planned', 'Active', 'Completed'],
      },

      budget: {
        type: DataTypes.DECIMAL,
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

  campaigns.associate = (db) => {
    db.campaigns.belongsToMany(db.leads, {
      as: 'leads',
      foreignKey: {
        name: 'campaigns_leadsId',
      },
      constraints: false,
      through: 'campaignsLeadsLeads',
    });

    db.campaigns.belongsToMany(db.leads, {
      as: 'leads_filter',
      foreignKey: {
        name: 'campaigns_leadsId',
      },
      constraints: false,
      through: 'campaignsLeadsLeads',
    });

    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    //end loop

    db.campaigns.belongsTo(db.organizations, {
      as: 'organization',
      foreignKey: {
        name: 'organizationId',
      },
      constraints: false,
    });

    db.campaigns.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.campaigns.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return campaigns;
};
