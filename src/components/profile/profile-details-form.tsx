"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { DashboardProfile } from "../../lib/profile/service";
import { Button } from "../ui/button";

type CountryOption = {
  code: string;
  name: string;
  phoneCode: string;
  phoneDigits: number;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "AF", name: "Afghanistan", phoneCode: "+93", phoneDigits: 9 },
  { code: "AL", name: "Albania", phoneCode: "+355", phoneDigits: 9 },
  { code: "DZ", name: "Algeria", phoneCode: "+213", phoneDigits: 9 },
  { code: "AR", name: "Argentina", phoneCode: "+54", phoneDigits: 10 },
  { code: "AM", name: "Armenia", phoneCode: "+374", phoneDigits: 8 },
  { code: "AT", name: "Austria", phoneCode: "+43", phoneDigits: 10 },
  { code: "AZ", name: "Azerbaijan", phoneCode: "+994", phoneDigits: 9 },
  { code: "BH", name: "Bahrain", phoneCode: "+973", phoneDigits: 8 },
  { code: "IN", name: "India", phoneCode: "+91", phoneDigits: 10 },
  { code: "US", name: "United States", phoneCode: "+1", phoneDigits: 10 },
  { code: "GB", name: "United Kingdom", phoneCode: "+44", phoneDigits: 10 },
  { code: "AE", name: "United Arab Emirates", phoneCode: "+971", phoneDigits: 9 },
  { code: "AU", name: "Australia", phoneCode: "+61", phoneDigits: 9 },
  { code: "BD", name: "Bangladesh", phoneCode: "+880", phoneDigits: 10 },
  { code: "BE", name: "Belgium", phoneCode: "+32", phoneDigits: 9 },
  { code: "BT", name: "Bhutan", phoneCode: "+975", phoneDigits: 8 },
  { code: "BO", name: "Bolivia", phoneCode: "+591", phoneDigits: 8 },
  { code: "BA", name: "Bosnia and Herzegovina", phoneCode: "+387", phoneDigits: 8 },
  { code: "BW", name: "Botswana", phoneCode: "+267", phoneDigits: 8 },
  { code: "BR", name: "Brazil", phoneCode: "+55", phoneDigits: 11 },
  { code: "BG", name: "Bulgaria", phoneCode: "+359", phoneDigits: 9 },
  { code: "KH", name: "Cambodia", phoneCode: "+855", phoneDigits: 9 },
  { code: "CM", name: "Cameroon", phoneCode: "+237", phoneDigits: 9 },
  { code: "CA", name: "Canada", phoneCode: "+1", phoneDigits: 10 },
  { code: "CL", name: "Chile", phoneCode: "+56", phoneDigits: 9 },
  { code: "CN", name: "China", phoneCode: "+86", phoneDigits: 11 },
  { code: "CO", name: "Colombia", phoneCode: "+57", phoneDigits: 10 },
  { code: "CR", name: "Costa Rica", phoneCode: "+506", phoneDigits: 8 },
  { code: "HR", name: "Croatia", phoneCode: "+385", phoneDigits: 9 },
  { code: "CY", name: "Cyprus", phoneCode: "+357", phoneDigits: 8 },
  { code: "CZ", name: "Czechia", phoneCode: "+420", phoneDigits: 9 },
  { code: "DK", name: "Denmark", phoneCode: "+45", phoneDigits: 8 },
  { code: "DO", name: "Dominican Republic", phoneCode: "+1", phoneDigits: 10 },
  { code: "EC", name: "Ecuador", phoneCode: "+593", phoneDigits: 9 },
  { code: "EG", name: "Egypt", phoneCode: "+20", phoneDigits: 10 },
  { code: "EE", name: "Estonia", phoneCode: "+372", phoneDigits: 8 },
  { code: "ET", name: "Ethiopia", phoneCode: "+251", phoneDigits: 9 },
  { code: "FI", name: "Finland", phoneCode: "+358", phoneDigits: 10 },
  { code: "DE", name: "Germany", phoneCode: "+49", phoneDigits: 11 },
  { code: "ES", name: "Spain", phoneCode: "+34", phoneDigits: 9 },
  { code: "FR", name: "France", phoneCode: "+33", phoneDigits: 9 },
  { code: "GE", name: "Georgia", phoneCode: "+995", phoneDigits: 9 },
  { code: "GH", name: "Ghana", phoneCode: "+233", phoneDigits: 9 },
  { code: "GR", name: "Greece", phoneCode: "+30", phoneDigits: 10 },
  { code: "GT", name: "Guatemala", phoneCode: "+502", phoneDigits: 8 },
  { code: "HK", name: "Hong Kong", phoneCode: "+852", phoneDigits: 8 },
  { code: "HU", name: "Hungary", phoneCode: "+36", phoneDigits: 9 },
  { code: "IS", name: "Iceland", phoneCode: "+354", phoneDigits: 7 },
  { code: "ID", name: "Indonesia", phoneCode: "+62", phoneDigits: 11 },
  { code: "IE", name: "Ireland", phoneCode: "+353", phoneDigits: 9 },
  { code: "IL", name: "Israel", phoneCode: "+972", phoneDigits: 9 },
  { code: "IT", name: "Italy", phoneCode: "+39", phoneDigits: 10 },
  { code: "JP", name: "Japan", phoneCode: "+81", phoneDigits: 10 },
  { code: "JO", name: "Jordan", phoneCode: "+962", phoneDigits: 9 },
  { code: "KZ", name: "Kazakhstan", phoneCode: "+7", phoneDigits: 10 },
  { code: "KE", name: "Kenya", phoneCode: "+254", phoneDigits: 9 },
  { code: "KR", name: "South Korea", phoneCode: "+82", phoneDigits: 10 },
  { code: "KW", name: "Kuwait", phoneCode: "+965", phoneDigits: 8 },
  { code: "LA", name: "Laos", phoneCode: "+856", phoneDigits: 10 },
  { code: "LV", name: "Latvia", phoneCode: "+371", phoneDigits: 8 },
  { code: "LB", name: "Lebanon", phoneCode: "+961", phoneDigits: 8 },
  { code: "LT", name: "Lithuania", phoneCode: "+370", phoneDigits: 8 },
  { code: "LU", name: "Luxembourg", phoneCode: "+352", phoneDigits: 9 },
  { code: "LK", name: "Sri Lanka", phoneCode: "+94", phoneDigits: 9 },
  { code: "MY", name: "Malaysia", phoneCode: "+60", phoneDigits: 9 },
  { code: "MV", name: "Maldives", phoneCode: "+960", phoneDigits: 7 },
  { code: "MT", name: "Malta", phoneCode: "+356", phoneDigits: 8 },
  { code: "MX", name: "Mexico", phoneCode: "+52", phoneDigits: 10 },
  { code: "MA", name: "Morocco", phoneCode: "+212", phoneDigits: 9 },
  { code: "MM", name: "Myanmar", phoneCode: "+95", phoneDigits: 9 },
  { code: "NP", name: "Nepal", phoneCode: "+977", phoneDigits: 10 },
  { code: "NL", name: "Netherlands", phoneCode: "+31", phoneDigits: 9 },
  { code: "NZ", name: "New Zealand", phoneCode: "+64", phoneDigits: 9 },
  { code: "NG", name: "Nigeria", phoneCode: "+234", phoneDigits: 10 },
  { code: "NO", name: "Norway", phoneCode: "+47", phoneDigits: 8 },
  { code: "OM", name: "Oman", phoneCode: "+968", phoneDigits: 8 },
  { code: "PK", name: "Pakistan", phoneCode: "+92", phoneDigits: 10 },
  { code: "PA", name: "Panama", phoneCode: "+507", phoneDigits: 8 },
  { code: "PE", name: "Peru", phoneCode: "+51", phoneDigits: 9 },
  { code: "PH", name: "Philippines", phoneCode: "+63", phoneDigits: 10 },
  { code: "PL", name: "Poland", phoneCode: "+48", phoneDigits: 9 },
  { code: "PT", name: "Portugal", phoneCode: "+351", phoneDigits: 9 },
  { code: "QA", name: "Qatar", phoneCode: "+974", phoneDigits: 8 },
  { code: "RO", name: "Romania", phoneCode: "+40", phoneDigits: 9 },
  { code: "RU", name: "Russia", phoneCode: "+7", phoneDigits: 10 },
  { code: "SA", name: "Saudi Arabia", phoneCode: "+966", phoneDigits: 9 },
  { code: "RS", name: "Serbia", phoneCode: "+381", phoneDigits: 9 },
  { code: "SG", name: "Singapore", phoneCode: "+65", phoneDigits: 8 },
  { code: "SK", name: "Slovakia", phoneCode: "+421", phoneDigits: 9 },
  { code: "SI", name: "Slovenia", phoneCode: "+386", phoneDigits: 8 },
  { code: "TH", name: "Thailand", phoneCode: "+66", phoneDigits: 9 },
  { code: "SE", name: "Sweden", phoneCode: "+46", phoneDigits: 9 },
  { code: "CH", name: "Switzerland", phoneCode: "+41", phoneDigits: 9 },
  { code: "TW", name: "Taiwan", phoneCode: "+886", phoneDigits: 9 },
  { code: "TZ", name: "Tanzania", phoneCode: "+255", phoneDigits: 9 },
  { code: "TR", name: "Turkey", phoneCode: "+90", phoneDigits: 10 },
  { code: "UG", name: "Uganda", phoneCode: "+256", phoneDigits: 9 },
  { code: "UA", name: "Ukraine", phoneCode: "+380", phoneDigits: 9 },
  { code: "UY", name: "Uruguay", phoneCode: "+598", phoneDigits: 8 },
  { code: "UZ", name: "Uzbekistan", phoneCode: "+998", phoneDigits: 9 },
  { code: "VE", name: "Venezuela", phoneCode: "+58", phoneDigits: 10 },
  { code: "VN", name: "Vietnam", phoneCode: "+84", phoneDigits: 9 },
  { code: "ZA", name: "South Africa", phoneCode: "+27", phoneDigits: 9 },
  { code: "ZW", name: "Zimbabwe", phoneCode: "+263", phoneDigits: 9 },
].sort((first, second) => first.name.localeCompare(second.name));
export const DEFAULT_COUNTRY = COUNTRY_OPTIONS.find((country) => country.code === "IN") ?? COUNTRY_OPTIONS[0];

