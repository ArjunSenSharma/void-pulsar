import React, { useState } from 'react';
import { Search, Calendar, MapPin } from 'lucide-react';

const SearchForm = ({ onSearch }) => {
    const [formData, setFormData] = useState({
        departure_id: '',
        arrival_id: '',
        outbound_date: '',
        return_date: '',
        type: '2', // Default to One Way
        travel_class: '1' // Default to Economy
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (value) => {
        setFormData({ ...formData, type: value, return_date: value === '2' ? '' : formData.return_date });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(formData);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto -mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-3 border-b border-gray-100">
                <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="tripType"
                            value="2"
                            checked={formData.type === '2'}
                            onChange={() => handleTypeChange('2')}
                            className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">One Way</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="tripType"
                            value="1"
                            checked={formData.type === '1'}
                            onChange={() => handleTypeChange('1')}
                            className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Round Trip</span>
                    </label>
                </div>
                
                {/* Cabin Class Dropdown */}
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">Cabin Class:</label>
                    <select
                        name="travel_class"
                        value={formData.travel_class || '1'}
                        onChange={handleChange}
                        className="text-sm font-semibold text-gray-700 bg-slate-50 border border-gray-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-sm hover:bg-slate-100 transition-colors w-full sm:w-48"
                    >
                        <option value="1">Economy</option>
                        <option value="2">Premium Economy</option>
                        <option value="3">Business</option>
                        <option value="4">First Class</option>
                    </select>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">From</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="departure_id"
                            placeholder="Origin (e.g. SFO)"
                            value={formData.departure_id}
                            onChange={handleChange}
                            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">To</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="arrival_id"
                            placeholder="Destination (e.g. JFK)"
                            value={formData.arrival_id}
                            onChange={handleChange}
                            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Depart</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            name="outbound_date"
                            value={formData.outbound_date}
                            onChange={handleChange}
                            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                </div>

                {formData.type === '1' ? (
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Return</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                name="return_date"
                                value={formData.return_date}
                                onChange={handleChange}
                                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:block"></div>
                )}

                <button
                    type="submit"
                    className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 flex items-center justify-center font-medium h-[42px]"
                >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                </button>
            </form>
        </div>
    );
};

export default SearchForm;
