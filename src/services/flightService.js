import axios from 'axios';

const API_KEY = import.meta.env.VITE_SERP_API_KEY; // We'll need to set this in .env
const BASE_URL = '/api/search.json';

// Helper to get class name, price multiplier and extensions based on travel_class parameter
const getClassDetails = (travelClassParam) => {
    // travel_class param from SerpAPI can be '1' (Economy), '2' (Premium Economy), '3' (Business), '4' (First Class)
    const tc = String(travelClassParam || '1');
    
    if (tc === '2' || tc.toLowerCase() === 'premium economy') {
        return {
            name: "Premium Economy",
            multiplier: 1.5,
            extensions: ["Free Wi-Fi", "In-seat power", "33 in legroom", "Extra recline", "Premium meal"]
        };
    } else if (tc === '3' || tc.toLowerCase() === 'business') {
        return {
            name: "Business",
            multiplier: 3.0,
            extensions: ["Free high-speed Wi-Fi", "Universal power outlet", "38 in legroom", "Lie-flat seat", "Gourmet multi-course dining", "Lounge access"]
        };
    } else if (tc === '4' || tc.toLowerCase() === 'first') {
        return {
            name: "First Class",
            multiplier: 5.0,
            extensions: ["Private Suite", "Free high-speed Wi-Fi", "Universal power outlet", "Lie-flat seat with bedding", "Gourmet dining on-demand", "VIP Lounge access", "Priority boarding"]
        };
    } else {
        return {
            name: "Economy",
            multiplier: 1.0,
            extensions: ["Wi-Fi for a fee", "In-seat power", "30 in legroom"]
        };
    }
};

// Helper to generate dynamic mock outbound flights
const generateMockOutboundFlights = (params) => {
    const origin = (params.departure_id || 'SFO').toUpperCase();
    const dest = (params.arrival_id || 'JFK').toUpperCase();
    const date = params.outbound_date || '2024-02-10';
    const classDetails = getClassDetails(params.travel_class);

    return {
        search_metadata: {
            status: "Success",
            created_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
            google_flights_url: `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${dest}`
        },
        best_flights: [
            {
                flights: [
                    {
                        departure_airport: { name: `${origin} Airport`, id: origin, time: `${date} 06:00` },
                        arrival_airport: { name: `${dest} Airport`, id: dest, time: `${date} 14:30` },
                        duration: 330,
                        airplane: "Boeing 737",
                        airline: "United Airlines",
                        airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/UA.png",
                        travel_class: classDetails.name,
                        flight_number: "UA 123",
                        extensions: classDetails.extensions
                    }
                ],
                total_duration: 330,
                carbon_emissions: { this_flight: 1000000, difference_percent: -12 },
                price: Math.round((params.type === '1' ? 450 : 250) * classDetails.multiplier),
                type: params.type === '1' ? "Round trip" : "One way",
                departure_token: "mock_departure_token_1"
            },
            {
                flights: [
                    {
                        departure_airport: { name: `${origin} Airport`, id: origin, time: `${date} 08:00` },
                        arrival_airport: { name: `${dest} Airport`, id: dest, time: `${date} 16:30` },
                        duration: 330,
                        airplane: "Airbus A320",
                        airline: "Delta Air Lines",
                        airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/DL.png",
                        travel_class: classDetails.name,
                        flight_number: "DL 456",
                        extensions: classDetails.extensions.map(ext => ext.includes("Wi-Fi") ? "Free Wi-Fi" : ext)
                    }
                ],
                total_duration: 330,
                carbon_emissions: { this_flight: 950000, difference_percent: -16 },
                price: Math.round((params.type === '1' ? 490 : 280) * classDetails.multiplier),
                type: params.type === '1' ? "Round trip" : "One way",
                departure_token: "mock_departure_token_2"
            }
        ],
        other_flights: [
            {
                flights: [
                    {
                        departure_airport: { name: `${origin} Airport`, id: origin, time: `${date} 11:30` },
                        arrival_airport: { name: `${dest} Airport`, id: dest, time: `${date} 20:00` },
                        duration: 330,
                        airplane: "Boeing 787 Dreamliner",
                        airline: "American Airlines",
                        airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/AA.png",
                        travel_class: classDetails.name,
                        flight_number: "AA 789",
                        extensions: classDetails.extensions
                    }
                ],
                total_duration: 330,
                carbon_emissions: { this_flight: 1100000, difference_percent: 2 },
                price: Math.round((params.type === '1' ? 520 : 310) * classDetails.multiplier),
                type: params.type === '1' ? "Round trip" : "One way",
                departure_token: "mock_departure_token_3"
            }
        ]
    };
};

// Helper to generate dynamic mock return flights
const generateMockReturnFlights = (params) => {
    const origin = (params.arrival_id || 'JFK').toUpperCase();
    const dest = (params.departure_id || 'SFO').toUpperCase();
    const date = params.return_date || '2024-02-17';
    const classDetails = getClassDetails(params.travel_class);

    return {
        search_metadata: {
            status: "Success",
            created_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
            google_flights_url: `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${dest}`
        },
        best_flights: [
            {
                flights: [
                    {
                        departure_airport: { name: `${origin} Airport`, id: origin, time: `${date} 09:00` },
                        arrival_airport: { name: `${dest} Airport`, id: dest, time: `${date} 17:30` },
                        duration: 330,
                        airplane: "Boeing 777",
                        airline: "United Airlines",
                        airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/UA.png",
                        travel_class: classDetails.name,
                        flight_number: "UA 987",
                        extensions: classDetails.extensions
                    }
                ],
                total_duration: 330,
                carbon_emissions: { this_flight: 980000, difference_percent: -14 },
                price: 0,
                type: "Round trip",
                booking_token: "mock_booking_token_1"
            },
            {
                flights: [
                    {
                        departure_airport: { name: `${origin} Airport`, id: origin, time: `${date} 13:15` },
                        arrival_airport: { name: `${dest} Airport`, id: dest, time: `${date} 21:45` },
                        duration: 330,
                        airplane: "Airbus A350",
                        airline: "Delta Air Lines",
                        airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/DL.png",
                        travel_class: classDetails.name,
                        flight_number: "DL 876",
                        extensions: classDetails.extensions.map(ext => ext.includes("Wi-Fi") ? "Free Wi-Fi" : ext)
                    }
                ],
                total_duration: 330,
                carbon_emissions: { this_flight: 920000, difference_percent: -18 },
                price: Math.round(45 * classDetails.multiplier),
                type: "Round trip",
                booking_token: "mock_booking_token_2"
            }
        ],
        other_flights: []
    };
};

export const searchFlights = async (params) => {
    // Mock data for development if no API key is present or for testing
    if (!API_KEY && !import.meta.env.VITE_USE_REAL_API) {
        console.warn("Using mock data. Set VITE_SERP_API_KEY to use real data.");
        return new Promise((resolve) => {
            setTimeout(() => {
                if (params.departure_token) {
                    resolve(generateMockReturnFlights(params));
                } else {
                    resolve(generateMockOutboundFlights(params));
                }
            }, 1000);
        });
    }

    try {
        console.log(`Fetching from ${BASE_URL} with params:`, { ...params, api_key: '...masked...' });
        const response = await axios.get(BASE_URL, {
            params: {
                engine: 'google_flights',
                api_key: API_KEY,
                ...params
            }
        });
        console.log("API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching flight data:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            console.error("No response received:", error.request);
            throw new Error("Network Error: No response received from API");
        } else {
            console.error("Error setting up request:", error.message);
            throw new Error(`Request Error: ${error.message}`);
        }
    }
};
