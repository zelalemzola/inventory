import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const actionRequired = searchParams.get('actionRequired');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    let query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (isRead !== null) {
      query.isRead = isRead === 'true';
    }
    
    if (actionRequired !== null) {
      query.actionRequired = actionRequired === 'true';
    }
    
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ isRead: false });
    
    return NextResponse.json(
      successResponse({
        notifications,
        unreadCount,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }, 'Notifications retrieved successfully')
    );
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch notifications', 500, error),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        errorResponse('Missing required fields', 400),
        { status: 400 }
      );
    }
    
    const newNotification = new Notification(body);
    await newNotification.save();
    
    return NextResponse.json(
      successResponse(newNotification, 'Notification created successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      errorResponse('Failed to create notification', 500, error),
      { status: 500 }
    );
  }
}

