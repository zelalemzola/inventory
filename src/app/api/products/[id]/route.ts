import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        errorResponse('Product not found', 404),
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      successResponse(product, 'Product retrieved successfully')
    );
  } catch (error: any) {
    console.error(`Error fetching product ${params.id}:`, error);
    return NextResponse.json(
      errorResponse('Failed to fetch product', 500, error),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Find the product first
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        errorResponse('Product not found', 404),
        { status: 404 }
      );
    }
    
    // Update basic product info
    if (body.name) product.name = body.name;
    if (body.description) product.description = body.description;
    if (body.category) product.category = body.category;
    if (body.isActive !== undefined) product.isActive = body.isActive;
    
    // Handle variants update if provided
    if (Array.isArray(body.variants)) {
      // Validate each variant
      for (const variant of body.variants) {
        if (!variant.name || !variant.sku || variant.cost === undefined || variant.price === undefined) {
          return NextResponse.json(
            errorResponse('Each variant must have name, sku, cost, and price', 400),
            { status: 400 }
          );
        }
      }
      
      // Replace variants
      product.variants = body.variants;
    }
    
    await product.save();
    
    return NextResponse.json(
      successResponse(product, 'Product updated successfully')
    );
  } catch (error: any) {
    console.error(`Error updating product ${params.id}:`, error);
    
    // Handle duplicate SKU error
    if (error.code === 11000) {
      return NextResponse.json(
        errorResponse('A variant with this SKU already exists', 400, error),
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      errorResponse('Failed to update product', 500, error),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const product = await Product.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json(
        errorResponse('Product not found', 404),
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      successResponse(null, 'Product deleted successfully')
    );
  } catch (error: any) {
    console.error(`Error deleting product ${params.id}:`, error);
    return NextResponse.json(
      errorResponse('Failed to delete product', 500, error),
      { status: 500 }
    );
  }
}

