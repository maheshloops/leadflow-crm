const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'leadflow',
  process.env.MYSQL_USER     || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host:    process.env.MYSQL_HOST || 'localhost',
    port:    parseInt(process.env.MYSQL_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: {
      underscored: true,      // snake_case columns
      timestamps:  true,      // created_at / updated_at auto
      charset:     'utf8mb4',
      collate:     'utf8mb4_unicode_ci'
    }
  }
);

module.exports = sequelize;
