import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    await dbConnect();
    
    const categories = await Product.distinct('category');
    
    return NextResponse.json(
      successResponse(categories, 'Categories retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch categories', 500, error),
      { status: 500 }
    );
  }
}

