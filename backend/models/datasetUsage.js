import { DataTypes, Model } from "sequelize";

/**
 * Represents the usage statistics for datasets.
 * Tracks actions such as searches and views, along with metadata like timestamps and usage count.
 */
class DatasetUsage extends Model {
  /**
   * Initializes the DatasetUsage model with the required fields and configurations.
   * @param {Sequelize} sequelize - The Sequelize instance.
   */
  static initModel(sequelize) {
    DatasetUsage.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        dataset_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "Datasets",
            key: "id", // key in Datasets table
          },
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "Users",
            key: "id", // key in Users table
          },
        },
        action_type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        search_term: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        usage_count: {
          type: DataTypes.INTEGER,
          defaultValue: 1, // set default value to 1 (Might use later)
        },
        timestamp: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW, // set default value to current timestamp
        },
      },
      {
        sequelize, // Pass the Sequelize instance here
        modelName: "DatasetUsage", // Define the model name
        tableName: "DatasetUsage", // Define the table name
        timestamps: false,
      }
    );
  }
  static associate(models) {
    DatasetUsage.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    DatasetUsage.belongsTo(models.Datasets, {
      foreignKey: "dataset_id",
      as: "dataset",
    });
  }
}

export default DatasetUsage;
