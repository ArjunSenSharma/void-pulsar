import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchForm from './components/SearchForm';
import FlightList from './components/FlightList';
import { searchFlights } from './services/flightService';
import { Plane, Calendar, ArrowRight, ArrowLeft, CheckCircle2, Ticket, ShieldCheck, Info, ChevronRight } from 'lucide-react';

function App() {
  const [flights, setFlights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Multi-step state machine
  const [currentStep, setCurrentStep] = useState('search'); // search | outbound | return | review
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  const handleSearch = async (formParams) => {
    setLoading(true);
    setFlights(null);
    setError(null);
    setSelectedOutbound(null);
    setSelectedReturn(null);
    setIsBookingConfirmed(false);
    
    // Save original parameters
    setSearchParams(formParams);
    
    try {
      const result = await searchFlights({
        departure_id: formParams.departure_id,
        arrival_id: formParams.arrival_id,
        outbound_date: formParams.outbound_date,
        return_date: formParams.return_date,
        type: formParams.type,
        travel_class: formParams.travel_class,
        currency: "USD",
        hl: "en"
      });

      let allFlights = [];
      if (result.best_flights) {
        allFlights = [...allFlights, ...result.best_flights];
      }
      if (result.other_flights) {
        allFlights = [...allFlights, ...result.other_flights];
      }
      setFlights(allFlights);
      setCurrentStep('outbound');
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message || "An error occurred while fetching flights. Please try again.");
      setCurrentStep('search');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = async (flight) => {
    if (currentStep === 'outbound') {
      setSelectedOutbound(flight);
      
      // If round trip, we need to fetch return flights
      if (searchParams.type === '1') {
        setLoading(true);
        setFlights(null);
        setError(null);
        setCurrentStep('return');
        
        try {
          const result = await searchFlights({
            departure_id: searchParams.departure_id,
            arrival_id: searchParams.arrival_id,
            outbound_date: searchParams.outbound_date,
            return_date: searchParams.return_date,
            type: searchParams.type,
            travel_class: searchParams.travel_class,
            departure_token: flight.departure_token, // pass chosen flight token
            currency: "USD",
            hl: "en"
          });
          
          let allReturnFlights = [];
          if (result.best_flights) {
            allReturnFlights = [...allReturnFlights, ...result.best_flights];
          }
          if (result.other_flights) {
            allReturnFlights = [...allReturnFlights, ...result.other_flights];
          }
          
          setFlights(allReturnFlights);
        } catch (err) {
          console.error("Fetching return flights failed:", err);
          setError(err.message || "Failed to load returning flights. Please try again.");
          // Rollback to outbound step
          setCurrentStep('outbound');
          // Re-fetch outbound
          handleSearch(searchParams);
        } finally {
          setLoading(false);
        }
      } else {
        // One way, go directly to review
        setCurrentStep('review');
      }
    } else if (currentStep === 'return') {
      setSelectedReturn(flight);
      setCurrentStep('review');
    }
  };

  const handleBackToOutbound = () => {
    // Re-fetch outbound flights
    handleSearch(searchParams);
  };

  const handleBackToReturn = () => {
    setCurrentStep('return');
    // Fetch return flights again using saved outbound token
    handleSelectFlight(selectedOutbound);
  };

  const handleReset = () => {
    setCurrentStep('search');
    setFlights(null);
    setSelectedOutbound(null);
    setSelectedReturn(null);
    setSearchParams(null);
    setIsBookingConfirmed(false);
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-grow pb-16">
        {/* Hero Section */}
        <div className="bg-indigo-900 pb-20 pt-10 sm:pb-24 lg:pb-32 relative overflow-hidden">
          {/* Abstract Background Design */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 opacity-90"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-4">
              Discover Your Next Adventure
            </h1>
            <p className="mt-2 text-lg text-indigo-100 max-w-3xl">
              Find the best flight deals to destinations around the world. Simple, fast, and transparent.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Form (visible when searching or when editing outbound search) */}
          {currentStep === 'search' && (
            <SearchForm onSearch={handleSearch} />
          )}

          {/* Step Progress Indicators */}
          {currentStep !== 'search' && searchParams && (
            <div className="max-w-4xl mx-auto -mt-10 mb-8 bg-white p-4 rounded-lg shadow-md border border-gray-100 relative z-10">
              <div className="flex items-center justify-between">
                <button 
                  onClick={handleReset}
                  className="flex items-center text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  New Search
                </button>
                <div className="flex items-center space-x-1 sm:space-x-4 text-xs sm:text-sm">
                  {/* Step 1 */}
                  <div className="flex items-center">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center font-semibold text-xs border ${
                      currentStep === 'outbound' 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-green-100 text-green-700 border-green-200'
                    }`}>
                      {selectedOutbound ? '✓' : '1'}
                    </span>
                    <span className={`ml-2 font-medium hidden sm:inline ${currentStep === 'outbound' ? 'text-gray-900' : 'text-gray-500'}`}>
                      Outbound Flight
                    </span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300" />

                  {/* Step 2 (Only if round trip) */}
                  {searchParams.type === '1' && (
                    <>
                      <div className="flex items-center">
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center font-semibold text-xs border ${
                          currentStep === 'return' 
                            ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse' 
                            : selectedReturn 
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}>
                          {selectedReturn ? '✓' : '2'}
                        </span>
                        <span className={`ml-2 font-medium hidden sm:inline ${currentStep === 'return' ? 'text-gray-900' : 'text-gray-500'}`}>
                          Return Flight
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </>
                  )}

                  {/* Step 3 */}
                  <div className="flex items-center">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center font-semibold text-xs border ${
                      currentStep === 'review' 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                      {searchParams.type === '1' ? '3' : '2'}
                    </span>
                    <span className={`ml-2 font-medium hidden sm:inline ${currentStep === 'review' ? 'text-gray-900' : 'text-gray-500'}`}>
                      Review & Book
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-4xl mx-auto mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3 flex-1 flex justify-between items-center">
                  <p className="text-sm text-red-700">{error}</p>
                  <button 
                    onClick={handleReset} 
                    className="text-xs font-semibold text-red-700 hover:text-red-900 underline ml-4"
                  >
                    Back to Search
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Flight Selection Steps */}
          {(currentStep === 'outbound' || currentStep === 'return') && (
            <div className="max-w-4xl mx-auto mt-4">
              {/* Context headers */}
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentStep === 'outbound' 
                      ? `Select departing flight to ${searchParams?.arrival_id.toUpperCase()}`
                      : `Select returning flight to ${searchParams?.departure_id.toUpperCase()}`
                    }
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentStep === 'outbound'
                      ? `Outbound • ${searchParams?.departure_id.toUpperCase()} to ${searchParams?.arrival_id.toUpperCase()} • ${searchParams?.outbound_date}`
                      : `Return • ${searchParams?.arrival_id.toUpperCase()} to ${searchParams?.departure_id.toUpperCase()} • ${searchParams?.return_date}`
                    }
                  </p>
                </div>
                {currentStep === 'return' && selectedOutbound && (
                  <button 
                    onClick={handleBackToOutbound}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Change Departure
                  </button>
                )}
              </div>

              {/* Banner summarizing chosen outbound leg during return selection */}
              {currentStep === 'return' && selectedOutbound && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-md text-white">
                      <Plane className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Selected Departure</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedOutbound.flights[0].departure_airport.id} → {selectedOutbound.flights[selectedOutbound.flights.length - 1].arrival_airport.id} • {selectedOutbound.flights[0].airline}
                      </p>
                      <p className="text-xs text-gray-500">
                        Depart: {selectedOutbound.flights[0].departure_airport.time.split(' ')[1]} • Arrive: {selectedOutbound.flights[selectedOutbound.flights.length - 1].arrival_airport.time.split(' ')[1]} • {formatDuration(selectedOutbound.total_duration)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Baseline Price</p>
                      <p className="text-lg font-bold text-indigo-600">${selectedOutbound.price}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Flights listing */}
              <FlightList 
                flights={flights} 
                loading={loading} 
                onSelectFlight={handleSelectFlight} 
                isReturn={currentStep === 'return'}
              />
            </div>
          )}

          {/* Loader when transitioning between flights */}
          {loading && !flights && (
            <div className="max-w-4xl mx-auto py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium text-sm">Fetching flight availability...</p>
            </div>
          )}

          {/* Review and Confirmation Summary Screen */}
          {currentStep === 'review' && selectedOutbound && (
            <div className="max-w-4xl mx-auto mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Ticket className="h-6 w-6 text-indigo-600" />
                Review Your Itinerary
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Tickets Details */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Outbound Ticket Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
                        <Plane className="h-4 w-4 transform rotate-45" />
                        Outbound Flight (Departing)
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-800 font-medium px-2 py-0.5 rounded-full">
                        {searchParams?.outbound_date}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <img 
                            src={selectedOutbound.flights[0].airline_logo} 
                            alt={selectedOutbound.flights[0].airline} 
                            className="h-8 w-8 object-contain mr-3"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{selectedOutbound.flights[0].airline}</p>
                            <p className="text-xs text-gray-500">Flight {selectedOutbound.flights[0].flight_number} • {selectedOutbound.flights[0].airplane}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {selectedOutbound.flights[0].travel_class}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 px-1 bg-slate-50 rounded-lg">
                        <div className="text-center w-1/3">
                          <p className="text-lg font-bold text-gray-900">{selectedOutbound.flights[0].departure_airport.time.split(' ')[1]}</p>
                          <p className="text-sm font-semibold text-gray-700">{selectedOutbound.flights[0].departure_airport.id}</p>
                          <p className="text-xs text-gray-500 truncate px-1">{selectedOutbound.flights[0].departure_airport.name}</p>
                        </div>
                        <div className="flex flex-col items-center w-1/3">
                          <p className="text-xs text-gray-400 font-medium">{formatDuration(selectedOutbound.total_duration)}</p>
                          <div className="w-full flex items-center py-1">
                            <div className="h-[1px] bg-gray-300 w-full"></div>
                            <Plane className="h-3.5 w-3.5 text-indigo-500 mx-1.5 transform rotate-90" />
                            <div className="h-[1px] bg-gray-300 w-full"></div>
                          </div>
                          <p className="text-xs text-indigo-600 font-medium">Direct</p>
                        </div>
                        <div className="text-center w-1/3">
                          <p className="text-lg font-bold text-gray-900">{selectedOutbound.flights[selectedOutbound.flights.length - 1].arrival_airport.time.split(' ')[1]}</p>
                          <p className="text-sm font-semibold text-gray-700">{selectedOutbound.flights[selectedOutbound.flights.length - 1].arrival_airport.id}</p>
                          <p className="text-xs text-gray-500 truncate px-1">{selectedOutbound.flights[selectedOutbound.flights.length - 1].arrival_airport.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return Ticket Card (Only if round trip and selected) */}
                  {searchParams?.type === '1' && selectedReturn && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
                      <div className="bg-purple-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-purple-900 font-semibold text-sm">
                          <Plane className="h-4 w-4 transform -rotate-135" />
                          Return Flight (Returning)
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-800 font-medium px-2 py-0.5 rounded-full">
                          {searchParams?.return_date}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <img 
                              src={selectedReturn.flights[0].airline_logo} 
                              alt={selectedReturn.flights[0].airline} 
                              className="h-8 w-8 object-contain mr-3"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{selectedReturn.flights[0].airline}</p>
                              <p className="text-xs text-gray-500">Flight {selectedReturn.flights[0].flight_number} • {selectedReturn.flights[0].airplane}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {selectedReturn.flights[0].travel_class}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 px-1 bg-slate-50 rounded-lg">
                          <div className="text-center w-1/3">
                            <p className="text-lg font-bold text-gray-900">{selectedReturn.flights[0].departure_airport.time.split(' ')[1]}</p>
                            <p className="text-sm font-semibold text-gray-700">{selectedReturn.flights[0].departure_airport.id}</p>
                            <p className="text-xs text-gray-500 truncate px-1">{selectedReturn.flights[0].departure_airport.name}</p>
                          </div>
                          <div className="flex flex-col items-center w-1/3">
                            <p className="text-xs text-gray-400 font-medium">{formatDuration(selectedReturn.total_duration)}</p>
                            <div className="w-full flex items-center py-1">
                              <div className="h-[1px] bg-gray-300 w-full"></div>
                              <Plane className="h-3.5 w-3.5 text-purple-500 mx-1.5 transform rotate-90" />
                              <div className="h-[1px] bg-gray-300 w-full"></div>
                            </div>
                            <p className="text-xs text-purple-600 font-medium">Direct</p>
                          </div>
                          <div className="text-center w-1/3">
                            <p className="text-lg font-bold text-gray-900">{selectedReturn.flights[selectedReturn.flights.length - 1].arrival_airport.time.split(' ')[1]}</p>
                            <p className="text-sm font-semibold text-gray-700">{selectedReturn.flights[selectedReturn.flights.length - 1].arrival_airport.id}</p>
                            <p className="text-xs text-gray-500 truncate px-1">{selectedReturn.flights[selectedReturn.flights.length - 1].arrival_airport.name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex justify-between items-center pt-2">
                    <button 
                      onClick={searchParams?.type === '1' ? handleBackToReturn : handleBackToOutbound}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center shadow-sm"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Back to Selection
                    </button>
                    <button 
                      onClick={handleReset}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Cancel & Reset
                    </button>
                  </div>
                </div>

                {/* Price Breakdown & Purchase Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Fare Summary</h3>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between font-semibold text-gray-900 border-b border-gray-100 pb-2">
                      <span>Base Fare</span>
                      <span>${selectedOutbound.price + (selectedReturn ? selectedReturn.price : 0)}.00</span>
                    </div>
                    
                    {/* Route Details Breakdown */}
                    <div className="pl-3 space-y-1.5 text-xs text-gray-500 border-b border-gray-100 pb-2.5">
                      <div className="flex justify-between">
                        <span>Departing Flight ({selectedOutbound.flights[0].departure_airport.id} → {selectedOutbound.flights[selectedOutbound.flights.length - 1].arrival_airport.id})</span>
                        <span>${selectedOutbound.price}.00</span>
                      </div>
                      {searchParams?.type === '1' && selectedReturn && (
                        <div className="flex justify-between">
                          <span>Returning Flight ({selectedReturn.flights[0].departure_airport.id} → {selectedReturn.flights[selectedReturn.flights.length - 1].arrival_airport.id})</span>
                          <span>{selectedReturn.price > 0 ? `+$${selectedReturn.price}.00` : 'Included'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-1">
                      <span>Taxes, Fees & Surcharges</span>
                      <span className="font-semibold text-gray-900">$45.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Baggage Allowance</span>
                      <span className="text-green-600 font-semibold">Free Included</span>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                      <span className="font-bold text-gray-900 text-base">Total Cost</span>
                      <div className="text-right">
                        <span className="font-extrabold text-gray-900 text-2xl">
                          ${selectedOutbound.price + (selectedReturn ? selectedReturn.price : 0) + 45}
                        </span>
                        <p className="text-[10px] text-gray-400">All prices in USD</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-800">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold">Price Lock Protected</p>
                      <p className="text-emerald-700/90 mt-0.5">This price is fully locked in and secured for your selection.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsBookingConfirmed(true)}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Confirm & Book Flight
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Boarding Pass Confirmation Modal */}
      {isBookingConfirmed && selectedOutbound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp">
            {/* Top Branding Section */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 px-6 py-8 text-center text-white relative">
              <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1 shadow">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">Ticket Receipt & Boarding Pass</p>
              <h3 className="text-2xl font-extrabold mt-1">Booking Confirmed!</h3>
              <p className="text-xs text-indigo-100/80 mt-1">Thank you for booking with Void Pulsar. Safe travels!</p>
            </div>

            {/* Ticket Cutouts & Barcode */}
            <div className="p-6 bg-slate-50 border-b-2 border-dashed border-gray-200 relative">
              {/* Circular cutouts on sides */}
              <div className="absolute top-1/2 -left-3 h-6 w-6 rounded-full bg-black/60 border border-gray-100 -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-3 h-6 w-6 rounded-full bg-black/60 border border-gray-100 -translate-y-1/2"></div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 font-semibold uppercase">Passenger</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">Arjun Patel</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase">Booking Ref</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">VP-781A9</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase">Outbound Seat</p>
                  <p className="font-bold text-indigo-600 text-sm mt-0.5">14A (Window)</p>
                </div>
                {searchParams?.type === '1' && selectedReturn && (
                  <div>
                    <p className="text-gray-400 font-semibold uppercase">Return Seat</p>
                    <p className="font-bold text-purple-600 text-sm mt-0.5">16C (Aisle)</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 font-semibold uppercase">Class</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedOutbound.flights[0].travel_class}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase">Total Paid</p>
                  <p className="font-bold text-emerald-600 text-sm mt-0.5">
                    ${selectedOutbound.price + (selectedReturn ? selectedReturn.price : 0) + 45}
                  </p>
                </div>
              </div>
            </div>

            {/* Flight Details in Modal */}
            <div className="p-6 bg-white space-y-4">
              {/* Outbound Row */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 p-1.5 rounded text-indigo-600">
                    <Plane className="h-4 w-4 transform rotate-45" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {selectedOutbound.flights[0].departure_airport.id} → {selectedOutbound.flights[selectedOutbound.flights.length - 1].arrival_airport.id}
                    </p>
                    <p className="text-gray-400">{selectedOutbound.flights[0].airline} • {selectedOutbound.flights[0].flight_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{selectedOutbound.flights[0].departure_airport.time.split(' ')[0]}</p>
                  <p className="text-gray-400">{selectedOutbound.flights[0].departure_airport.time.split(' ')[1]}</p>
                </div>
              </div>

              {/* Return Row (Only if round trip) */}
              {searchParams?.type === '1' && selectedReturn && (
                <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-1.5 rounded text-purple-600">
                      <Plane className="h-4 w-4 transform -rotate-135" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {selectedReturn.flights[0].departure_airport.id} → {selectedReturn.flights[selectedReturn.flights.length - 1].arrival_airport.id}
                      </p>
                      <p className="text-gray-400">{selectedReturn.flights[0].airline} • {selectedReturn.flights[0].flight_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{selectedReturn.flights[0].departure_airport.time.split(' ')[0]}</p>
                    <p className="text-gray-400">{selectedReturn.flights[0].departure_airport.time.split(' ')[1]}</p>
                  </div>
                </div>
              )}

              {/* Visual Barcode */}
              <div className="pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
                <div className="h-10 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_6px,#000_6px,#000_8px,transparent_8px,transparent_12px)] w-4/5 rounded shadow-sm opacity-80"></div>
                <span className="text-[10px] font-mono tracking-widest text-gray-400">VP-BARCODE-TICKET-2026</span>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="bg-slate-50 px-6 py-4 flex gap-4">
              <button 
                onClick={handleReset}
                className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Start New Search
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;
