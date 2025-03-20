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
      profit: number,
      salesCount: number
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
        profit: 0,
        salesCount: 0
      };
    }
    
    // Process each sale
    for (const sale of sales) {
      const date = new Date(sale.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += sale.totalAmount;
        monthlyData[monthKey].profit += sale.profit;
        monthlyData[monthKey].salesCount += 1;
      }
    }
    
    // Convert to array and sort by month
    const monthlySales = Object.values(monthlyData)
      .sort((a, b) => {
        const monthA = Object.keys(monthlyData).find(key => monthlyData[key] === a) || '';
        const monthB = Object.keys(monthlyData).find(key => monthlyData[key] === b) || '';
        return monthA.localeCompare(monthB);
      });
    
    return NextResponse.json(
      successResponse(monthlySales, 'Monthly sales retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching monthly sales:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch monthly sales', 500, error),
      { status: 500 }
    );
  }
}

