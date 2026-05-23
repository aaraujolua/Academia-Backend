// require('dotenv').config();

// module.exports = {
//   dialect: 'mariadb',
//   host: process.env.DATABASE_HOST,
//   port: process.env.DATABASE_PORT,
//   username: process.env.DATABASE_USERNAME,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE,
//   define: {
//     timestamps: true,
//     underscored: false,
//     underscoredAll: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//   },
//   dialectOptions: {
//     timezone: 'America/Sao_Paulo',
//   },
//   timezone: 'America/Sao_Paulo',
// };

require('dotenv').config();

const useSSL = process.env.DB_SSL === 'true';

console.log(useSSL);

module.exports = {
  dialect: 'mariadb',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,

  define: {
    timestamps: true,
    underscored: false,
    underscoredAll: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timezone: '-03:00',
  },

  // dialectOptions: useSSL
  //   ? {
  //       ssl: {
  //         ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'),
  //         rejectUnauthorized: true, // mantém validação do CA
  //         checkServerIdentity: () => undefined, // ignora mismatch de hostname/SAN
  //       },
  //     }
  //   : {},

  dialectOptions: {
  allowPublicKeyRetrieval: true,
  ssl: false,
  }
};
