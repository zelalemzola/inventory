import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all completed sales
    const sales = await Sale.find({ status: 'Completed' });
    
    // Create a map to track sales by category
    const categorySales: { [key: string]: { 
      category: string,
      totalQuantity: number,
      totalRevenue: number,
      totalProfit: number
    }} = {};
    
    // Process each sale
    for (const sale of sales) {
      for (const item of sale.items) {
        const category = item.category;
        
        if (!categorySales[category]) {
          categorySales[category] = {
            category,
            totalQuantity: 0,
            totalRevenue: 0,
            totalProfit: 0
          };
        }
        
        categorySales[category].totalQuantity += item.quantity;
        categorySales[category].totalRevenue += item.price * item.quantity;
        categorySales[category].totalProfit += (item.price - item.cost) * item.quantity;
      }
    }
    
    // Convert to array and sort by revenue
    const salesByCategory = Object.values(categorySales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    return NextResponse.json(
      successResponse(salesByCategory, 'Sales by category retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching sales by category:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch sales by category', 500, error),
      { status: 500 }
    );
  }
}

