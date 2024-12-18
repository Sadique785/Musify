export const calculatePositionForDuration = (duration) => {
    // Assuming a standard conversion rate, e.g., 1 second = X pixels
    // You might need to adjust this based on your specific UI scaling
    const PIXELS_PER_SECOND = 10; // Adjust this value as needed
    return duration * PIXELS_PER_SECOND;
  };