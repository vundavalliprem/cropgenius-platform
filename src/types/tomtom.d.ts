export interface TomTomRoute {
  summary: {
    lengthInMeters: number;
    travelTimeInSeconds: number;
    trafficDelayInSeconds: number;
    departureTime: string;
    arrivalTime: string;
  };
  legs: Array<{
    points: Array<{
      latitude: number;
      longitude: number;
    }>;
  }>;
}