type LocationOption = {
  countryCode: string;
  countryName?: string;
  district: string;
  label?: string;
  pincode: string;
  state: string;
  value?: string;
};

const FALLBACK_LOCATION_OPTIONS: LocationOption[] = [
  { countryCode: "IN", district: "Bengaluru Urban", pincode: "560001", state: "Karnataka" },
  { countryCode: "IN", district: "Mysuru", pincode: "570001", state: "Karnataka" },
  { countryCode: "IN", district: "Mangaluru", pincode: "575001", state: "Karnataka" },
  { countryCode: "IN", district: "Mumbai City", pincode: "400001", state: "Maharashtra" },
  { countryCode: "IN", district: "Pune", pincode: "411001", state: "Maharashtra" },
  { countryCode: "IN", district: "Nagpur", pincode: "440001", state: "Maharashtra" },
  { countryCode: "IN", district: "Central Delhi", pincode: "110001", state: "Delhi" },
  { countryCode: "IN", district: "Hyderabad", pincode: "500001", state: "Telangana" },
  { countryCode: "IN", district: "Rangareddy", pincode: "500032", state: "Telangana" },
  { countryCode: "IN", district: "Chennai", pincode: "600001", state: "Tamil Nadu" },
  { countryCode: "IN", district: "Coimbatore", pincode: "641001", state: "Tamil Nadu" },
  { countryCode: "IN", district: "Kolkata", pincode: "700001", state: "West Bengal" },
  { countryCode: "IN", district: "Ahmedabad", pincode: "380001", state: "Gujarat" },
  { countryCode: "IN", district: "Surat", pincode: "395003", state: "Gujarat" },
  { countryCode: "IN", district: "Jaipur", pincode: "302001", state: "Rajasthan" },
  { countryCode: "IN", district: "Lucknow", pincode: "226001", state: "Uttar Pradesh" },
  { countryCode: "IN", district: "Gautam Buddha Nagar", pincode: "201301", state: "Uttar Pradesh" },
  { countryCode: "IN", district: "Gurugram", pincode: "122001", state: "Haryana" },
  { countryCode: "IN", district: "Ernakulam", pincode: "682001", state: "Kerala" },
  { countryCode: "IN", district: "Thiruvananthapuram", pincode: "695001", state: "Kerala" },
  { countryCode: "IN", district: "Patna", pincode: "800001", state: "Bihar" },
  { countryCode: "IN", district: "Bhopal", pincode: "462001", state: "Madhya Pradesh" },
  { countryCode: "IN", district: "Indore", pincode: "452001", state: "Madhya Pradesh" },
  { countryCode: "IN", district: "Bhubaneswar", pincode: "751001", state: "Odisha" },
  { countryCode: "IN", district: "Guwahati", pincode: "781001", state: "Assam" },
  { countryCode: "IN", district: "Ranchi", pincode: "834001", state: "Jharkhand" },
  { countryCode: "IN", district: "Raipur", pincode: "492001", state: "Chhattisgarh" },
  { countryCode: "IN", district: "Dehradun", pincode: "248001", state: "Uttarakhand" },
  { countryCode: "IN", district: "Shimla", pincode: "171001", state: "Himachal Pradesh" },
  { countryCode: "IN", district: "Srinagar", pincode: "190001", state: "Jammu and Kashmir" },
  { countryCode: "IN", district: "Panaji", pincode: "403001", state: "Goa" },
  { countryCode: "IN", district: "Vishakhapatnam", pincode: "530001", state: "Andhra Pradesh" },
  { countryCode: "US", district: "New York County", pincode: "10001", state: "New York" },
  { countryCode: "US", district: "Los Angeles County", pincode: "90001", state: "California" },
  { countryCode: "US", district: "Cook County", pincode: "60601", state: "Illinois" },
  { countryCode: "GB", district: "Greater London", pincode: "SW1A 1AA", state: "England" },
  { countryCode: "GB", district: "Manchester", pincode: "M1 1AE", state: "England" },
  { countryCode: "AE", district: "Dubai", pincode: "00000", state: "Dubai" },
  { countryCode: "AE", district: "Abu Dhabi", pincode: "00000", state: "Abu Dhabi" },
  { countryCode: "DE", district: "Mitte", pincode: "10115", state: "Berlin" },
  { countryCode: "FR", district: "Paris", pincode: "75001", state: "Ile-de-France" },
  { countryCode: "ES", district: "Madrid", pincode: "28001", state: "Community of Madrid" },
  { countryCode: "IT", district: "Rome", pincode: "00100", state: "Lazio" },
  { countryCode: "CA", district: "Toronto", pincode: "M5H", state: "Ontario" },
  { countryCode: "AU", district: "Sydney", pincode: "2000", state: "New South Wales" },
  { countryCode: "NZ", district: "Auckland", pincode: "1010", state: "Auckland" },
  { countryCode: "SG", district: "Downtown Core", pincode: "018956", state: "Singapore" },
  { countryCode: "MY", district: "Kuala Lumpur", pincode: "50000", state: "Federal Territory" },
  { countryCode: "JP", district: "Chiyoda", pincode: "100-0001", state: "Tokyo" },
  { countryCode: "KR", district: "Jung-gu", pincode: "04524", state: "Seoul" },
  { countryCode: "CN", district: "Dongcheng", pincode: "100010", state: "Beijing" },
  { countryCode: "HK", district: "Central and Western", pincode: "999077", state: "Hong Kong" },
  { countryCode: "ID", district: "Central Jakarta", pincode: "10110", state: "Jakarta" },
  { countryCode: "TH", district: "Pathum Wan", pincode: "10330", state: "Bangkok" },
  { countryCode: "PH", district: "Manila", pincode: "1000", state: "Metro Manila" },
  { countryCode: "VN", district: "District 1", pincode: "700000", state: "Ho Chi Minh City" },
  { countryCode: "BD", district: "Dhaka", pincode: "1000", state: "Dhaka Division" },
  { countryCode: "PK", district: "Karachi Central", pincode: "74000", state: "Sindh" },
  { countryCode: "NP", district: "Kathmandu", pincode: "44600", state: "Bagmati" },
  { countryCode: "LK", district: "Colombo", pincode: "00100", state: "Western Province" },
  { countryCode: "ZA", district: "Cape Town", pincode: "8001", state: "Western Cape" },
  { countryCode: "NG", district: "Lagos Island", pincode: "100001", state: "Lagos" },
  { countryCode: "KE", district: "Nairobi", pincode: "00100", state: "Nairobi County" },
  { countryCode: "EG", district: "Cairo", pincode: "11511", state: "Cairo Governorate" },
  { countryCode: "BR", district: "Sao Paulo", pincode: "01000-000", state: "Sao Paulo" },
  { countryCode: "MX", district: "Cuauhtemoc", pincode: "06000", state: "Mexico City" },
  { countryCode: "AR", district: "Comuna 1", pincode: "C1001", state: "Buenos Aires" },
  { countryCode: "CO", district: "Bogota", pincode: "110111", state: "Capital District" },
  { countryCode: "CL", district: "Santiago", pincode: "8320000", state: "Metropolitan Region" },
  { countryCode: "PE", district: "Lima", pincode: "15001", state: "Lima" },
  { countryCode: "RU", district: "Tverskoy", pincode: "125009", state: "Moscow" },
  { countryCode: "SA", district: "Riyadh", pincode: "12211", state: "Riyadh Province" },
  { countryCode: "QA", district: "Doha", pincode: "00000", state: "Doha" },
  { countryCode: "KW", district: "Kuwait City", pincode: "13001", state: "Capital Governorate" },
  { countryCode: "OM", district: "Muscat", pincode: "100", state: "Muscat Governorate" },
  { countryCode: "BH", district: "Manama", pincode: "301", state: "Capital Governorate" },
  { countryCode: "TR", district: "Fatih", pincode: "34093", state: "Istanbul" },
  { countryCode: "NL", district: "Amsterdam", pincode: "1012", state: "North Holland" },
  { countryCode: "BE", district: "Brussels", pincode: "1000", state: "Brussels-Capital" },
  { countryCode: "CH", district: "Zurich", pincode: "8001", state: "Zurich" },
  { countryCode: "SE", district: "Stockholm", pincode: "111 20", state: "Stockholm County" },
  { countryCode: "NO", district: "Oslo", pincode: "0150", state: "Oslo" },
  { countryCode: "DK", district: "Copenhagen", pincode: "1050", state: "Capital Region" },
  { countryCode: "FI", district: "Helsinki", pincode: "00100", state: "Uusimaa" },
  { countryCode: "PL", district: "Warsaw", pincode: "00-001", state: "Masovian" },
  { countryCode: "PT", district: "Lisbon", pincode: "1100-001", state: "Lisbon" },
  { countryCode: "IE", district: "Dublin", pincode: "D01", state: "Leinster" },
  { countryCode: "AT", district: "Innere Stadt", pincode: "1010", state: "Vienna" },
  { countryCode: "CZ", district: "Prague 1", pincode: "110 00", state: "Prague" },
  { countryCode: "GR", district: "Athens", pincode: "105 57", state: "Attica" },
  { countryCode: "RO", district: "Sector 1", pincode: "010011", state: "Bucharest" },
  { countryCode: "UA", district: "Shevchenkivskyi", pincode: "01001", state: "Kyiv" },
  { countryCode: "IL", district: "Tel Aviv", pincode: "61000", state: "Tel Aviv District" },
  { countryCode: "JO", district: "Amman", pincode: "11118", state: "Amman Governorate" },
  { countryCode: "KZ", district: "Astana", pincode: "010000", state: "Akmola Region" },
  { countryCode: "MA", district: "Casablanca", pincode: "20000", state: "Casablanca-Settat" },
  { countryCode: "MT", district: "Valletta", pincode: "VLT 1110", state: "South Eastern Region" },
  { countryCode: "GH", district: "Accra Metropolitan", pincode: "GA-183", state: "Greater Accra" },
  { countryCode: "ET", district: "Addis Ababa", pincode: "1000", state: "Addis Ababa" },
  { countryCode: "TZ", district: "Ilala", pincode: "11101", state: "Dar es Salaam" },
  { countryCode: "UG", district: "Kampala", pincode: "102", state: "Central Region" },
  { countryCode: "ZW", district: "Harare", pincode: "00000", state: "Harare Province" },
  { countryCode: "AF", district: "Kabul", pincode: "1001", state: "Kabul" },
  { countryCode: "AL", district: "Tirana", pincode: "1001", state: "Tirana County" },
  { countryCode: "DZ", district: "Algiers", pincode: "16000", state: "Algiers Province" },
  { countryCode: "AM", district: "Yerevan", pincode: "0010", state: "Yerevan" },
  { countryCode: "AZ", district: "Baku", pincode: "AZ1000", state: "Baku" },
  { countryCode: "BT", district: "Thimphu", pincode: "11001", state: "Thimphu District" },
  { countryCode: "BO", district: "La Paz", pincode: "0201", state: "La Paz Department" },
  { countryCode: "BA", district: "Sarajevo", pincode: "71000", state: "Sarajevo Canton" },
  { countryCode: "BW", district: "Gaborone", pincode: "00000", state: "South-East District" },
  { countryCode: "BG", district: "Sofia", pincode: "1000", state: "Sofia City Province" },
  { countryCode: "KH", district: "Phnom Penh", pincode: "12000", state: "Phnom Penh" },
  { countryCode: "CM", district: "Yaounde", pincode: "00000", state: "Centre Region" },
  { countryCode: "CR", district: "San Jose", pincode: "10101", state: "San Jose Province" },
  { countryCode: "HR", district: "Zagreb", pincode: "10000", state: "City of Zagreb" },
  { countryCode: "CY", district: "Nicosia", pincode: "1010", state: "Nicosia District" },
  { countryCode: "DO", district: "Santo Domingo", pincode: "10210", state: "Distrito Nacional" },
  { countryCode: "EC", district: "Quito", pincode: "170401", state: "Pichincha" },
  { countryCode: "EE", district: "Tallinn", pincode: "10111", state: "Harju County" },
  { countryCode: "GE", district: "Tbilisi", pincode: "0105", state: "Tbilisi" },
  { countryCode: "GT", district: "Guatemala City", pincode: "01001", state: "Guatemala Department" },
  { countryCode: "HU", district: "Budapest", pincode: "1051", state: "Central Hungary" },
  { countryCode: "IS", district: "Reykjavik", pincode: "101", state: "Capital Region" },
  { countryCode: "LA", district: "Vientiane", pincode: "01000", state: "Vientiane Prefecture" },
  { countryCode: "LV", district: "Riga", pincode: "LV-1050", state: "Riga" },
  { countryCode: "LB", district: "Beirut", pincode: "1107", state: "Beirut Governorate" },
  { countryCode: "LT", district: "Vilnius", pincode: "01100", state: "Vilnius County" },
  { countryCode: "LU", district: "Luxembourg City", pincode: "1111", state: "Luxembourg Canton" },
  { countryCode: "MV", district: "Male", pincode: "20026", state: "Kaafu Atoll" },
  { countryCode: "MM", district: "Yangon", pincode: "11181", state: "Yangon Region" },
  { countryCode: "PA", district: "Panama City", pincode: "0801", state: "Panama Province" },
  { countryCode: "RS", district: "Belgrade", pincode: "11000", state: "Belgrade" },
  { countryCode: "SK", district: "Bratislava", pincode: "811 01", state: "Bratislava Region" },
  { countryCode: "SI", district: "Ljubljana", pincode: "1000", state: "Central Slovenia" },
  { countryCode: "TW", district: "Zhongzheng", pincode: "100", state: "Taipei" },
  { countryCode: "UY", district: "Montevideo", pincode: "11000", state: "Montevideo Department" },
  { countryCode: "UZ", district: "Tashkent", pincode: "100000", state: "Tashkent" },
  { countryCode: "VE", district: "Caracas", pincode: "1010", state: "Capital District" },
];

