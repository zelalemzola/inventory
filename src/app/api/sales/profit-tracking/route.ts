import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    await dbConnect();
    
    // Get current date
    const currentDate = new Date();
    
    // Get date 12 months ago
    const startDate = new Date();
    startDate.setMonth(currentDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    
    // Get all completed sales in the last 12 months
    const sales = await Sale.find({
      status: 'Completed',
      createdAt: { $gte: startDate }
    });
    
    // Initialize monthly data
    const monthlyData: { [key: string]: {
      month: string,
      revenue: number,
      cost: number,
      profit: number,
      margin: number
    }} = {};
    
    // Initialize all 12 months with zero values
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      monthlyData[monthKey] = {
        month: monthName,
        revenue: 0,
        cost: 0,
        profit: 0,
        margin: 0
      };
    }
    
    // Process each sale
    for (const sale of sales) {
      const date = new Date(sale.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += sale.totalAmount;
        monthlyData[monthKey].cost += sale.totalCost;
        monthlyData[monthKey].profit += sale.profit;
      }
    }
    
    // Calculate profit margin for each month
    for (const key in monthlyData) {
      const data = monthlyData[key];
      data.margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    }
    
    // Convert to array and sort by month
    const profitTracking = Object.values(monthlyData)
      .sort((a, b) => {
        const monthA = Object.keys(monthlyData).find(key => monthlyData[key] === a) || '';
        const monthB = Object.keys(monthlyData).find(key => monthlyData[key] === b) || '';
        return monthA.localeCompare(monthB);
      });
    
    return NextResponse.json(
      successResponse(profitTracking, 'Profit tracking data retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching profit tracking:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch profit tracking', 500, error),
      { status: 500 }
    );
  }
}

