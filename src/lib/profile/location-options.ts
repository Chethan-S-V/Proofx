export type ProfileLocationOption = {
  countryCode: string;
  countryName: string;
  districts: string[];
  states: string[];
};

export const PROFILE_LOCATION_OPTIONS: ProfileLocationOption[] = [
  {
    countryCode: "+91",
    countryName: "India",
    districts: ["Bengaluru Urban", "Mysuru", "Pune", "Mumbai City", "Hyderabad", "Chennai", "Kolkata", "New Delhi"],
    states: ["Karnataka", "Maharashtra", "Telangana", "Tamil Nadu", "West Bengal", "Delhi"],
  },
  {
    countryCode: "+49",
    countryName: "Germany",
    districts: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Dusseldorf"],
    states: ["Berlin", "Bavaria", "Hamburg", "Hesse", "North Rhine-Westphalia", "Baden-Wurttemberg"],
  },
  {
    countryCode: "+1",
    countryName: "United States",
    districts: ["San Francisco", "New York", "Austin", "Seattle", "Boston", "Los Angeles", "Chicago"],
    states: ["California", "New York", "Texas", "Washington", "Massachusetts", "Illinois"],
  },
  {
    countryCode: "+44",
    countryName: "United Kingdom",
    districts: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Edinburgh"],
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
  },
];

export function getLocationOptionForPhone(phoneNumber: string) {
  return PROFILE_LOCATION_OPTIONS.find((option) => phoneNumber.trim().startsWith(option.countryCode)) ?? null;
}
