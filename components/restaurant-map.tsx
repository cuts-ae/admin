"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader, AlertCircle } from "@/components/icons";

interface Restaurant {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  operating_status?: string;
  orders_today?: number;
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
}

declare global {
  interface Window {
    mapkit: any;
  }
}

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPKIT_TOKEN;
    console.log("MapKit token present:", !!token, "Length:", token?.length);

    if (!token) {
      setError("MapKit token not configured. Please add NEXT_PUBLIC_MAPKIT_TOKEN to .env.local");
      return;
    }

    if (!mapRef.current) {
      // Map ref not ready yet
      return;
    }

    // Check if MapKit is already loaded
    if (window.mapkit) {
      initializeMap();
      return;
    }

    // Load MapKit JS script with map library
    const script = document.createElement("script");
    script.src = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js";
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => {
      initializeMap();
    };

    script.onerror = () => {
      setError("Failed to load Apple MapKit JS library");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          console.error("Error destroying map:", e);
        }
      }
    };
  }, [restaurants]);

  const initializeMap = () => {
    const token = process.env.NEXT_PUBLIC_MAPKIT_TOKEN;

    if (!token) {
      setError("MapKit token not found");
      return;
    }

    if (!window.mapkit) {
      setError("MapKit library not loaded");
      return;
    }

    try {
      const createMap = () => {
        if (!mapRef.current) {
          setError("Map container not found");
          return;
        }

        try {
          // Abu Dhabi wider view to include Yas Island
          const center = new window.mapkit.Coordinate(24.45, 54.5);

          // Create map with wider span to show all Abu Dhabi including Yas Island
          const map = new window.mapkit.Map(mapRef.current, {
            center: center,
            region: new window.mapkit.CoordinateRegion(
              center,
              new window.mapkit.CoordinateSpan(0.25, 0.35)
            ),
            colorScheme: window.mapkit.Map.ColorSchemes.Light,
            showsMapTypeControl: false,
            showsZoomControl: true,
            showsUserLocationControl: false,
            showsCompass: window.mapkit.FeatureVisibility.Hidden,
          });

          mapInstanceRef.current = map;

          // Add restaurant markers
          const annotations: any[] = [];
          restaurants.forEach((restaurant) => {
            if (!restaurant.latitude || !restaurant.longitude) return;

            const coordinate = new window.mapkit.Coordinate(
              restaurant.latitude,
              restaurant.longitude
            );

            const isActive = restaurant.status === "active" || restaurant.status === "open" || restaurant.operating_status === "open";

            // Create annotation - all markers red
            const annotation = new window.mapkit.MarkerAnnotation(coordinate, {
              color: "#ef4444",
              glyphColor: "#ffffff",
              title: restaurant.name,
              subtitle: `${isActive ? "Open" : "Closed"}${
                restaurant.orders_today !== undefined
                  ? ` - ${restaurant.orders_today} orders today`
                  : ""
              }`,
            });

            annotations.push(annotation);
          });

          if (annotations.length > 0) {
            map.showItems(annotations, { padding: new window.mapkit.Padding(40, 40, 40, 40) });
          }
          setMapLoaded(true);
        } catch (mapErr) {
          console.error("Map creation error:", mapErr);
          setError(`Failed to create map: ${mapErr instanceof Error ? mapErr.message : 'Unknown error'}`);
        }
      };

      // Listen for initialization errors before calling init
      window.mapkit.addEventListener("error", (event: any) => {
        console.error("MapKit error event:", event);
        setError(`MapKit error: ${event.message || event.status || 'Unknown error'}`);
      });

      // Check if already initialized
      if (window.mapkit.services && window.mapkit.services.authorizationCallback) {
        // Already initialized, just create the map
        requestAnimationFrame(() => {
          setTimeout(createMap, 100);
        });
        return;
      }

      // Initialize MapKit with callback
      window.mapkit.init({
        authorizationCallback: (done: any) => {
          console.log("MapKit auth callback triggered, providing token of length:", token.length);
          done(token);
        },
        language: "en",
      });

      // Wait for initialization to complete before creating map
      requestAnimationFrame(() => {
        setTimeout(createMap, 300);
      });
    } catch (err) {
      console.error("MapKit initialization error:", err);
      setError(`Failed to initialize Apple Maps: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (error) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-red-50 to-orange-50 rounded-lg overflow-hidden border border-red-200 flex items-center justify-center">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-700 mb-1">Apple Maps Unavailable</p>
          <p className="text-xs text-red-600 max-w-md mb-2">{error}</p>
          <p className="text-xs text-gray-600 mt-3">
            Get your MapKit JS token from{" "}
            <a
              href="https://developer.apple.com/maps/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Apple Developer
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border/40">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading Apple Maps...</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
