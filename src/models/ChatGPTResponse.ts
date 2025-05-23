import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Article from './Article';

// Define interface for ChatGPTResponse attributes
interface ChatGPTResponseAttributes {
  id: number;
  articleId: number;
  response: string;
  promptUsed: string;
  processedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for creation attributes - optional ID as it's auto-generated
interface ChatGPTResponseCreationAttributes extends Optional<ChatGPTResponseAttributes, 'id'> {}

// Define ChatGPTResponse model without public class fields
class ChatGPTResponse extends Model<ChatGPTResponseAttributes, ChatGPTResponseCreationAttributes> implements ChatGPTResponseAttributes {
  // These are necessary for TypeScript, but won't trigger the Sequelize warning
  declare id: number;
  declare articleId: number;
  declare response: string;
  declare promptUsed: string;
  declare processedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ChatGPTResponse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Article,
        key: 'id',
      },
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    promptUsed: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'chatgpt_responses',
    timestamps: true,
  }
);

// Define relationships
Article.hasMany(ChatGPTResponse, { foreignKey: 'articleId' });
ChatGPTResponse.belongsTo(Article, { foreignKey: 'articleId' });

export default ChatGPTResponse; 