const ADDITIONAL_CITY_OPTIONS_BY_COUNTRY: Record<string, Array<[district: string, pincode: string, state: string]>> = {
  AE: [
    ["Sharjah", "00000", "Sharjah"],
    ["Ajman", "00000", "Ajman"],
    ["Ras Al Khaimah", "00000", "Ras Al Khaimah"],
  ],
  AU: [
    ["Melbourne", "3000", "Victoria"],
    ["Brisbane", "4000", "Queensland"],
    ["Perth", "6000", "Western Australia"],
    ["Adelaide", "5000", "South Australia"],
  ],
  BR: [
    ["Rio de Janeiro", "20000-000", "Rio de Janeiro"],
    ["Brasilia", "70000-000", "Federal District"],
    ["Salvador", "40000-000", "Bahia"],
  ],
  CA: [
    ["Vancouver", "V5K", "British Columbia"],
    ["Montreal", "H1A", "Quebec"],
    ["Calgary", "T1Y", "Alberta"],
    ["Ottawa", "K1A", "Ontario"],
  ],
  CN: [
    ["Huangpu", "200001", "Shanghai"],
    ["Yuexiu", "510030", "Guangzhou"],
    ["Nanshan", "518000", "Shenzhen"],
  ],
  DE: [
    ["Hamburg-Mitte", "20095", "Hamburg"],
    ["Altstadt-Lehel", "80331", "Munich"],
    ["Innenstadt", "50667", "Cologne"],
    ["Innenstadt I", "60311", "Frankfurt"],
  ],
  ES: [
    ["Ciutat Vella", "08002", "Barcelona"],
    ["Seville", "41001", "Andalusia"],
    ["Valencia", "46001", "Valencian Community"],
  ],
  FR: [
    ["Marseille", "13001", "Provence-Alpes-Cote d'Azur"],
    ["Lyon", "69001", "Auvergne-Rhone-Alpes"],
    ["Toulouse", "31000", "Occitanie"],
  ],
  GB: [
    ["Birmingham", "B1", "England"],
    ["Leeds", "LS1", "England"],
    ["Glasgow", "G1", "Scotland"],
    ["Edinburgh", "EH1", "Scotland"],
  ],
  IN: [
    ["Varanasi", "221001", "Uttar Pradesh"],
    ["Kanpur Nagar", "208001", "Uttar Pradesh"],
    ["Agra", "282001", "Uttar Pradesh"],
    ["Vadodara", "390001", "Gujarat"],
    ["Rajkot", "360001", "Gujarat"],
    ["Nashik", "422001", "Maharashtra"],
    ["Aurangabad", "431001", "Maharashtra"],
    ["Hubballi", "580020", "Karnataka"],
    ["Belagavi", "590001", "Karnataka"],
    ["Davangere", "577001", "Karnataka"],
    ["Madurai", "625001", "Tamil Nadu"],
    ["Tiruchirappalli", "620001", "Tamil Nadu"],
    ["Salem", "636001", "Tamil Nadu"],
    ["Kozhikode", "673001", "Kerala"],
    ["Thrissur", "680001", "Kerala"],
    ["Kochi", "682011", "Kerala"],
    ["Vijayawada", "520001", "Andhra Pradesh"],
    ["Guntur", "522001", "Andhra Pradesh"],
    ["Warangal", "506002", "Telangana"],
    ["Jodhpur", "342001", "Rajasthan"],
    ["Udaipur", "313001", "Rajasthan"],
    ["Amritsar", "143001", "Punjab"],
    ["Ludhiana", "141001", "Punjab"],
    ["Chandigarh", "160017", "Chandigarh"],
  ],
  IT: [
    ["Milan", "20121", "Lombardy"],
    ["Naples", "80100", "Campania"],
    ["Turin", "10121", "Piedmont"],
  ],
  JP: [
    ["Kita", "530-0001", "Osaka"],
    ["Naka", "460-0008", "Nagoya"],
    ["Hakata", "812-0011", "Fukuoka"],
  ],
  KR: [
    ["Gangnam-gu", "06000", "Seoul"],
    ["Haeundae-gu", "48095", "Busan"],
    ["Jung-gu", "41911", "Daegu"],
  ],
  MX: [
    ["Guadalajara", "44100", "Jalisco"],
    ["Monterrey", "64000", "Nuevo Leon"],
    ["Puebla", "72000", "Puebla"],
  ],
  NG: [
    ["Abuja Municipal", "900211", "Federal Capital Territory"],
    ["Ikeja", "100271", "Lagos"],
    ["Port Harcourt", "500001", "Rivers"],
  ],
  RU: [
    ["Saint Petersburg", "190000", "Saint Petersburg"],
    ["Novosibirsk", "630000", "Novosibirsk Oblast"],
    ["Yekaterinburg", "620000", "Sverdlovsk Oblast"],
  ],
  US: [
    ["King County", "98101", "Washington"],
    ["Harris County", "77001", "Texas"],
    ["Maricopa County", "85001", "Arizona"],
    ["Miami-Dade County", "33101", "Florida"],
    ["San Francisco County", "94102", "California"],
    ["Suffolk County", "02108", "Massachusetts"],
  ],
  ZA: [
    ["Johannesburg", "2001", "Gauteng"],
    ["Pretoria", "0002", "Gauteng"],
    ["Durban", "4001", "KwaZulu-Natal"],
  ],
};

