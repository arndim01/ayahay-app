import { NextResponse } from 'next/server';

/**
 * GET /api/booking-cutoffs?shippingLineId={shippingLineId}
 * Retrieves booking cutoffs for a specific shipping line
 */
export async function GET(request: Request) {
  console.log('GET /api/booking-cutoffs endpoint called');

  try {
    const { searchParams } = new URL(request.url);
    const shippingLineId = searchParams.get('shippingLineId');
    const originId = searchParams.get('originId');
    const destinationId = searchParams.get('destinationId');

    console.log('Request params:', { shippingLineId, originId, destinationId });

    if (!shippingLineId) {
      return NextResponse.json(
        { error: 'Missing required shippingLineId parameter' },
        { status: 400 }
      );
    }

    // Check if API base URL is defined
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      console.log(
        'NEXT_PUBLIC_API_BASE_URL is not defined - returning hardcoded data for shipping line',
        shippingLineId
      );

      // Return hardcoded data for the specified shipping line
      // We're using the data from the screenshot as an example
      const mockData = [
        {
          id: 1,
          shipping_line_id: 6,
          origin: 1,
          destination: 7,
          cut_off_condition_type: 'number_of_hours',
          cut_off_value: 23,
        },
        {
          id: 2,
          shipping_line_id: 8,
          origin: 4,
          destination: 17,
          cut_off_condition_type: 'fixed_hour',
          cut_off_value: 17,
        },
        {
          id: 3,
          shipping_line_id: 9,
          origin: 4,
          destination: 18,
          cut_off_condition_type: 'number_of_hours',
          cut_off_value: 4,
        },
      ];

      // Add specific cutoffs for shipping line 4
      if (shippingLineId === '4') {
        mockData.push(
          {
            id: 4,
            shipping_line_id: 4,
            origin: 17,
            destination: 18,
            cut_off_condition_type: 'number_of_hours',
            cut_off_value: 12,
          },
          {
            id: 5,
            shipping_line_id: 4,
            origin: 18,
            destination: 17,
            cut_off_condition_type: 'number_of_hours',
            cut_off_value: 12,
          }
        );
      }

      // If originId and destinationId are provided, filter the mocked data
      if (originId && destinationId) {
        console.log(
          'Filtering mocked data by shipping line, origin, and destination:',
          { shippingLineId, originId, destinationId }
        );
        const filteredData = mockData.filter(
          (item) =>
            item.shipping_line_id.toString() === shippingLineId &&
            item.origin.toString() === originId &&
            item.destination.toString() === destinationId
        );
        console.log('Filtered mock data result:', filteredData);
        return NextResponse.json(filteredData);
      }

      // Otherwise, return all cutoffs for the shipping line
      console.log(
        'Filtering mocked data by shipping line only:',
        shippingLineId
      );
      const filteredData = mockData.filter(
        (item) => item.shipping_line_id.toString() === shippingLineId
      );
      console.log('Filtered mock data result (all routes):', filteredData);
      return NextResponse.json(filteredData);
    }

    let url = `${apiBaseUrl}/preference/booking-cutoff/shipping-line/${shippingLineId}`;

    // Debug the URL construction
    console.log('API Base URL:', apiBaseUrl);
    console.log('Full API URL:', url);

    // If we have origin and destination, use the specific route endpoint
    if (originId && destinationId) {
      url = `${apiBaseUrl}/api/booking-cutoff/route/${shippingLineId}/${originId}/${destinationId}`;
      console.log('Using route-specific URL:', url);
      console.log('Fetching cutoff data for specific route parameters:', {
        shippingLineId,
        originId,
        destinationId,
      });
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);

    // Try to test the API directly - for debugging only
    try {
      console.log('Testing API connection...');
      const testResponse = await fetch(`${apiBaseUrl}/health-check`, {
        method: 'HEAD',
        cache: 'no-store',
      });
      console.log('API Health Check status:', testResponse.status);
    } catch (testError) {
      console.error('API Health Check failed:', testError);
    }

    // Make the actual API call
    console.log('Sending request to API...');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Only add Authorization header if it exists
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Array.from(response.headers).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, string>),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);

      // Return empty array instead of error to prevent breaking the UI
      return NextResponse.json([]);
    }

    const data = await response.json();
    console.log('Booking cutoffs received:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching booking cutoffs:', error);

    // Return empty array instead of error to prevent breaking the UI
    return NextResponse.json([]);
  }
}
