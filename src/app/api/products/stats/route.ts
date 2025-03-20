import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all products
    const products = await Product.find();
    
    // Calculate stats
    let totalProducts = products.length;
    let totalStock = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    
    for (const product of products) {
      totalStock += product.totalStock;
      totalValue += product.totalValue;
      if (product.hasLowStock) {
        lowStockCount++;
      }
    }
    
    const stats = {
      totalProducts,
      totalStock,
      totalValue,
      lowStockCount
    };
    
    return NextResponse.json(
      successResponse(stats, 'Product stats retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch product stats', 500, error),
      { status: 500 }
    );
  }
}

