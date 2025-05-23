import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Define interface for Article attributes
interface ArticleAttributes {
  id: number;
  title: string;
  url: string;
  content: string;
  publishedAt: Date | null;
  scrapedAt: Date;
  isProcessed: boolean;
  processingAttempts: number;
  lastProcessingError: string | null;
  lastProcessingAttempt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for creation attributes - optional ID as it's auto-generated
interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id'> {}

// Define Article model without public class fields
class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  // These are necessary for TypeScript, but won't trigger the Sequelize warning
  declare id: number;
  declare title: string;
  declare url: string;
  declare content: string;
  declare publishedAt: Date | null;
  declare scrapedAt: Date;
  declare isProcessed: boolean;
  declare processingAttempts: number;
  declare lastProcessingError: string | null;
  declare lastProcessingAttempt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    scrapedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isProcessed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    processingAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastProcessingError: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastProcessingAttempt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'articles',
    timestamps: true,
  }
);

export default Article; 