import app from "./app";
const jwt = require("jsonwebtoken");
const { methods } = require("./controllers/producto.controller");
const { getConnection } = require("./database/database");

const seedDatabase = async () => {
    try {
        const conn = await getConnection();
        
        // Crear tabla carrito si no existe
        console.log("Checking if table 'carrito' exists...");
        await conn.query(`
            CREATE TABLE IF NOT EXISTS carrito (
                id_carrito INT AUTO_INCREMENT PRIMARY KEY,
                id_inventario INT,
                id_usuario INT,
                FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario),
                FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        const categories = await conn.query("SELECT COUNT(*) as count FROM categoria");
        if (categories[0].count === 0) {
            console.log("Seeding default categories...");
            await conn.query("INSERT INTO categoria (nombre) VALUES ('Abrigos'), ('Remeras'), ('Pantalones'), ('Accesorios')");
            console.log("Categories seeded successfully.");
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};

const main = async () => {
    await seedDatabase();
    app.listen(app.get("port"));
    console.log(`Server on port ${app.get("port")}`);
};

main();

methods.fetchProductos()
    .then(products => {
        console.log('Products:', products);
    })
    .catch(error => {
        console.error('Error fetching products:', error);
        process.exit(1);
    });
// trigger restart
