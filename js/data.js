// data.js
// ────────────────────────────────────────────────────────────────
// Lista completa y corregida de industrias para el juego.
// Cada objeto incluye:
//   • id, name, description, price, image
//   • weeklyIncome, constructionTime
//   • production: { item, quarterlyAmount, basePrice, employees, salaryPerEmployee }
// ────────────────────────────────────────────────────────────────

export const industries = [
    {
        id: 1,
        name: "Fábrica de Automóviles",
        description: "Producción de vehículos para el mercado local",
        price: 100_000_000,          // 100 M USD
        image: "assets/img/auto_factory.png",
        weeklyIncome: 1_200_0,     // 1,2 M USD
        constructionTime: 24,        // 24 semanas ≈ 6 meses
        production: {
            item: "Automóviles",
            quarterlyAmount: 3_00,
            basePrice: 25_000,
            employees: 5,
            salaryPerEmployee: 1_200,
            image: "assets/img/products/automobiles.png"
        }
    },
    {
        id: 2,
        name: "Planta Siderúrgica",
        description: "Producción de acero y metales",
        price: 250_000_000,          // 250 M USD
        image: "assets/img/steel-plant.png",
        weeklyIncome: 2_800_0,     // 2,8 M USD
        constructionTime: 32,        // 32 semanas ≈ 8 meses
        production: {
            item: "Toneladas de Acero",
            quarterlyAmount: 250_00,
            basePrice: 800,
            employees: 5,
            salaryPerEmployee: 1_500,
            image: "assets/img/products/steel.png"
        }
    },
    {
        id: 3,
        name: "Fábrica Textil",
        description: "Producción de telas y ropa",
        price: 15_000_000,           // 15 M USD
        image: "assets/img/fabrica-textil.png",
        weeklyIncome: 180_0,       // 180 K USD
        constructionTime: 12,        // 12 semanas ≈ 3 meses
        production: {
            item: "Prendas de Ropa",
            quarterlyAmount: 200_00,
            basePrice: 30,
            employees: 5,
            salaryPerEmployee: 600,
            image: "assets/img/products/clothes.png"
        }
    },
    {
        id: 4,
        name: "Planta Química",
        description: "Producción de productos químicos",
        price: 80_000_000,           // 80 M USD
        image: "assets/img/planta-quimica.png",
        weeklyIncome: 950_0,       // 950 K USD
        constructionTime: 20,        // 20 semanas ≈ 5 meses
        production: {
            item: "Productos Químicos",
            quarterlyAmount: 50_000,
            basePrice: 1_200,
            employees: 5,
            salaryPerEmployee: 1_800,
            image: "assets/img/products/chemistry.png"
        }
    },
    {
        id: 5,
        name: "Planta de Semiconductores",
        description: "Fabricación de chips y componentes electrónicos",
        price: 450_000_000,          // 450 M USD
        image: "assets/img/semiconductor.png",
        weeklyIncome: 4_200_0,     // 4,2 M USD
        constructionTime: 40,        // 40 semanas ≈ 10 meses
        production: {
            item: "Wafers de Silicio",
            quarterlyAmount: 120_00,
            basePrice: 2_500,
            employees: 5,
            salaryPerEmployee: 2_200,
            image: "assets/img/products/semiconductors.png"
        }
    },
    {
        id: 6,
        name: "Fábrica de Baterías",
        description: "Producción de baterías de litio para vehículos eléctricos",
        price: 180_000_000,          // 180 M USD
        image: "assets/img/battery.png",
        weeklyIncome: 2_100_0,     // 2,1 M USD
        constructionTime: 28,        // 28 semanas ≈ 7 meses
        production: {
            item: "Baterías de Litio",
            quarterlyAmount: 100_00,
            basePrice: 800,
            employees: 5,
            salaryPerEmployee: 1_100
        }
    },
    {
        id: 7,
        name: "Planta Aeroespacial",
        description: "Fabricación de componentes para la industria aeroespacial",
        price: 350_000_000,          // 350 M USD
        image: "assets/img/aerospace.png",
        weeklyIncome: 3_800_0,     // 3,8 M USD
        constructionTime: 36,        // 36 semanas ≈ 9 meses
        production: {
            item: "Componentes Aeroespaciales",
            quarterlyAmount: 50,
            basePrice: 250_000,
            employees: 5,
            salaryPerEmployee: 2_500
        }
    },
    {
        id: 8,
        name: "Planta de Energía Solar",
        description: "Fabricación de paneles solares y equipos fotovoltaicos",
        price: 120_000_000,          // 120 M USD
        image: "assets/img/solar.png",
        weeklyIncome: 1_500_0,     // 1,5 M USD
        constructionTime: 24,        // 24 semanas ≈ 6 meses
        production: {
            item: "Paneles Solares",
            quarterlyAmount: 50_00,
            basePrice: 350,
            employees: 5,
            salaryPerEmployee: 900
        }
    },
    {
        id: 9,
        name: "Planta Embotelladora",
        description: "Producción de agua mineral y bebidas",
        price: 5_000_000,            // 5 M USD
        image: "assets/img/bottling.png",
        weeklyIncome: 85_0,        // 85 K USD
        constructionTime: 16,        // 16 semanas ≈ 4 meses
        production: {
            item: "Cajas de Bebidas",
            quarterlyAmount: 430_00,
            basePrice: 11,
            employees: 5,
            salaryPerEmployee: 40,
            image: "assets/img/products/bottlings.png"
        }
    },
    {
        id: 10,
        name: "Fábrica de Muebles",
        description: "Producción de muebles y mobiliario",
        price: 3_500_000,            // 3,5 M USD
        image: "assets/img/furniture.png",
        weeklyIncome: 65_0,        // 65 K USD
        constructionTime: 12,        // 12 semanas ≈ 3 meses
        production: {
            item: "Juegos de Muebles",
            quarterlyAmount: 5_00,
            basePrice: 800,
            employees: 5,
            salaryPerEmployee: 350,
            image: "assets/img/products/furnitures.png",
        }
    },
    {
        id: 11,
        name: "Planta de Alimentos",
        description: "Procesamiento de alimentos y conservas",
        price: 7_500_000,            // 7,5 M USD
        image: "assets/img/food.png",
        weeklyIncome: 1200_0,       // 120 K USD
        constructionTime: 20,        // 20 semanas ≈ 5 meses
        production: {
            item: "Lotes de Alimentos",
            quarterlyAmount: 150_00,
            basePrice: 45,
            employees: 5,
            salaryPerEmployee: 500
        }
    },
    {
        id: 12,
        name: "Fábrica de Plásticos",
        description: "Producción de envases y productos plásticos",
        price: 4_800_000,            // 4,8 M USD
        image: "assets/img/plastic.png",
        weeklyIncome: 75_0,        // 75 K USD
        constructionTime: 16,        // 16 semanas ≈ 4 meses
        production: {
            item: "Lotes de Plásticos",
            quarterlyAmount: 300_00,
            basePrice: 16,
            employees: 5,
            salaryPerEmployee: 350,
            image: "assets/img/products/plastics.png",
        }
    },
    {
    id: 13,
    name: "Planta de Reciclaje",
    description: "Transformación de residuos en materiales reutilizables",
    price: 20_000_000,           // 20 M USD
    image: "assets/img/recycling.png",
    weeklyIncome: 250_0,       // 250 K USD
    constructionTime: 18,        // 18 semanas ≈ 4,5 meses
    production: {
        item: "Materiales Reciclados",
        quarterlyAmount: 400_00,
        basePrice: 50,
        employees: 5,
        salaryPerEmployee: 550
    }
},
{
    id: 14,
    name: "Fábrica de Vidrio",
    description: "Producción de envases y productos de vidrio",
    price: 10_000_000,           // 10 M USD
    image: "assets/img/glass_factory.png",
    weeklyIncome: 160_0,       // 160 K USD
    constructionTime: 14,        // 14 semanas ≈ 3,5 meses
    production: {
        item: "Botellas y Envases",
        quarterlyAmount: 200_00,
        basePrice: 40,
        employees: 5,
        salaryPerEmployee: 500
    }
},
{
    id: 15,
    name: "Fábrica de Papel",
    description: "Fabricación de papel y productos derivados",
    price: 8_500_000,            // 8,5 M USD
    image: "assets/img/paper_factory.png",
    weeklyIncome: 130_0,       // 130 K USD
    constructionTime: 15,        // 15 semanas ≈ 3,75 meses
    production: {
        item: "Rollos de Papel",
        quarterlyAmount: 350_00,
        basePrice: 20,
        employees: 5,
        salaryPerEmployee: 450,
         image: "assets/img/products/paper.png",
    }
},
{
    id: 16,
    name: "Fábrica de Calzado",
    description: "Producción de zapatos y botas",
    price: 12_000_000,           // 12 M USD
    image: "assets/img/shoe_factory.png",
    weeklyIncome: 180_0,       // 180 K USD
    constructionTime: 16,        // 16 semanas ≈ 4 meses
    production: {
        item: "Pares de Zapatos",
        quarterlyAmount: 120_00,
        basePrice: 50,
        employees: 5,
        salaryPerEmployee: 500
    }
}
];
