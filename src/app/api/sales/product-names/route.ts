import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all products
    const products = await Product.find({}, 'name');
    
    // Format data
    const productNames = products.map(product => ({
      id: product._id,
      name: product.name
    }));
    
    return NextResponse.json(
      successResponse(productNames, 'Product names retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching product names:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch product names', 500, error),
      { status: 500 }
    );
  }
}

