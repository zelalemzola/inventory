import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all completed sales
    const sales = await Sale.find({ status: 'Completed' });
    
    // Create a map to track profit by category
    const categoryProfit: { [key: string]: { 
      category: string,
      revenue: number,
      cost: number,
      profit: number,
      margin: number
    }} = {};
    
    // Process each sale
    for (const sale of sales) {
      for (const item of sale.items) {
        const category = item.category;
        
        if (!categoryProfit[category]) {
          categoryProfit[category] = {
            category,
            revenue: 0,
            cost: 0,
            profit: 0,
            margin: 0
          };
        }
        
        const itemRevenue = item.price * item.quantity;
        const itemCost = item.cost * item.quantity;
        const itemProfit = itemRevenue - itemCost;
        
        categoryProfit[category].revenue += itemRevenue;
        categoryProfit[category].cost += itemCost;
        categoryProfit[category].profit += itemProfit;
      }
    }
    
    // Calculate profit margin for each category
    for (const category in categoryProfit) {
      const data = categoryProfit[category];
      data.margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    }
    
    // Convert to array and sort by profit
    const profitByCategory = Object.values(categoryProfit)
      .sort((a, b) => b.profit - a.profit);
    
    return NextResponse.json(
      successResponse(profitByCategory, 'Category profit data retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching category profit:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch category profit', 500, error),
      { status: 500 }
    );
  }
}