const FALLBACK_EXPANDED_LOCATION_OPTIONS: LocationOption[] = [
  ...FALLBACK_LOCATION_OPTIONS,
  ...Object.entries(ADDITIONAL_CITY_OPTIONS_BY_COUNTRY).flatMap(([countryCode, locations]) =>
    locations.map(([district, pincode, state]) => ({ countryCode, district, pincode, state })),
  ),
];

const inputClass =
  "h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";
const labelClass = "text-xs font-medium uppercase tracking-[0.12em] text-slate-500";

type ProfileDetailsFormProps = {
  action: (formData: FormData) => Promise<void>;
  afterLocation?: ReactNode;
  onCountryPhoneCodeChange?: (phoneCode: string) => void;
  profile: DashboardProfile;
};

function formatLocation(location: LocationOption) {
  const country = COUNTRY_OPTIONS.find((item) => item.code === location.countryCode);

  return location.value ?? [location.district, location.state, location.countryName ?? country?.name].filter(Boolean).join(", ");
}

function formatLocationOption(location: LocationOption) {
  const country = COUNTRY_OPTIONS.find((item) => item.code === location.countryCode);

  return location.label ?? [location.pincode, location.district, location.state, location.countryName ?? country?.name].filter(Boolean).join(", ");
}

function stripPincode(location: string) {
  return location.replace(/\s+-\s+[^,]+$/, "");
}

