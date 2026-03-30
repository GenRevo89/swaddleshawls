import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

const SEED_PRODUCTS = [
    {
        name: "Premium Essential",
        slug: "premium-essential",
        category: "Best Sellers",
        description:
            "Our flagship product — crafted with care for everyday excellence.",
        price: 89.0,
    },
    {
        name: "Performance Plus",
        slug: "performance-plus",
        category: "Performance",
        description:
            "Engineered for those who demand more. Elevate your daily routine.",
        price: 64.0,
    },
    {
        name: "Starter Kit",
        slug: "starter-kit",
        category: "Bundles",
        description:
            "Everything you need to get started. A curated collection of our best products.",
        price: 55.0,
    },
];

export async function POST() {
    try {
        await connectToDatabase();

        const results = [];
        for (const product of SEED_PRODUCTS) {
            const upserted = await Product.findOneAndUpdate(
                { slug: product.slug },
                { $set: product },
                { upsert: true, new: true }
            );
            results.push(upserted);
        }

        return NextResponse.json(
            {
                success: true,
                message: `Seeded ${results.length} products`,
                data: results,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error seeding products:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
