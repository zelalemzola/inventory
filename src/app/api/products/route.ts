import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    let query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Product.countDocuments(query);
    
    // Filter for low stock if needed
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(product => product.hasLowStock);
    }
    
    return NextResponse.json(
      successResponse({
        products: filteredProducts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }, 'Products retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch products', 500, error),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.category) {
      return NextResponse.json(
        errorResponse('Missing required fields', 400),
        { status: 400 }
      );
    }
    
    // Ensure variants is an array
    if (!Array.isArray(body.variants) || body.variants.length === 0) {
      return NextResponse.json(
        errorResponse('At least one variant is required', 400),
        { status: 400 }
      );
    }
    
    // Validate each variant
    for (const variant of body.variants) {
      if (!variant.name || !variant.sku || variant.cost === undefined || variant.price === undefined) {
        return NextResponse.json(
          errorResponse('Each variant must have name, sku, cost, and price', 400),
          { status: 400 }
        );
      }
    }
    
    const newProduct = new Product(body);
    await newProduct.save();
    
    return NextResponse.json(
      successResponse(newProduct, 'Product created successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle duplicate SKU error
    if (error.code === 11000) {
      return NextResponse.json(
        errorResponse('A variant with this SKU already exists', 400, error),
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      errorResponse('Failed to create product', 500, error),
      { status: 500 }
    );
  }
}

