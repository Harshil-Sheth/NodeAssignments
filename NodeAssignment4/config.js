module.exports = {
    dbConnection: {
        user: "postgres",
        password: "password",
        host: "localhost",
        database: "Cars",
        port: 5432
    },
    server: {
        PORT: 3000,
    },
    jwtConfig: {
        algorithm: "HS256",
        secretKey: "Test@12345",
    },

};