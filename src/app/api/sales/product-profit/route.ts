import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        errorResponse('Product ID is required', 400),
        { status: 400 }
      );
    }
    
    // Get all completed sales for this product
    const sales = await Sale.find({
      status: 'Completed',
      'items.productId': productId
    });
    
    // Initialize data
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalQuantity = 0;
    
    // Process each sale
    for (const sale of sales) {
      for (const item of sale.items) {
        if (item.productId.toString() === productId) {
          const itemRevenue = item.price * item.quantity;
          const itemCost = item.cost * item.quantity;
          const itemProfit = itemRevenue - itemCost;
          
          totalRevenue += itemRevenue;
          totalCost += itemCost;
          totalProfit += itemProfit;
          totalQuantity += item.quantity;
        }
      }
    }
    
    // Calculate profit margin
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    const data = {
      totalRevenue,
      totalCost,
      totalProfit,
      totalQuantity,
      profitMargin
    };
    
    return NextResponse.json(
      successResponse(data, 'Product profit data retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching product profit:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch product profit', 500, error),
      { status: 500 }
    );
  }
}

