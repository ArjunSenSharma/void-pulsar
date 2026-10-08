import React from 'react';
import { Plane } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Plane className="h-8 w-8 text-indigo-600" />
                        <span className="ml-2 text-xl font-bold text-gray-900">SkyScanner Clone</span>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        <a href="#" className="text-gray-500 hover:text-gray-900">Flights</a>
                        <a href="#" className="text-gray-500 hover:text-gray-900">Hotels</a>
                        <a href="#" className="text-gray-500 hover:text-gray-900">Car Hire</a>
                    </nav>
                    <div className="flex items-center">
                        <button className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Log in</button>
                        <button className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Sign up</button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
