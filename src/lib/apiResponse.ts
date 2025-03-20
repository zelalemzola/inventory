export function successResponse(data: any, message = 'Success') {
    return {
      success: true,
      message,
      data
    };
  }
  
  export function errorResponse(message = 'An error occurred', statusCode = 500, error: any = null) {
    console.error(`API Error (${statusCode}):`, message, error);
    
    return {
      success: false,
      message,
      error: error ? (error.message || String(error)) : null,
      statusCode
    };
  }
  
  