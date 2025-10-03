require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Product = require("../models/product.model");

const products = [
  {
    title: "Auriculares Inalámbricos",
    description: "Bluetooth 5.2 con cancelación de ruido",
    code: "P1001",
    price: 29999,
    stock: 45,
    category: "Audio",
    status: true,
  },
  {
    title: "Smartwatch Deportivo",
    description: "Monitoreo de ritmo cardíaco y GPS integrado",
    code: "P1002",
    price: 55999,
    stock: 30,
    category: "Wearables",
    status: true,
  },
  {
    title: 'Notebook 14" Liviana',
    description: "Intel i5, 16GB RAM, SSD 512GB",
    code: "P1003",
    price: 499999,
    stock: 12,
    category: "Computación",
    status: true,
  },
  {
    title: 'Monitor 27" QHD',
    description: "165Hz, panel IPS, FreeSync",
    code: "P1004",
    price: 329999,
    stock: 20,
    category: "Computación",
    status: true,
  },
  {
    title: "Teclado Mecánico RGB",
    description: "Switches red, layout TKL",
    code: "P1005",
    price: 79999,
    stock: 50,
    category: "Periféricos",
    status: true,
  },
  {
    title: "Mouse Gamer 12K DPI",
    description: "Sensor óptico y 6 botones programables",
    code: "P1006",
    price: 45999,
    stock: 80,
    category: "Periféricos",
    status: true,
  },
  {
    title: "Parlante Portátil IPX7",
    description: "12 horas de batería, resistente al agua",
    code: "P1007",
    price: 65999,
    stock: 60,
    category: "Audio",
    status: true,
  },
  {
    title: "Cámara Web Full HD",
    description: "1080p con micrófono integrado",
    code: "P1008",
    price: 38999,
    stock: 35,
    category: "Periféricos",
    status: true,
  },
  {
    title: 'Tablet 10" LTE',
    description: "Pantalla Full HD y 128GB de almacenamiento",
    code: "P1009",
    price: 219999,
    stock: 18,
    category: "Tablets",
    status: true,
  },
  {
    title: "Kindle Paperwhite",
    description: "8GB, luz regulable y a prueba de agua",
    code: "P1010",
    price: 169999,
    stock: 25,
    category: "Lectores",
    status: true,
  },
  {
    title: "Disco SSD NVMe 1TB",
    description: "Lectura 3500MB/s y escritura 3000MB/s",
    code: "P1011",
    price: 154999,
    stock: 40,
    category: "Storage",
    status: true,
  },
  {
    title: "Router WiFi 6",
    description: "AX3000 con 4 antenas de alto alcance",
    code: "P1012",
    price: 99999,
    stock: 28,
    category: "Redes",
    status: true,
  },
  {
    title: "Silla Ergonómica",
    description: "Apoyo lumbar ajustable y apoyabrazos 4D",
    code: "P1013",
    price: 289999,
    stock: 10,
    category: "Oficina",
    status: true,
  },
  {
    title: "Microfono USB Condensador",
    description: "Ideal para streaming y videollamadas",
    code: "P1014",
    price: 94999,
    stock: 32,
    category: "Audio",
    status: true,
  },
  {
    title: "Luz Ring LED",
    description: "Incluye trípode y control remoto",
    code: "P1015",
    price: 24999,
    stock: 70,
    category: "Accesorios",
    status: true,
  },
  {
    title: "Impresora Multifunción",
    description: "Inyección de tinta con WiFi y dúplex",
    code: "P1016",
    price: 189999,
    stock: 15,
    category: "Oficina",
    status: true,
  },
  {
    title: "Hub USB-C 7 en 1",
    description: "HDMI 4K, lector SD y tres puertos USB 3.0",
    code: "P1017",
    price: 42999,
    stock: 65,
    category: "Accesorios",
    status: true,
  },
  {
    title: "Cargador GaN 65W",
    description: "Carga rápida para notebook y celular",
    code: "P1018",
    price: 35999,
    stock: 90,
    category: "Accesorios",
    status: true,
  },
  {
    title: "Placa de Video RTX 4060",
    description: "8GB GDDR6 con DLSS 3",
    code: "P1019",
    price: 799999,
    stock: 8,
    category: "Computación",
    status: true,
  },
  {
    title: "Combo Smart Home",
    description: "Pack con smart hub, 2 lámparas y enchufe",
    code: "P1020",
    price: 124999,
    stock: 22,
    category: "Hogar",
    status: true,
  },
  {
    title: "Cámara de Seguridad 360°",
    description: "Visión nocturna y detección de movimiento",
    code: "P1021",
    price: 74999,
    stock: 26,
    category: "Hogar",
    status: true,
  },
];

async function seed() {
  try {
    await connectDB(process.env.MONGODB_URI);

    const results = [];
    for (const product of products) {
      const updated = await Product.findOneAndUpdate(
        { code: product.code },
        { $set: product },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(updated);
    }

    console.log(`Productos insertados/actualizados: ${results.length}`);
  } catch (error) {
    console.error("Error al poblar productos:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
