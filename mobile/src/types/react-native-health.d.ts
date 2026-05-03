// Type declaration for react-native-health to handle default export pattern
declare module 'react-native-health' {
  interface HealthKitMethods {
    initHealthKit: (options: any, callback: (error: string, result: any) => void) => void;
    getDailyStepCountSamples: (options: any, callback: (error: string, result: any) => void) => void;
    getDistanceWalkingRunning: (options: any, callback: (error: string, result: any) => void) => void;
    getActiveEnergyBurned: (options: any, callback: (error: string, result: any) => void) => void;
    getRestingHeartRateSamples: (options: any, callback: (error: string, result: any) => void) => void;
    getHeartRateSamples: (options: any, callback: (error: string, result: any) => void) => void;
    getLeanBodyMassSamples: (options: any, callback: (error: string, result: any) => void) => void;
    Constants: {
      Permissions: {
        Steps: string;
        DistanceWalkingRunning: string;
        ActiveEnergyBurned: string;
        HeartRate: string;
        RestingHeartRate: string;
        BodyMass: string;
        Workout: string;
      };
    };
  }

  const Health: HealthKitMethods & {
    default?: HealthKitMethods;
  };

  export default Health;
  export = Health;
}
