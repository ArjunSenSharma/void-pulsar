import React from 'react';
import FlightCard from './FlightCard';

const FlightList = ({ flights, loading, onSelectFlight, isReturn }) => {
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">Searching for flights...</p>
            </div>
        );
    }

    if (!flights) {
        return null;
    }

    if (flights.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-8 text-center bg-white rounded-lg shadow mt-8 border border-gray-100">
                <p className="text-gray-500 text-sm">No flights found. Try updating your search.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-0 animate-fadeIn">
            {flights.map((flight, index) => (
                <FlightCard 
                    key={index} 
                    flight={flight} 
                    onSelect={() => onSelectFlight(flight)}
                    isReturn={isReturn}
                />
            ))}
        </div>
    );
};

export default FlightList;