function stripCountry(location: string, countryName: string) {
  return location.replace(new RegExp(`,\\s*${countryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), "");
}

function appendCountryToTypedLocation(location: string, countryName: string) {
  const trimmedLocation = location.trim();

  if (!trimmedLocation) {
    return trimmedLocation;
  }

  return trimmedLocation.toLowerCase().endsWith(`, ${countryName.toLowerCase()}`) ? trimmedLocation : `${trimmedLocation}, ${countryName}`;
}

function getFallbackLocation(countryCode: string) {
  const country = COUNTRY_OPTIONS.find((item) => item.code === countryCode) ?? DEFAULT_COUNTRY;
  return {
    countryCode: country.code,
    district: country.name,
    pincode: "00000",
    state: country.name,
  };
}

function getLocationOptions(countryCode: string) {
  const options = FALLBACK_EXPANDED_LOCATION_OPTIONS.filter((item) => item.countryCode === countryCode).sort((first, second) =>
    formatLocation(first).localeCompare(formatLocation(second)),
  );
  return options.length > 0 ? options : [getFallbackLocation(countryCode)];
}

async function fetchLocationSuggestions(countryCode: string, query: string) {
  const params = new URLSearchParams({ country: countryCode, q: query });
  const response = await fetch(`/api/locations?${params.toString()}`);

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { locations?: LocationOption[] };

  return payload.locations ?? [];
}

function getCountryFromProfile(profile: DashboardProfile) {
  return (
    COUNTRY_OPTIONS.find((country) => country.phoneCode === profile.countryCode) ??
    COUNTRY_OPTIONS.find((country) =>
      getLocationOptions(country.code).some((location) => {
        const savedLocation = stripPincode(profile.location ?? "");

        return formatLocation(location) === savedLocation || stripCountry(formatLocation(location), country.name) === savedLocation;
      }),
    ) ??
    COUNTRY_OPTIONS.find((country) => country.name === profile.location) ??
    DEFAULT_COUNTRY
  );
}

export function ProfileDetailsForm({ action, afterLocation, onCountryPhoneCodeChange, profile }: ProfileDetailsFormProps) {
  const initialCountry = getCountryFromProfile(profile);
  const initialLocationOptions = getLocationOptions(initialCountry.code);
  const savedLocation = stripPincode(profile.location ?? "");
  const initialLocation =
    initialLocationOptions.find((item) => formatLocation(item) === savedLocation || stripCountry(formatLocation(item), initialCountry.name) === savedLocation) ??
    initialLocationOptions[0];
  const initialSelectedLocation = savedLocation || formatLocation(initialLocation);
  const [countryCode, setCountryCode] = useState(initialCountry.code);
  const [location, setLocation] = useState(appendCountryToTypedLocation(initialSelectedLocation, initialCountry.name));
  const [selectedLocation, setSelectedLocation] = useState(initialSelectedLocation);
  const [locationListOpen, setLocationListOpen] = useState(false);
  const [remoteLocationOptions, setRemoteLocationOptions] = useState<LocationOption[]>([]);
  const selectedCountry = COUNTRY_OPTIONS.find((country) => country.code === countryCode) ?? DEFAULT_COUNTRY;
  const fallbackLocationOptions = useMemo(() => getLocationOptions(countryCode), [countryCode]);
  const locationOptions = remoteLocationOptions.length > 0 ? remoteLocationOptions : fallbackLocationOptions;

  useEffect(() => {
    let ignore = false;

    fetchLocationSuggestions(countryCode, selectedLocation).then((suggestions) => {
      if (!ignore) {
        setRemoteLocationOptions(suggestions);
      }
    });

    return () => {
      ignore = true;
    };
  }, [countryCode, selectedLocation]);

  function handleCountryChange(nextCode: string) {
    const nextCountry = COUNTRY_OPTIONS.find((country) => country.code === nextCode) ?? DEFAULT_COUNTRY;
    const nextLocations = getLocationOptions(nextCountry.code);
    const nextLocation = formatLocation(nextLocations[0]);

    setCountryCode(nextCountry.code);
    setSelectedLocation(nextLocation);
    setLocation(nextLocation);
    setRemoteLocationOptions([]);
    onCountryPhoneCodeChange?.(nextCountry.phoneCode);
  }

  function handleLocationChange(nextLocation: string) {
    setSelectedLocation(nextLocation);
    setLocation(appendCountryToTypedLocation(nextLocation, selectedCountry.name));
    setLocationListOpen(true);
  }

  function handleLocationSelect(nextLocation: string) {
    setSelectedLocation(nextLocation);
    setLocation(appendCountryToTypedLocation(nextLocation, selectedCountry.name));
    setLocationListOpen(false);
  }

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2">
        <span className={labelClass}>First name</span>
        <input className={inputClass} defaultValue={profile.firstName} name="firstName" required />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Last name</span>
        <input className={inputClass} defaultValue={profile.lastName} name="lastName" required />
      </label>
      <label className="space-y-2 sm:col-span-2">
        <span className={labelClass}>Headline</span>
        <input
          className={inputClass}
          defaultValue={profile.headline ?? ""}
          maxLength={180}
          name="headline"
          placeholder="Full-stack developer"
        />
        <span className="block text-xs text-slate-500">Maximum 180 characters.</span>
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Country / region</span>
        <select className={inputClass} name="countryRegion" onChange={(event) => handleCountryChange(event.target.value)} value={countryCode}>
          {COUNTRY_OPTIONS.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </label>
      <label className="relative space-y-2">
        <span className={labelClass}>Location</span>
        <input
          className={inputClass}
          onBlur={() => window.setTimeout(() => setLocationListOpen(false), 120)}
          onChange={(event) => handleLocationChange(event.target.value)}
          onFocus={() => setLocationListOpen(true)}
          placeholder={`Type city, district, state, or pincode in ${selectedCountry.name}`}
          value={selectedLocation}
        />
        {locationListOpen && locationOptions.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-md border border-slate-800 bg-slate-950 py-1 shadow-2xl">
            {locationOptions.map((item) => {
              const value = formatLocation(item);
              return (
                <button
                  className="block w-full px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900 hover:text-cyan-200"
                  key={`${item.countryCode}-${formatLocationOption(item)}`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleLocationSelect(value);
                  }}
                  type="button"
                >
                  {formatLocationOption(item)}
                </button>
              );
            })}
          </div>
        ) : null}
        <input name="location" type="hidden" value={location} />
      </label>
      {afterLocation ? <div className="sm:col-span-2">{afterLocation}</div> : null}
      <input name="countryCode" type="hidden" value={selectedCountry.phoneCode} />
      <input name="showLocation" type="hidden" value="on" />
      <input name="openToWork" type="hidden" value={profile.openToWork ? "on" : ""} />
      <div className="sm:col-span-2">
        <Button type="submit">Save profile</Button>
      </div>
    </form>
  );
}
