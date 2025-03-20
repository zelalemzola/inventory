import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    
    let startDate: Date | null = null;
    const endDate = new Date();
    
    // Set time period
    if (period === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // Build query
    let query: any = { status: 'Completed' };
    if (startDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    // Get sales
    const sales = await Sale.find(query);
    
    // Calculate stats
    let totalSales = sales.length;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    
    for (const sale of sales) {
      totalRevenue += sale.totalAmount;
      totalCost += sale.totalCost;
      totalProfit += sale.profit;
    }
    
    const stats = {
      totalSales,
      totalRevenue,
      totalCost,
      totalProfit
    };
    
    return NextResponse.json(
      successResponse(stats, 'Sales stats retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching sales stats:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch sales stats', 500, error),
      { status: 500 }
    );
  }
}

