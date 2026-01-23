// import React from 'react'

// const BusTracking = () => {
//   return (
//     <div className="antialiased p-10 w-full h-full min-h-screen bg-gray-200 dark:bg-gray-700 md:ml-64 pt-20">
//         BusTracking
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//         <h1>saskjaksjksjk</h1>
//     </div>
//   )
// }

// export default BusTracking

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Bus, Navigation } from "lucide-react";

import { Badge } from "../../../components/ui/badge";

function LiveTracking() {
  const buses = [
    {
      id: 1,
      name: "Bus #7",
      route: "Route A",
      driver: "John Smith",
      speed: "45 km/h",
      eta: "5 mins",
      lat: 40,
      lng: -74,
    },
    {
      id: 2,
      name: "Bus #3",
      route: "Route B",
      driver: "Sarah Johnson",
      speed: "38 km/h",
      eta: "12 mins",
      lat: 42,
      lng: -76,
    },
    {
      id: 3,
      name: "Bus #12",
      route: "Route C",
      driver: "Mike Davis",
      speed: "0 km/h",
      eta: "Stopped",
      lat: 38,
      lng: -72,
    },
  ];

  return (
    <div className="antialiased w-full min-h-screen bg-gray-50 dark:bg-gray-800 md:ml-64 pt-16 md:pt-20 px-4 mt-4 md:px-6 lg:px-8">
      <div className="mb-3">
        <h1 className="text-xl md:text-xl font-bold text-gray-700 dark:text-white ">
          Live Bus Tracking
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Real-time location and status of all buses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Map Section */}
        {/* <div className="lg:col-span-2"> */}
        <div className="lg:col-span-2">
          <Card className="shadow-md p-0 border-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 w-full h-[250px] md:h-[380px] lg:h-[420px] relative overflow-hidden">
                {/* Mock map grid */}
                <div className="absolute inset-0 opacity-10 dark:opacity-20">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Bus markers */}
                {buses.map((bus, idx) => (
                  <div
                    key={bus.id}
                    className="absolute bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg
                     shadow-lg flex items-center gap-2 animate-pulse cursor-pointer transition-colors text-xs md:text-sm"
                    style={{
                      top: `${20 + idx * 30}%`,
                      left: `${30 + idx * 20}%`,
                    }}
                  >
                    <Bus className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{bus.name}</p>
                      <p className="opacity-80">{bus.speed}</p>
                    </div>
                  </div>
                ))}

                {/* Route lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M 100 150 Q 200 200 300 180 T 500 200"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                  <path
                    d="M 150 300 Q 250 280 350 320 T 550 300"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 ">
          <Card className="shadow-md border-0 dark:bg-gray-900/70">
            <CardHeader className="pb-1">
              <CardTitle className="text-gray-700 dark:text-gray-200 ">Active Buses</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {buses.length} buses on route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                {buses.map((bus) => (
                  <div
                    key={bus.id}
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border
                     border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
                      transition-colors text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-700 dark:text-white text-sm">
                        {bus.name}
                      </p>
                      <Badge
                        className={
                          bus.speed === "0 km/h"
                            ? "bg-red-500 hover:bg-red-600 text-white text-xs"
                            : "bg-green-500 hover:bg-green-600 text-white text-xs"
                        }
                      >
                        {bus.speed === "0 km/h" ? "Stopped" : "Moving"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {bus.route}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Driver: {bus.driver}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {bus.speed} • ETA: {bus.eta}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LiveTracking;
