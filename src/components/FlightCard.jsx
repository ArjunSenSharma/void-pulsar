import React from 'react';
import { Plane, Clock } from 'lucide-react';

const FlightCard = ({ flight, onSelect, isReturn }) => {
    // Helper to format duration minutes to Hours Minutes
    const formatDuration = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const firstSegment = flight.flights[0];
    const lastSegment = flight.flights[flight.flights.length - 1];
    const departure = firstSegment.departure_airport;
    const arrival = lastSegment.arrival_airport;
    const stopCount = flight.flights.length - 1;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow border border-gray-100 flex flex-col gap-4 animate-fadeIn">
            {/* Primary Flight Info Row */}
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center w-full md:w-1/4 mb-4 md:mb-0">
                    <img
                        src={firstSegment.airline_logo}
                        alt={firstSegment.airline}
                        className="h-10 w-10 mr-4 object-contain"
                    />
                    <div>
                        <p className="font-semibold text-gray-900">{firstSegment.airline}</p>
                        <p className="text-xs text-gray-500">{firstSegment.flight_number}</p>
                    </div>
                </div>

                <div className="flex flex-1 justify-between items-center w-full px-4">
                    <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{departure.time.split(' ')[1]}</p>
                        <p className="text-sm text-gray-500">{departure.id}</p>
                    </div>

                    <div className="flex flex-col items-center px-4 w-full">
                        <p className="text-xs text-gray-400 mb-1">{formatDuration(flight.total_duration)}</p>
                        <div className="w-full flex items-center">
                            <div className="h-[1px] bg-gray-300 w-full"></div>
                            <Plane className="h-4 w-4 text-indigo-500 mx-2 transform rotate-90" />
                            <div className="h-[1px] bg-gray-300 w-full"></div>
                        </div>
                        <p className="text-xs text-indigo-600 font-medium mt-1">
                            {stopCount === 0 ? 'Direct' : `${stopCount} Stop${stopCount > 1 ? 's' : ''}`}
                        </p>
                    </div>

                    <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{arrival.time.split(' ')[1]}</p>
                        <p className="text-sm text-gray-500">{arrival.id}</p>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 pl-0 md:pl-6">
                    {isReturn ? (
                        flight.price > 0 ? (
                            <div className="text-right mb-2">
                                <p className="text-2xl font-bold text-indigo-600">+${flight.price}</p>
                                <p className="text-[10px] text-gray-500">additional fare</p>
                            </div>
                        ) : (
                            <div className="text-right mb-2">
                                <p className="text-lg font-bold text-green-600">Included</p>
                                <p className="text-[10px] text-gray-500">no extra charge</p>
                            </div>
                        )
                    ) : (
                        flight.price > 0 ? (
                            <>
                                <p className="text-2xl font-bold text-indigo-600">${flight.price}</p>
                                <p className="text-xs text-gray-500 mb-2">avg. per passenger</p>
                            </>
                        ) : (
                            <div className="text-right mb-2">
                                <p className="text-lg font-bold text-green-600">Included</p>
                                <p className="text-xs text-gray-500">in package</p>
                            </div>
                        )
                    )}
                    <button 
                        onClick={onSelect}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 w-full md:w-auto transition-colors"
                    >
                        Select
                    </button>
                </div>
            </div>

            {/* Expanded Details Row */}
            <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                {/* Flight Specs */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Aircraft:</span>
                        <span>{firstSegment.airplane || "Aircraft info unavailable"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Class:</span>
                        <span>{firstSegment.travel_class}</span>
                    </div>
                    {firstSegment.legroom && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 ml-6">Legroom:</span>
                            <span>{firstSegment.legroom}</span>
                        </div>
                    )}
                </div>

                {/* Amenities & Emissions */}
                <div className="space-y-2">
                    {flight.carbon_emissions && (
                        <div className={`flex items-center gap-2 p-2 rounded-md w-fit ${(flight.carbon_emissions.difference_percent || 0) > 0
                                ? 'text-red-700 bg-red-50'
                                : 'text-green-700 bg-green-50'
                            }`}>
                            <span className="font-medium">CO₂ Emissions:</span>
                            <span>{Math.round(flight.carbon_emissions.this_flight / 1000)} kg</span>
                            {flight.carbon_emissions.difference_percent !== undefined && (
                                <span className="text-xs font-semibold">
                                    {(flight.carbon_emissions.difference_percent > 0 ? '+' : '')}
                                    {flight.carbon_emissions.difference_percent}%
                                </span>
                            )}
                        </div>
                    )}

                    {firstSegment.extensions && firstSegment.extensions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {firstSegment.extensions.map((ext, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-200">
                                    {ext}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlightCard;
