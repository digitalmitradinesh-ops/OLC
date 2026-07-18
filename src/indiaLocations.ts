/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PincodeRecord {
  pincode: string;
  officeName: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface StateDirectory {
  stateName: string;
  code: string;
  cities: {
    cityName: string;
    pincodes: {
      code: string;
      area: string;
      lat: number;
      lng: number;
    }[];
  }[];
}

export const INDIA_LOCATIONS: PincodeRecord[] = [
  // 1. Andhra Pradesh
  { pincode: '530001', officeName: 'Beach Road', district: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.7120, longitude: 83.3220 },
  { pincode: '530017', officeName: 'Dwaraka Nagar', district: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.7240, longitude: 83.3190 },
  { pincode: '520001', officeName: 'Vijayawada H.O', district: 'Krishna', state: 'Andhra Pradesh', latitude: 16.5060, longitude: 80.6480 },
  { pincode: '520010', officeName: 'Labbipet', district: 'Krishna', state: 'Andhra Pradesh', latitude: 16.5011, longitude: 80.6432 },
  { pincode: '517501', officeName: 'Tirupati H.O', district: 'Chittoor', state: 'Andhra Pradesh', latitude: 13.6284, longitude: 79.4192 },
  { pincode: '522002', officeName: 'Guntur Bazar', district: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365 },

  // 2. Arunachal Pradesh
  { pincode: '791111', officeName: 'Itanagar H.O', district: 'Papum Pare', state: 'Arunachal Pradesh', latitude: 27.1020, longitude: 93.6160 },
  { pincode: '791110', officeName: 'Naharlagun', district: 'Papum Pare', state: 'Arunachal Pradesh', latitude: 27.1082, longitude: 93.6923 },
  { pincode: '791102', officeName: 'Pasighat H.O', district: 'East Siang', state: 'Arunachal Pradesh', latitude: 28.0620, longitude: 95.3259 },

  // 3. Assam
  { pincode: '781001', officeName: 'Guwahati G.P.O.', district: 'Kamrup Metro', state: 'Assam', latitude: 26.1850, longitude: 91.7490 },
  { pincode: '781005', officeName: 'Dispur', district: 'Kamrup Metro', state: 'Assam', latitude: 26.1430, longitude: 91.7890 },
  { pincode: '786001', officeName: 'Dibrugarh H.O', district: 'Dibrugarh', state: 'Assam', latitude: 27.4728, longitude: 94.9120 },
  { pincode: '788001', officeName: 'Silchar H.O', district: 'Cachar', state: 'Assam', latitude: 24.8333, longitude: 92.7789 },

  // 4. Bihar
  { pincode: '800001', officeName: 'Patna G.P.O.', district: 'Patna', state: 'Bihar', latitude: 25.6112, longitude: 85.1414 },
  { pincode: '800013', officeName: 'Kankarbagh', district: 'Patna', state: 'Bihar', latitude: 25.5940, longitude: 85.1633 },
  { pincode: '823001', officeName: 'Gaya H.O', district: 'Gaya', state: 'Bihar', latitude: 24.7957, longitude: 84.9994 },
  { pincode: '842001', officeName: 'Muzaffarpur H.O', district: 'Muzaffarpur', state: 'Bihar', latitude: 26.1209, longitude: 85.3647 },
  { pincode: '812001', officeName: 'Bhagalpur H.O', district: 'Bhagalpur', state: 'Bihar', latitude: 25.2445, longitude: 87.0139 },

  // 5. Chhattisgarh
  { pincode: '492001', officeName: 'Raipur H.O', district: 'Raipur', state: 'Chhattisgarh', latitude: 21.2512, longitude: 81.6296 },
  { pincode: '492015', officeName: 'Tatibandh', district: 'Raipur', state: 'Chhattisgarh', latitude: 21.2610, longitude: 81.5640 },
  { pincode: '495001', officeName: 'Bilaspur H.O', district: 'Bilaspur', state: 'Chhattisgarh', latitude: 22.0790, longitude: 82.1391 },
  { pincode: '490001', officeName: 'Bhilai H.O', district: 'Durg', state: 'Chhattisgarh', latitude: 21.1938, longitude: 81.3509 },

  // 6. Goa
  { pincode: '403001', officeName: 'Panaji H.O', district: 'North Goa', state: 'Goa', latitude: 15.4909, longitude: 73.8278 },
  { pincode: '403601', officeName: 'Margao H.O', district: 'South Goa', state: 'Goa', latitude: 15.2736, longitude: 73.9582 },
  { pincode: '403802', officeName: 'Vasco da Gama', district: 'South Goa', state: 'Goa', latitude: 15.3959, longitude: 73.8143 },
  { pincode: '403507', officeName: 'Mapusa', district: 'North Goa', state: 'Goa', latitude: 15.5937, longitude: 73.8142 },

  // 7. Gujarat
  { pincode: '380001', officeName: 'Ahmedabad G.P.O.', district: 'Ahmedabad', state: 'Gujarat', latitude: 23.0258, longitude: 72.5873 },
  { pincode: '380009', officeName: 'Navrangpura', district: 'Ahmedabad', state: 'Gujarat', latitude: 23.0361, longitude: 72.5617 },
  { pincode: '380015', officeName: 'Satellite', district: 'Ahmedabad', state: 'Gujarat', latitude: 23.0248, longitude: 72.5284 },
  { pincode: '380054', officeName: 'Drive-in Road', district: 'Ahmedabad', state: 'Gujarat', latitude: 23.0489, longitude: 72.5267 },
  { pincode: '395003', officeName: 'Surat H.O', district: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
  { pincode: '390001', officeName: 'Vadodara H.O', district: 'Vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { pincode: '360001', officeName: 'Rajkot H.O', district: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },

  // 8. Haryana
  { pincode: '122001', officeName: 'Gurgaon City', district: 'Gurugram', state: 'Haryana', latitude: 28.4595, longitude: 77.0266 },
  { pincode: '122002', officeName: 'DLF Phase 1-3', district: 'Gurugram', state: 'Haryana', latitude: 28.4800, longitude: 77.0900 },
  { pincode: '122018', officeName: 'Sohna Road', district: 'Gurugram', state: 'Haryana', latitude: 28.3971, longitude: 77.0425 },
  { pincode: '121001', officeName: 'Faridabad H.O', district: 'Faridabad', state: 'Haryana', latitude: 28.4089, longitude: 77.3178 },
  { pincode: '133001', officeName: 'Ambala Cantt', district: 'Ambala', state: 'Haryana', latitude: 30.3400, longitude: 76.8400 },
  { pincode: '134109', officeName: 'Panchkula Sector 8', district: 'Panchkula', state: 'Haryana', latitude: 30.6942, longitude: 76.8606 },

  // 9. Himachal Pradesh
  { pincode: '171001', officeName: 'Shimla G.P.O.', district: 'Shimla', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734 },
  { pincode: '171002', officeName: 'Kasumpti', district: 'Shimla', state: 'Himachal Pradesh', latitude: 31.0780, longitude: 77.1890 },
  { pincode: '176215', officeName: 'Dharamshala H.O', district: 'Kangra', state: 'Himachal Pradesh', latitude: 32.2190, longitude: 76.3234 },
  { pincode: '175131', officeName: 'Manali', district: 'Kullu', state: 'Himachal Pradesh', latitude: 32.2396, longitude: 77.1887 },
  { pincode: '173212', officeName: 'Solan H.O', district: 'Solan', state: 'Himachal Pradesh', latitude: 30.9045, longitude: 77.0967 },

  // 10. Jharkhand
  { pincode: '834001', officeName: 'Ranchi G.P.O.', district: 'Ranchi', state: 'Jharkhand', latitude: 23.3600, longitude: 85.3300 },
  { pincode: '834002', officeName: 'Doranda', district: 'Ranchi', state: 'Jharkhand', latitude: 23.3330, longitude: 85.3240 },
  { pincode: '831001', officeName: 'Jamshedpur H.O', district: 'East Singhbhum', state: 'Jharkhand', latitude: 22.8046, longitude: 86.2029 },
  { pincode: '826001', officeName: 'Dhanbad H.O', district: 'Dhanbad', state: 'Jharkhand', latitude: 23.7957, longitude: 86.4304 },
  { pincode: '827001', officeName: 'Bokaro Steel City', district: 'Bokaro', state: 'Jharkhand', latitude: 23.6693, longitude: 86.1511 },

  // 11. Karnataka
  { pincode: '560001', officeName: 'M.G. Road', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9756, longitude: 77.6068 },
  { pincode: '560008', officeName: 'Halasuru / Ulsoor', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9806, longitude: 77.6256 },
  { pincode: '560011', officeName: 'Jayanagar', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9298, longitude: 77.5843 },
  { pincode: '560034', officeName: 'Koramangala', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9352, longitude: 77.6244 },
  { pincode: '560038', officeName: 'Indiranagar', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9784, longitude: 77.6408 },
  { pincode: '560066', officeName: 'Whitefield', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9698, longitude: 77.7500 },
  { pincode: '560076', officeName: 'BTM Layout', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9166, longitude: 77.6101 },
  { pincode: '560102', officeName: 'HSR Layout', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9121, longitude: 77.6446 },
  { pincode: '560103', officeName: 'Bellandur / Outer Ring Road', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9299, longitude: 77.6784 },
  { pincode: '570001', officeName: 'Mysore H.O', district: 'Mysuru', state: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
  { pincode: '580001', officeName: 'Hubli H.O', district: 'Dharwad', state: 'Karnataka', latitude: 15.3647, longitude: 75.1240 },
  { pincode: '575001', officeName: 'Mangalore H.O', district: 'Dakshina Kannada', state: 'Karnataka', latitude: 12.9141, longitude: 74.8560 },

  // 12. Kerala
  { pincode: '682001', officeName: 'Kochi G.P.O.', district: 'Ernakulam', state: 'Kerala', latitude: 9.9700, longitude: 76.2800 },
  { pincode: '682030', officeName: 'Thevara', district: 'Ernakulam', state: 'Kerala', latitude: 9.9400, longitude: 76.2900 },
  { pincode: '695001', officeName: 'Trivandrum G.P.O.', district: 'Thiruvananthapuram', state: 'Kerala', latitude: 8.5000, longitude: 76.9500 },
  { pincode: '673001', officeName: 'Calicut H.O', district: 'Kozhikode', state: 'Kerala', latitude: 11.2588, longitude: 75.7804 },
  { pincode: '680001', officeName: 'Thrissur H.O', district: 'Thrissur', state: 'Kerala', latitude: 10.5276, longitude: 76.2144 },

  // 13. Madhya Pradesh
  { pincode: '462001', officeName: 'Bhopal G.P.O.', district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  { pincode: '462016', officeName: 'Arera Colony', district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2160, longitude: 77.4320 },
  { pincode: '452001', officeName: 'Indore H.O', district: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { pincode: '474001', officeName: 'Gwalior H.O', district: 'Gwalior', state: 'Madhya Pradesh', latitude: 26.2183, longitude: 78.1828 },
  { pincode: '482001', officeName: 'Jabalpur H.O', district: 'Jabalpur', state: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },

  // 14. Maharashtra
  { pincode: '400001', officeName: 'Fort / Colaba', district: 'Mumbai', state: 'Maharashtra', latitude: 18.9269, longitude: 72.8315 },
  { pincode: '400020', officeName: 'Nariman Point', district: 'Mumbai', state: 'Maharashtra', latitude: 18.9260, longitude: 72.8228 },
  { pincode: '400050', officeName: 'Bandra West', district: 'Mumbai Suburban', state: 'Maharashtra', latitude: 19.0544, longitude: 72.8402 },
  { pincode: '400053', officeName: 'Andheri West', district: 'Mumbai Suburban', state: 'Maharashtra', latitude: 19.1200, longitude: 72.8256 },
  { pincode: '400076', officeName: 'Powai', district: 'Mumbai Suburban', state: 'Maharashtra', latitude: 19.1176, longitude: 72.9060 },
  { pincode: '400097', officeName: 'Malad East', district: 'Mumbai Suburban', state: 'Maharashtra', latitude: 19.1861, longitude: 72.8485 },
  { pincode: '411001', officeName: 'Pune G.P.O.', district: 'Pune', state: 'Maharashtra', latitude: 18.5284, longitude: 73.8739 },
  { pincode: '411004', officeName: 'Deccan Gymkhana', district: 'Pune', state: 'Maharashtra', latitude: 18.5168, longitude: 73.8403 },
  { pincode: '411007', officeName: 'Aundh', district: 'Pune', state: 'Maharashtra', latitude: 18.5580, longitude: 73.8075 },
  { pincode: '411038', officeName: 'Kothrud', district: 'Pune', state: 'Maharashtra', latitude: 18.5074, longitude: 73.8077 },
  { pincode: '411045', officeName: 'Baner', district: 'Pune', state: 'Maharashtra', latitude: 18.5596, longitude: 73.7799 },
  { pincode: '411057', officeName: 'Hinjawadi', district: 'Pune', state: 'Maharashtra', latitude: 18.5913, longitude: 73.7389 },
  { pincode: '440001', officeName: 'Nagpur G.P.O.', district: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { pincode: '400601', officeName: 'Thane H.O', district: 'Thane', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781 },
  { pincode: '422001', officeName: 'Nashik H.O', district: 'Nashik', state: 'Maharashtra', latitude: 20.0050, longitude: 73.7890 },

  // 15. Manipur
  { pincode: '795001', officeName: 'Imphal H.O', district: 'Imphal West', state: 'Manipur', latitude: 24.8170, longitude: 93.9368 },
  { pincode: '795138', officeName: 'Thoubal', district: 'Thoubal', state: 'Manipur', latitude: 24.6340, longitude: 94.0120 },
  { pincode: '795128', officeName: 'Churachandpur H.O', district: 'Churachandpur', state: 'Manipur', latitude: 24.3314, longitude: 93.6829 },

  // 16. Meghalaya
  { pincode: '793001', officeName: 'Shillong G.P.O.', district: 'East Khasi Hills', state: 'Meghalaya', latitude: 25.5788, longitude: 91.8831 },
  { pincode: '793003', officeName: 'Laitumkhrah', district: 'East Khasi Hills', state: 'Meghalaya', latitude: 25.5690, longitude: 91.8990 },
  { pincode: '794001', officeName: 'Tura H.O', district: 'West Garo Hills', state: 'Meghalaya', latitude: 25.5140, longitude: 90.2201 },
  { pincode: '793150', officeName: 'Jowai', district: 'West Jaintia Hills', state: 'Meghalaya', latitude: 25.4410, longitude: 92.2030 },

  // 17. Mizoram
  { pincode: '796001', officeName: 'Aizawl H.O', district: 'Aizawl', state: 'Mizoram', latitude: 23.7271, longitude: 92.7176 },
  { pincode: '796701', officeName: 'Lunglei H.O', district: 'Lunglei', state: 'Mizoram', latitude: 22.8870, longitude: 92.7380 },
  { pincode: '796321', officeName: 'Champhai', district: 'Champhai', state: 'Mizoram', latitude: 23.4560, longitude: 93.3290 },

  // 18. Nagaland
  { pincode: '797001', officeName: 'Kohima H.O', district: 'Kohima', state: 'Nagaland', latitude: 25.6751, longitude: 94.1086 },
  { pincode: '797112', officeName: 'Dimapur H.O', district: 'Dimapur', state: 'Nagaland', latitude: 25.9080, longitude: 93.7270 },
  { pincode: '798601', officeName: 'Mokokchung H.O', district: 'Mokokchung', state: 'Nagaland', latitude: 26.3262, longitude: 94.5165 },

  // 19. Odisha
  { pincode: '751001', officeName: 'Bhubaneswar G.P.O.', district: 'Khurda', state: 'Odisha', latitude: 20.2724, longitude: 85.8301 },
  { pincode: '751009', officeName: 'Saheed Nagar', district: 'Khurda', state: 'Odisha', latitude: 20.2890, longitude: 85.8440 },
  { pincode: '753001', officeName: 'Cuttack H.O', district: 'Cuttack', state: 'Odisha', latitude: 20.4625, longitude: 85.8828 },
  { pincode: '769001', officeName: 'Rourkela Sector 1', district: 'Sundargarh', state: 'Odisha', latitude: 22.2592, longitude: 84.8643 },
  { pincode: '752001', officeName: 'Puri H.O', district: 'Puri', state: 'Odisha', latitude: 19.8143, longitude: 85.8179 },

  // 20. Punjab
  { pincode: '141001', officeName: 'Ludhiana H.O', district: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573 },
  { pincode: '143001', officeName: 'Amritsar H.O', district: 'Amritsar', state: 'Punjab', latitude: 31.6340, longitude: 74.8723 },
  { pincode: '144001', officeName: 'Jalandhar H.O', district: 'Jalandhar', state: 'Punjab', latitude: 31.3260, longitude: 75.5760 },
  { pincode: '147001', officeName: 'Patiala H.O', district: 'Patiala', state: 'Punjab', latitude: 30.3398, longitude: 76.3869 },

  // 21. Rajasthan
  { pincode: '302001', officeName: 'Jaipur G.P.O.', district: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { pincode: '302015', officeName: 'Malviya Nagar', district: 'Jaipur', state: 'Rajasthan', latitude: 26.8530, longitude: 75.8047 },
  { pincode: '302021', officeName: 'Vaishali Nagar', district: 'Jaipur', state: 'Rajasthan', latitude: 26.9076, longitude: 75.7381 },
  { pincode: '342001', officeName: 'Jodhpur H.O', district: 'Jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },
  { pincode: '313001', officeName: 'Udaipur H.O', district: 'Udaipur', state: 'Rajasthan', latitude: 24.5854, longitude: 73.7125 },
  { pincode: '324001', officeName: 'Kota H.O', district: 'Kota', state: 'Rajasthan', latitude: 25.1800, longitude: 75.8300 },

  // 22. Sikkim
  { pincode: '737101', officeName: 'Gangtok H.O', district: 'East Sikkim', state: 'Sikkim', latitude: 27.3314, longitude: 88.6138 },
  { pincode: '737126', officeName: 'Namchi H.O', district: 'South Sikkim', state: 'Sikkim', latitude: 27.1680, longitude: 88.3580 },
  { pincode: '737111', officeName: 'Geyzing H.O', district: 'West Sikkim', state: 'Sikkim', latitude: 27.2890, longitude: 88.2980 },

  // 23. Tamil Nadu
  { pincode: '600001', officeName: 'George Town', district: 'Chennai', state: 'Tamil Nadu', latitude: 13.0940, longitude: 80.2882 },
  { pincode: '600004', officeName: 'Mylapore', district: 'Chennai', state: 'Tamil Nadu', latitude: 13.0330, longitude: 80.2621 },
  { pincode: '600017', officeName: 'T. Nagar', district: 'Chennai', state: 'Tamil Nadu', latitude: 13.0405, longitude: 80.2337 },
  { pincode: '600020', officeName: 'Adyar', district: 'Chennai', state: 'Tamil Nadu', latitude: 13.0063, longitude: 80.2574 },
  { pincode: '600040', officeName: 'Anna Nagar', district: 'Chennai', state: 'Tamil Nadu', latitude: 13.0850, longitude: 80.2101 },
  { pincode: '600096', officeName: 'Perungudi / OMR', district: 'Chennai', state: 'Tamil Nadu', latitude: 12.9654, longitude: 80.2461 },
  { pincode: '641001', officeName: 'Coimbatore H.O', district: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
  { pincode: '625001', officeName: 'Madurai H.O', district: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  { pincode: '620001', officeName: 'Trichy Fort', district: 'Tiruchirappalli', state: 'Tamil Nadu', latitude: 10.8250, longitude: 78.6900 },

  // 24. Telangana
  { pincode: '500001', officeName: 'Hyderabad G.P.O.', district: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { pincode: '500032', officeName: 'Gachibowli', district: 'Rangareddy', state: 'Telangana', latitude: 17.4401, longitude: 78.3489 },
  { pincode: '500033', officeName: 'Jubilee Hills', district: 'Hyderabad', state: 'Telangana', latitude: 17.4325, longitude: 78.4071 },
  { pincode: '500081', officeName: 'Madhapur / HITEC City', district: 'Rangareddy', state: 'Telangana', latitude: 17.4483, longitude: 78.3741 },
  { pincode: '500082', officeName: 'Kondapur', district: 'Rangareddy', state: 'Telangana', latitude: 17.4699, longitude: 78.3578 },
  { pincode: '506001', officeName: 'Warangal H.O', district: 'Warangal', state: 'Telangana', latitude: 17.9784, longitude: 79.5941 },
  { pincode: '503001', officeName: 'Nizamabad H.O', district: 'Nizamabad', state: 'Telangana', latitude: 18.6725, longitude: 78.0941 },

  // 25. Tripura
  { pincode: '799001', officeName: 'Agartala H.O', district: 'West Tripura', state: 'Tripura', latitude: 23.8315, longitude: 91.2868 },
  { pincode: '799250', officeName: 'Dharmanagar H.O', district: 'North Tripura', state: 'Tripura', latitude: 24.3667, longitude: 92.1667 },
  { pincode: '799120', officeName: 'Udaipur H.O', district: 'Gomati', state: 'Tripura', latitude: 23.5333, longitude: 91.4833 },

  // 26. Uttarakhand
  { pincode: '248001', officeName: 'Dehradun G.P.O.', district: 'Dehradun', state: 'Uttarakhand', latitude: 30.3165, longitude: 78.0322 },
  { pincode: '248006', officeName: 'Rajpur Road', district: 'Dehradun', state: 'Uttarakhand', latitude: 30.3450, longitude: 78.0580 },
  { pincode: '249401', officeName: 'Haridwar H.O', district: 'Haridwar', state: 'Uttarakhand', latitude: 29.9450, longitude: 78.1640 },
  { pincode: '249201', officeName: 'Rishikesh H.O', district: 'Dehradun', state: 'Uttarakhand', latitude: 30.1033, longitude: 78.2947 },

  // 27. Uttar Pradesh
  { pincode: '201301', officeName: 'Noida Sector 62', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.6253, longitude: 77.3725 },
  { pincode: '201305', officeName: 'Noida Sector 15', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.5800, longitude: 77.3100 },
  { pincode: '226001', officeName: 'Hazratganj', district: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8500, longitude: 80.9499 },
  { pincode: '226010', officeName: 'Gomti Nagar', district: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8600, longitude: 81.0000 },
  { pincode: '208001', officeName: 'Kanpur G.P.O.', district: 'Kanpur Nagar', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
  { pincode: '282001', officeName: 'Agra Fort', district: 'Agra', state: 'Uttar Pradesh', latitude: 27.1800, longitude: 78.0200 },
  { pincode: '221001', officeName: 'Varanasi Cantt', district: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },

  // 28. West Bengal
  { pincode: '700001', officeName: 'B.B.D. Bagh', district: 'Kolkata', state: 'West Bengal', latitude: 22.5714, longitude: 88.3486 },
  { pincode: '700019', officeName: 'Ballygunge', district: 'Kolkata', state: 'West Bengal', latitude: 22.5278, longitude: 88.3658 },
  { pincode: '700091', officeName: 'Salt Lake Sector V', district: 'North 24 Parganas', state: 'West Bengal', latitude: 22.5735, longitude: 88.4331 },
  { pincode: '700156', officeName: 'New Town Action Area I', district: 'North 24 Parganas', state: 'West Bengal', latitude: 22.5804, longitude: 88.4578 },
  { pincode: '734001', officeName: 'Siliguri H.O', district: 'Darjeeling', state: 'West Bengal', latitude: 26.7271, longitude: 88.3953 },
  { pincode: '713301', officeName: 'Asansol H.O', district: 'Paschim Bardhaman', state: 'West Bengal', latitude: 23.6740, longitude: 86.9520 },

  // UTs
  // UT - Chandigarh
  { pincode: '160017', officeName: 'Chandigarh Sector 17', district: 'Chandigarh', state: 'Chandigarh', latitude: 30.7410, longitude: 76.7820 },
  // UT - Puducherry
  { pincode: '605001', officeName: 'Pondicherry H.O', district: 'Puducherry', state: 'Puducherry', latitude: 11.9416, longitude: 79.8083 },
  // UT - Andaman and Nicobar
  { pincode: '744101', officeName: 'Port Blair H.O', district: 'South Andaman', state: 'Andaman and Nicobar Islands', latitude: 11.6234, longitude: 92.7265 },
  // UT - Jammu & Kashmir
  { pincode: '190001', officeName: 'Srinagar G.P.O.', district: 'Srinagar', state: 'Jammu and Kashmir', latitude: 34.0836, longitude: 74.7973 },
  { pincode: '180001', officeName: 'Jammu H.O', district: 'Jammu', state: 'Jammu and Kashmir', latitude: 32.7266, longitude: 74.8570 },
  // UT - Ladakh
  { pincode: '194101', officeName: 'Leh H.O', district: 'Leh', state: 'Ladakh', latitude: 34.1526, longitude: 77.5771 }
];

export const INDIA_STATES_DIRECTORY: StateDirectory[] = [
  {
    stateName: 'Andhra Pradesh',
    code: 'AP',
    cities: [
      {
        cityName: 'Visakhapatnam',
        pincodes: [
          { code: '530001', area: 'Beach Road', lat: 17.7120, lng: 83.3220 },
          { code: '530017', area: 'Dwaraka Nagar', lat: 17.7240, lng: 83.3190 }
        ]
      },
      {
        cityName: 'Vijayawada',
        pincodes: [
          { code: '520001', area: 'Vijayawada H.O', lat: 16.5060, lng: 80.6480 },
          { code: '520010', area: 'Labbipet', lat: 16.5011, lng: 80.6432 }
        ]
      },
      {
        cityName: 'Tirupati',
        pincodes: [
          { code: '517501', area: 'Tirupati H.O', lat: 13.6284, lng: 79.4192 }
        ]
      },
      {
        cityName: 'Guntur',
        pincodes: [
          { code: '522002', area: 'Guntur Bazar', lat: 16.3067, lng: 80.4365 }
        ]
      }
    ]
  },
  {
    stateName: 'Arunachal Pradesh',
    code: 'AR',
    cities: [
      {
        cityName: 'Itanagar',
        pincodes: [
          { code: '791111', area: 'Itanagar H.O', lat: 27.1020, lng: 93.6160 }
        ]
      },
      {
        cityName: 'Naharlagun',
        pincodes: [
          { code: '791110', area: 'Naharlagun', lat: 27.1082, lng: 93.6923 }
        ]
      },
      {
        cityName: 'Pasighat',
        pincodes: [
          { code: '791102', area: 'Pasighat H.O', lat: 28.0620, lng: 95.3259 }
        ]
      }
    ]
  },
  {
    stateName: 'Assam',
    code: 'AS',
    cities: [
      {
        cityName: 'Guwahati',
        pincodes: [
          { code: '781001', area: 'Guwahati G.P.O.', lat: 26.1850, lng: 91.7490 },
          { code: '781005', area: 'Dispur', lat: 26.1430, lng: 91.7890 }
        ]
      },
      {
        cityName: 'Dibrugarh',
        pincodes: [
          { code: '786001', area: 'Dibrugarh H.O', lat: 27.4728, lng: 94.9120 }
        ]
      },
      {
        cityName: 'Silchar',
        pincodes: [
          { code: '788001', area: 'Silchar H.O', lat: 24.8333, lng: 92.7789 }
        ]
      }
    ]
  },
  {
    stateName: 'Bihar',
    code: 'BR',
    cities: [
      {
        cityName: 'Patna',
        pincodes: [
          { code: '800001', area: 'Patna G.P.O.', lat: 25.6112, lng: 85.1414 },
          { code: '800013', area: 'Kankarbagh', lat: 25.5940, lng: 85.1633 }
        ]
      },
      {
        cityName: 'Gaya',
        pincodes: [
          { code: '823001', area: 'Gaya H.O', lat: 24.7957, lng: 84.9994 }
        ]
      },
      {
        cityName: 'Muzaffarpur',
        pincodes: [
          { code: '842001', area: 'Muzaffarpur H.O', lat: 26.1209, lng: 85.3647 }
        ]
      },
      {
        cityName: 'Bhagalpur',
        pincodes: [
          { code: '812001', area: 'Bhagalpur H.O', lat: 25.2445, lng: 87.0139 }
        ]
      }
    ]
  },
  {
    stateName: 'Chhattisgarh',
    code: 'CG',
    cities: [
      {
        cityName: 'Raipur',
        pincodes: [
          { code: '492001', area: 'Raipur H.O', lat: 21.2512, lng: 81.6296 },
          { code: '492015', area: 'Tatibandh', lat: 21.2610, lng: 81.5640 }
        ]
      },
      {
        cityName: 'Bilaspur',
        pincodes: [
          { code: '495001', area: 'Bilaspur H.O', lat: 22.0790, lng: 82.1391 }
        ]
      },
      {
        cityName: 'Bhilai',
        pincodes: [
          { code: '490001', area: 'Bhilai H.O', lat: 21.1938, lng: 81.3509 }
        ]
      }
    ]
  },
  {
    stateName: 'Delhi',
    code: 'DL',
    cities: [
      {
        cityName: 'New Delhi',
        pincodes: [
          { code: '110001', area: 'Connaught Place', lat: 28.6304, lng: 77.2177 },
          { code: '110003', area: 'Pandara Road', lat: 28.6094, lng: 77.2285 },
          { code: '110011', area: 'President\'s Estate', lat: 28.6143, lng: 77.2013 },
          { code: '110021', area: 'Chanakyapuri', lat: 28.5913, lng: 77.1907 }
        ]
      },
      {
        cityName: 'South Delhi',
        pincodes: [
          { code: '110016', area: 'Hauz Khas', lat: 28.5494, lng: 77.2001 },
          { code: '110024', area: 'Lajpat Nagar', lat: 28.5684, lng: 77.2435 },
          { code: '110049', area: 'Defence Colony', lat: 28.5726, lng: 77.2268 }
        ]
      },
      {
        cityName: 'Other Districts',
        pincodes: [
          { code: '110085', area: 'Rohini Sector 7', lat: 28.7056, lng: 77.1147 },
          { code: '110092', area: 'Nirman Vihar', lat: 28.6358, lng: 77.2882 }
        ]
      }
    ]
  },
  {
    stateName: 'Goa',
    code: 'GA',
    cities: [
      {
        cityName: 'Panaji',
        pincodes: [
          { code: '403001', area: 'Panaji H.O', lat: 15.4909, lng: 73.8278 }
        ]
      },
      {
        cityName: 'Margao',
        pincodes: [
          { code: '403601', area: 'Margao H.O', lat: 15.2736, lng: 73.9582 }
        ]
      },
      {
        cityName: 'Vasco da Gama',
        pincodes: [
          { code: '403802', area: 'Vasco da Gama', lat: 15.3959, lng: 73.8143 }
        ]
      },
      {
        cityName: 'Mapusa',
        pincodes: [
          { code: '403507', area: 'Mapusa', lat: 15.5937, lng: 73.8142 }
        ]
      }
    ]
  },
  {
    stateName: 'Gujarat',
    code: 'GJ',
    cities: [
      {
        cityName: 'Ahmedabad',
        pincodes: [
          { code: '380001', area: 'Ahmedabad G.P.O.', lat: 23.0258, lng: 72.5873 },
          { code: '380009', area: 'Navrangpura', lat: 23.0361, lng: 72.5617 },
          { code: '380015', area: 'Satellite', lat: 23.0248, lng: 72.5284 },
          { code: '380054', area: 'Drive-in Road', lat: 23.0489, lng: 72.5267 }
        ]
      },
      {
        cityName: 'Surat',
        pincodes: [
          { code: '395003', area: 'Surat H.O', lat: 21.1702, lng: 72.8311 }
        ]
      },
      {
        cityName: 'Vadodara',
        pincodes: [
          { code: '390001', area: 'Vadodara H.O', lat: 22.3072, lng: 73.1812 }
        ]
      },
      {
        cityName: 'Rajkot',
        pincodes: [
          { code: '360001', area: 'Rajkot H.O', lat: 22.3039, lng: 70.8022 }
        ]
      }
    ]
  },
  {
    stateName: 'Haryana',
    code: 'HR',
    cities: [
      {
        cityName: 'Gurugram',
        pincodes: [
          { code: '122001', area: 'Gurgaon City', lat: 28.4595, lng: 77.0266 },
          { code: '122002', area: 'DLF Phase 1-3', lat: 28.4800, lng: 77.0900 },
          { code: '122018', area: 'Sohna Road', lat: 28.3971, lng: 77.0425 }
        ]
      },
      {
        cityName: 'Faridabad',
        pincodes: [
          { code: '121001', area: 'Faridabad H.O', lat: 28.4089, lng: 77.3178 }
        ]
      },
      {
        cityName: 'Ambala',
        pincodes: [
          { code: '133001', area: 'Ambala Cantt', lat: 30.3400, lng: 76.8400 }
        ]
      },
      {
        cityName: 'Panchkula',
        pincodes: [
          { code: '134109', area: 'Sector 8', lat: 30.6942, lng: 76.8606 }
        ]
      }
    ]
  },
  {
    stateName: 'Himachal Pradesh',
    code: 'HP',
    cities: [
      {
        cityName: 'Shimla',
        pincodes: [
          { code: '171001', area: 'Shimla G.P.O.', lat: 31.1048, lng: 77.1734 },
          { code: '171002', area: 'Kasumpti', lat: 31.0780, lng: 77.1890 }
        ]
      },
      {
        cityName: 'Dharamshala',
        pincodes: [
          { code: '176215', area: 'Dharamshala H.O', lat: 32.2190, lng: 76.3234 }
        ]
      },
      {
        cityName: 'Manali',
        pincodes: [
          { code: '175131', area: 'Manali', lat: 32.2396, lng: 77.1887 }
        ]
      },
      {
        cityName: 'Solan',
        pincodes: [
          { code: '173212', area: 'Solan H.O', lat: 30.9045, lng: 77.0967 }
        ]
      }
    ]
  },
  {
    stateName: 'Jammu and Kashmir',
    code: 'JK',
    cities: [
      {
        cityName: 'Srinagar',
        pincodes: [
          { code: '190001', area: 'Srinagar G.P.O.', lat: 34.0836, lng: 74.7973 }
        ]
      },
      {
        cityName: 'Jammu',
        pincodes: [
          { code: '180001', area: 'Jammu H.O', lat: 32.7266, lng: 74.8570 }
        ]
      }
    ]
  },
  {
    stateName: 'Jharkhand',
    code: 'JH',
    cities: [
      {
        cityName: 'Ranchi',
        pincodes: [
          { code: '834001', area: 'Ranchi G.P.O.', lat: 23.3600, lng: 85.3300 },
          { code: '834002', area: 'Doranda', lat: 23.3330, lng: 85.3240 }
        ]
      },
      {
        cityName: 'Jamshedpur',
        pincodes: [
          { code: '831001', area: 'Jamshedpur H.O', lat: 22.8046, lng: 86.2029 }
        ]
      },
      {
        cityName: 'Dhanbad',
        pincodes: [
          { code: '826001', area: 'Dhanbad H.O', lat: 23.7957, lng: 86.4304 }
        ]
      },
      {
        cityName: 'Bokaro',
        pincodes: [
          { code: '827001', area: 'Bokaro Steel City', lat: 23.6693, lng: 86.1511 }
        ]
      }
    ]
  },
  {
    stateName: 'Karnataka',
    code: 'KA',
    cities: [
      {
        cityName: 'Bengaluru (Bangalore)',
        pincodes: [
          { code: '560001', area: 'M.G. Road', lat: 12.9756, lng: 77.6068 },
          { code: '560008', area: 'Halasuru / Ulsoor', lat: 12.9806, lng: 77.6256 },
          { code: '560011', area: 'Jayanagar', lat: 12.9298, lng: 77.5843 },
          { code: '560034', area: 'Koramangala', lat: 12.9352, lng: 77.6244 },
          { code: '560038', area: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
          { code: '560066', area: 'Whitefield', lat: 12.9698, lng: 77.7500 },
          { code: '560076', area: 'BTM Layout', lat: 12.9166, lng: 77.6101 },
          { code: '560102', area: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
          { code: '560103', area: 'Bellandur / ORR', lat: 12.9299, lng: 77.6784 }
        ]
      },
      {
        cityName: 'Mysuru (Mysore)',
        pincodes: [
          { code: '570001', area: 'Mysore H.O', lat: 12.2958, lng: 76.6394 }
        ]
      },
      {
        cityName: 'Hubballi (Hubli)',
        pincodes: [
          { code: '580001', area: 'Hubli H.O', lat: 15.3647, lng: 75.1240 }
        ]
      },
      {
        cityName: 'Mangaluru (Mangalore)',
        pincodes: [
          { code: '575001', area: 'Mangalore H.O', lat: 12.9141, lng: 74.8560 }
        ]
      }
    ]
  },
  {
    stateName: 'Kerala',
    code: 'KL',
    cities: [
      {
        cityName: 'Kochi',
        pincodes: [
          { code: '682001', area: 'Kochi G.P.O.', lat: 9.9700, lng: 76.2800 },
          { code: '682030', area: 'Thevara', lat: 9.9400, lng: 76.2900 }
        ]
      },
      {
        cityName: 'Trivandrum',
        pincodes: [
          { code: '695001', area: 'Trivandrum G.P.O.', lat: 8.5000, lng: 76.9500 }
        ]
      },
      {
        cityName: 'Kozhikode',
        pincodes: [
          { code: '673001', area: 'Calicut H.O', lat: 11.2588, lng: 75.7804 }
        ]
      },
      {
        cityName: 'Thrissur',
        pincodes: [
          { code: '680001', area: 'Thrissur H.O', lat: 10.5276, lng: 76.2144 }
        ]
      }
    ]
  },
  {
    stateName: 'Madhya Pradesh',
    code: 'MP',
    cities: [
      {
        cityName: 'Bhopal',
        pincodes: [
          { code: '462001', area: 'Bhopal G.P.O.', lat: 23.2599, lng: 77.4126 },
          { code: '462016', area: 'Arera Colony', lat: 23.2160, lng: 77.4320 }
        ]
      },
      {
        cityName: 'Indore',
        pincodes: [
          { code: '452001', area: 'Indore H.O', lat: 22.7196, lng: 75.8577 }
        ]
      },
      {
        cityName: 'Gwalior',
        pincodes: [
          { code: '474001', area: 'Gwalior H.O', lat: 26.2183, lng: 78.1828 }
        ]
      },
      {
        cityName: 'Jabalpur',
        pincodes: [
          { code: '482001', area: 'Jabalpur H.O', lat: 23.1815, lng: 79.9864 }
        ]
      }
    ]
  },
  {
    stateName: 'Maharashtra',
    code: 'MH',
    cities: [
      {
        cityName: 'Mumbai',
        pincodes: [
          { code: '400001', area: 'Fort / Colaba', lat: 18.9269, lng: 72.8315 },
          { code: '400020', area: 'Nariman Point', lat: 18.9260, lng: 72.8228 },
          { code: '400050', area: 'Bandra West', lat: 19.0544, lng: 72.8402 },
          { code: '400053', area: 'Andheri West', lat: 19.1200, lng: 72.8256 },
          { code: '400076', area: 'Powai', lat: 19.1176, lng: 72.9060 },
          { code: '400097', area: 'Malad East', lat: 19.1861, lng: 72.8485 }
        ]
      },
      {
        cityName: 'Pune',
        pincodes: [
          { code: '411001', area: 'Pune G.P.O.', lat: 18.5284, lng: 73.8739 },
          { code: '411004', area: 'Deccan Gymkhana', lat: 18.5168, lng: 73.8403 },
          { code: '411007', area: 'Aundh', lat: 18.5580, lng: 73.8075 },
          { code: '411038', area: 'Kothrud', lat: 18.5074, lng: 73.8077 },
          { code: '411045', area: 'Baner', lat: 18.5596, lng: 73.7799 },
          { code: '411057', area: 'Hinjawadi', lat: 18.5913, lng: 73.7389 }
        ]
      },
      {
        cityName: 'Nagpur',
        pincodes: [
          { code: '440001', area: 'Nagpur G.P.O.', lat: 21.1458, lng: 79.0882 }
        ]
      },
      {
        cityName: 'Thane',
        pincodes: [
          { code: '400601', area: 'Thane H.O', lat: 19.2183, lng: 72.9781 }
        ]
      },
      {
        cityName: 'Nashik',
        pincodes: [
          { code: '422001', area: 'Nashik H.O', lat: 20.0050, lng: 73.7890 }
        ]
      }
    ]
  },
  {
    stateName: 'Manipur',
    code: 'MN',
    cities: [
      {
        cityName: 'Imphal',
        pincodes: [
          { code: '795001', area: 'Imphal H.O', lat: 24.8170, lng: 93.9368 }
        ]
      },
      {
        cityName: 'Thoubal',
        pincodes: [
          { code: '795138', area: 'Thoubal', lat: 24.6340, lng: 94.0120 }
        ]
      },
      {
        cityName: 'Churachandpur',
        pincodes: [
          { code: '795128', area: 'Churachandpur H.O', lat: 24.3314, lng: 93.6829 }
        ]
      }
    ]
  },
  {
    stateName: 'Meghalaya',
    code: 'ML',
    cities: [
      {
        cityName: 'Shillong',
        pincodes: [
          { code: '793001', area: 'Shillong G.P.O.', lat: 25.5788, lng: 91.8831 },
          { code: '793003', area: 'Laitumkhrah', lat: 25.5690, lng: 91.8990 }
        ]
      },
      {
        cityName: 'Tura',
        pincodes: [
          { code: '794001', area: 'Tura H.O', lat: 25.5140, lng: 90.2201 }
        ]
      },
      {
        cityName: 'Jowai',
        pincodes: [
          { code: '793150', area: 'Jowai', lat: 25.4410, lng: 92.2030 }
        ]
      }
    ]
  },
  {
    stateName: 'Mizoram',
    code: 'MZ',
    cities: [
      {
        cityName: 'Aizawl',
        pincodes: [
          { code: '796001', area: 'Aizawl H.O', lat: 23.7271, lng: 92.7176 }
        ]
      },
      {
        cityName: 'Lunglei',
        pincodes: [
          { code: '796701', area: 'Lunglei H.O', lat: 22.8870, lng: 92.7380 }
        ]
      },
      {
        cityName: 'Champhai',
        pincodes: [
          { code: '796321', area: 'Champhai', lat: 23.4560, lng: 93.3290 }
        ]
      }
    ]
  },
  {
    stateName: 'Nagaland',
    code: 'NL',
    cities: [
      {
        cityName: 'Kohima',
        pincodes: [
          { code: '797001', area: 'Kohima H.O', lat: 25.6751, lng: 94.1086 }
        ]
      },
      {
        cityName: 'Dimapur',
        pincodes: [
          { code: '797112', area: 'Dimapur H.O', lat: 25.9080, lng: 93.7270 }
        ]
      },
      {
        cityName: 'Mokokchung',
        pincodes: [
          { code: '798601', area: 'Mokokchung H.O', lat: 26.3262, lng: 94.5165 }
        ]
      }
    ]
  },
  {
    stateName: 'Odisha',
    code: 'OR',
    cities: [
      {
        cityName: 'Bhubaneswar',
        pincodes: [
          { code: '751001', area: 'Saheed Nagar H.O', lat: 20.2724, lng: 85.8301 },
          { code: '751009', area: 'Saheed Nagar', lat: 20.2890, lng: 85.8440 }
        ]
      },
      {
        cityName: 'Cuttack',
        pincodes: [
          { code: '753001', area: 'Cuttack H.O', lat: 20.4625, lng: 85.8828 }
        ]
      },
      {
        cityName: 'Rourkela',
        pincodes: [
          { code: '769001', area: 'Rourkela Sector 1', lat: 22.2592, lng: 84.8643 }
        ]
      },
      {
        cityName: 'Puri',
        pincodes: [
          { code: '752001', area: 'Puri H.O', lat: 19.8143, lng: 85.8179 }
        ]
      }
    ]
  },
  {
    stateName: 'Punjab',
    code: 'PB',
    cities: [
      {
        cityName: 'Ludhiana',
        pincodes: [
          { code: '141001', area: 'Ludhiana H.O', lat: 30.9010, lng: 75.8573 }
        ]
      },
      {
        cityName: 'Amritsar',
        pincodes: [
          { code: '143001', area: 'Amritsar H.O', lat: 31.6340, lng: 74.8723 }
        ]
      },
      {
        cityName: 'Jalandhar',
        pincodes: [
          { code: '144001', area: 'Jalandhar H.O', lat: 31.3260, lng: 75.5760 }
        ]
      },
      {
        cityName: 'Patiala',
        pincodes: [
          { code: '147001', area: 'Patiala H.O', lat: 30.3398, lng: 76.3869 }
        ]
      }
    ]
  },
  {
    stateName: 'Rajasthan',
    code: 'RJ',
    cities: [
      {
        cityName: 'Jaipur',
        pincodes: [
          { code: '302001', area: 'Jaipur G.P.O.', lat: 26.9124, lng: 75.7873 },
          { code: '302015', area: 'Malviya Nagar', lat: 26.8530, lng: 75.8047 },
          { code: '302021', area: 'Vaishali Nagar', lat: 26.9076, lng: 75.7381 }
        ]
      },
      {
        cityName: 'Jodhpur',
        pincodes: [
          { code: '342001', area: 'Jodhpur H.O', lat: 26.2389, lng: 73.0243 }
        ]
      },
      {
        cityName: 'Udaipur',
        pincodes: [
          { code: '313001', area: 'Udaipur H.O', lat: 24.5854, lng: 73.7125 }
        ]
      },
      {
        cityName: 'Kota',
        pincodes: [
          { code: '324001', area: 'Kota H.O', lat: 25.1800, lng: 75.8300 }
        ]
      }
    ]
  },
  {
    stateName: 'Sikkim',
    code: 'SK',
    cities: [
      {
        cityName: 'Gangtok',
        pincodes: [
          { code: '737101', area: 'Gangtok H.O', lat: 27.3314, lng: 88.6138 }
        ]
      },
      {
        cityName: 'Namchi',
        pincodes: [
          { code: '737126', area: 'Namchi H.O', lat: 27.1680, lng: 88.3580 }
        ]
      },
      {
        cityName: 'Geyzing',
        pincodes: [
          { code: '737111', area: 'Geyzing H.O', lat: 27.2890, lng: 88.2980 }
        ]
      }
    ]
  },
  {
    stateName: 'Tamil Nadu',
    code: 'TN',
    cities: [
      {
        cityName: 'Chennai',
        pincodes: [
          { code: '600001', area: 'George Town', lat: 13.0940, lng: 80.2882 },
          { code: '600004', area: 'Mylapore', lat: 13.0330, lng: 80.2621 },
          { code: '600017', area: 'T. Nagar', lat: 13.0405, lng: 80.2337 },
          { code: '600020', area: 'Adyar', lat: 13.0063, lng: 80.2574 },
          { code: '600040', area: 'Anna Nagar', lat: 13.0850, lng: 80.2101 },
          { code: '600096', area: 'Perungudi / OMR', lat: 12.9654, lng: 80.2461 }
        ]
      },
      {
        cityName: 'Coimbatore',
        pincodes: [
          { code: '641001', area: 'Coimbatore H.O', lat: 11.0168, lng: 76.9558 }
        ]
      },
      {
        cityName: 'Madurai',
        pincodes: [
          { code: '625001', area: 'Madurai H.O', lat: 9.9252, lng: 78.1198 }
        ]
      },
      {
        cityName: 'Tiruchirappalli',
        pincodes: [
          { code: '620001', area: 'Trichy Fort', lat: 10.8250, lng: 78.6900 }
        ]
      }
    ]
  },
  {
    stateName: 'Telangana',
    code: 'TS',
    cities: [
      {
        cityName: 'Hyderabad',
        pincodes: [
          { code: '500001', area: 'Hyderabad G.P.O.', lat: 17.3850, lng: 78.4867 },
          { code: '500032', area: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
          { code: '500033', area: 'Jubilee Hills', lat: 17.4325, lng: 78.4071 },
          { code: '500081', area: 'Madhapur / HITEC City', lat: 17.4483, lng: 78.3741 },
          { code: '500082', area: 'Kondapur', lat: 17.4699, lng: 78.3578 }
        ]
      },
      {
        cityName: 'Warangal',
        pincodes: [
          { code: '506001', area: 'Warangal H.O', lat: 17.9784, lng: 79.5941 }
        ]
      },
      {
        cityName: 'Nizamabad',
        pincodes: [
          { code: '503001', area: 'Nizamabad H.O', lat: 18.6725, lng: 78.0941 }
        ]
      }
    ]
  },
  {
    stateName: 'Tripura',
    code: 'TR',
    cities: [
      {
        cityName: 'Agartala',
        pincodes: [
          { code: '799001', area: 'Agartala H.O', lat: 23.8315, lng: 91.2868 }
        ]
      },
      {
        cityName: 'Dharmanagar',
        pincodes: [
          { code: '799250', area: 'Dharmanagar H.O', lat: 24.3667, lng: 92.1667 }
        ]
      },
      {
        cityName: 'Udaipur',
        pincodes: [
          { code: '799120', area: 'Udaipur H.O', lat: 23.5333, lng: 91.4833 }
        ]
      }
    ]
  },
  {
    stateName: 'Uttarakhand',
    code: 'UK',
    cities: [
      {
        cityName: 'Dehradun',
        pincodes: [
          { code: '248001', area: 'Dehradun G.P.O.', lat: 30.3165, lng: 78.0322 },
          { code: '248006', area: 'Rajpur Road', lat: 30.3450, lng: 78.0580 }
        ]
      },
      {
        cityName: 'Haridwar',
        pincodes: [
          { code: '249401', area: 'Haridwar H.O', lat: 29.9450, lng: 78.1640 }
        ]
      },
      {
        cityName: 'Rishikesh',
        pincodes: [
          { code: '249201', area: 'Rishikesh H.O', lat: 30.1033, lng: 78.2947 }
        ]
      }
    ]
  },
  {
    stateName: 'Uttar Pradesh',
    code: 'UP',
    cities: [
      {
        cityName: 'Noida',
        pincodes: [
          { code: '201301', area: 'Sector 62', lat: 28.6253, lng: 77.3725 },
          { code: '201305', area: 'Sector 15', lat: 28.5800, lng: 77.3100 }
        ]
      },
      {
        cityName: 'Lucknow',
        pincodes: [
          { code: '226001', area: 'Hazratganj', lat: 26.8500, lng: 80.9499 },
          { code: '226010', area: 'Gomti Nagar', lat: 26.8600, lng: 81.0000 }
        ]
      },
      {
        cityName: 'Kanpur',
        pincodes: [
          { code: '208001', area: 'Kanpur G.P.O.', lat: 26.4499, lng: 80.3319 }
        ]
      },
      {
        cityName: 'Agra',
        pincodes: [
          { code: '282001', area: 'Agra Fort', lat: 27.1800, lng: 78.0200 }
        ]
      },
      {
        cityName: 'Varanasi',
        pincodes: [
          { code: '221001', area: 'Varanasi Cantt', lat: 25.3176, lng: 82.9739 }
        ]
      }
    ]
  },
  {
    stateName: 'West Bengal',
    code: 'WB',
    cities: [
      {
        cityName: 'Kolkata',
        pincodes: [
          { code: '700001', area: 'B.B.D. Bagh', lat: 22.5714, lng: 88.3486 },
          { code: '700019', area: 'Ballygunge', lat: 22.5278, lng: 88.3658 },
          { code: '700091', area: 'Salt Lake Sector V', lat: 22.5735, lng: 88.4331 },
          { code: '700156', area: 'New Town Action Area I', lat: 22.5804, lng: 88.4578 }
        ]
      },
      {
        cityName: 'Siliguri',
        pincodes: [
          { code: '734001', area: 'Siliguri H.O', lat: 26.7271, lng: 88.3953 }
        ]
      },
      {
        cityName: 'Asansol',
        pincodes: [
          { code: '713301', area: 'Asansol H.O', lat: 23.6740, lng: 86.9520 }
        ]
      }
    ]
  },
  {
    stateName: 'Chandigarh (UT)',
    code: 'CH',
    cities: [
      {
        cityName: 'Chandigarh',
        pincodes: [
          { code: '160017', area: 'Sector 17', lat: 30.7410, lng: 76.7820 }
        ]
      }
    ]
  },
  {
    stateName: 'Puducherry (UT)',
    code: 'PY',
    cities: [
      {
        cityName: 'Pondicherry',
        pincodes: [
          { code: '605001', area: 'Pondicherry H.O', lat: 11.9416, lng: 79.8083 }
        ]
      }
    ]
  },
  {
    stateName: 'Andaman and Nicobar (UT)',
    code: 'AN',
    cities: [
      {
        cityName: 'Port Blair',
        pincodes: [
          { code: '744101', area: 'Port Blair H.O', lat: 11.6234, lng: 92.7265 }
        ]
      }
    ]
  },
  {
    stateName: 'Ladakh (UT)',
    code: 'LA',
    cities: [
      {
        cityName: 'Leh',
        pincodes: [
          { code: '194101', area: 'Leh H.O', lat: 34.1526, lng: 77.5771 }
        ]
      }
    ]
  }
];

export function findLocationByQuery(query: string): PincodeRecord[] {
  if (!query) return [];
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < 2) return [];

  return INDIA_LOCATIONS.filter(item => 
    item.pincode.startsWith(cleanQuery) ||
    item.officeName.toLowerCase().includes(cleanQuery) ||
    item.district.toLowerCase().includes(cleanQuery) ||
    item.state.toLowerCase().includes(cleanQuery)
  );
}
