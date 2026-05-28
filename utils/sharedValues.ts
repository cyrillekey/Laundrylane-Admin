const sharedValues = {
  token_key: "laundry_lane_token",
  user_key: "laundry_lane_user",
  enryptionKey: process.env.NEXT_PUBLIC_ENCRYPTION_KEY,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://laundry-lane-server.onrender.com",
};

export default sharedValues;
