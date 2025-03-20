import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all sales
    const sales = await Sale.find({ status: 'Completed' });
    
    // Create a map to track product sales
    const productSales: { [key: string]: { 
      productId: string,
      productName: string,
      category: string,
      totalQuantity: number,
      totalRevenue: number
    }} = {};
    
    // Process each sale
    for (const sale of sales) {
      for (const item of sale.items) {
        const productId = item.productId.toString();
        
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            productName: item.productName,
            category: item.category,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        
        productSales[productId].totalQuantity += item.quantity;
        productSales[productId].totalRevenue += item.price * item.quantity;
      }
    }
    
    // Convert to array and sort by revenue
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
    
    return NextResponse.json(
      successResponse(topProducts, 'Top products retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching top products:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch top products', 500, error),
      { status: 500 }
    );
  }
}

