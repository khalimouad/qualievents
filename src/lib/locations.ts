export interface City {
  name: string;
  lat?: number;
  lng?: number;
}

export interface Country {
  code: string;
  name: string;
  dial?: string;
  cities: City[];
}

export const LOCATIONS: Country[] = [
  {
    code: "CI",
    name: "Côte d'Ivoire",
    dial: "+225",
    cities: [
      { name: "Abidjan", lat: 5.3454, lng: -3.9654 },
      { name: "Yamoussoukro", lat: 6.8276, lng: -5.2893 },
      { name: "Bouaké", lat: 7.694, lng: -5.0304 },
      { name: "Daloa", lat: 6.8786, lng: -6.4501 },
      { name: "San-Pédro", lat: 4.7487, lng: -6.6348 },
    ],
  },
  {
    code: "SN",
    name: "Sénégal",
    dial: "+221",
    cities: [
      { name: "Dakar", lat: 14.6972, lng: -17.4431 },
      { name: "Thiès", lat: 14.7928, lng: -16.9254 },
      { name: "Kaolack", lat: 13.1667, lng: -15.3333 },
      { name: "Tambacounda", lat: 13.7754, lng: -13.7711 },
      { name: "Saint-Louis", lat: 16.0167, lng: -16.4833 },
    ],
  },
  {
    code: "ML",
    name: "Mali",
    dial: "+223",
    cities: [
      { name: "Bamako", lat: 12.6395, lng: -8.0029 },
      { name: "Kayes", lat: 13.945, lng: -11.4386 },
      { name: "Koulikoro", lat: 12.6552, lng: -8.0049 },
      { name: "Ségou", lat: 13.4549, lng: -6.1924 },
      { name: "Gao", lat: 16.2742, lng: -0.0425 },
    ],
  },
  {
    code: "BF",
    name: "Burkina Faso",
    dial: "+226",
    cities: [
      { name: "Ouagadougou", lat: 12.3656, lng: -1.5197 },
      { name: "Bobo-Dioulasso", lat: 11.1847, lng: -4.2974 },
      { name: "Koudougou", lat: 12.2545, lng: -2.6289 },
      { name: "Ouahigouya", lat: 13.5833, lng: -2.4333 },
    ],
  },
  {
    code: "GH",
    name: "Ghana",
    dial: "+233",
    cities: [
      { name: "Accra", lat: 5.6037, lng: -0.187 },
      { name: "Kumasi", lat: 6.7275, lng: -1.6236 },
      { name: "Tamale", lat: 9.4167, lng: -0.8333 },
      { name: "Sekondi-Takoradi", lat: 4.9333, lng: -2.2167 },
      { name: "Cape Coast", lat: 5.1033, lng: -1.2458 },
    ],
  },
  {
    code: "TG",
    name: "Togo",
    dial: "+228",
    cities: [
      { name: "Lomé", lat: 6.1256, lng: 1.2317 },
      { name: "Sokodé", lat: 8.9833, lng: 1.15 },
      { name: "Kara", lat: 9.5333, lng: 1.2333 },
      { name: "Atakpamé", lat: 7.75, lng: 1.0833 },
    ],
  },
  {
    code: "BJ",
    name: "Bénin",
    dial: "+229",
    cities: [
      { name: "Cotonou", lat: 6.4969, lng: 2.6289 },
      { name: "Porto-Novo", lat: 6.4947, lng: 2.6289 },
      { name: "Abomey", lat: 7.1903, lng: 1.9948 },
      { name: "Parakou", lat: 9.3417, lng: 2.6247 },
      { name: "Natitingou", lat: 10.3067, lng: 1.3833 },
    ],
  },
  {
    code: "NE",
    name: "Niger",
    dial: "+227",
    cities: [
      { name: "Niamey", lat: 13.5116, lng: 2.1257 },
      { name: "Maradi", lat: 13.5, lng: 7.1 },
      { name: "Zinder", lat: 13.7708, lng: 8.9833 },
      { name: "Agadez", lat: 16.9833, lng: 7.9833 },
    ],
  },
  {
    code: "NG",
    name: "Nigeria",
    dial: "+234",
    cities: [
      { name: "Lagos", lat: 6.5244, lng: 3.3792 },
      { name: "Abuja", lat: 9.0765, lng: 7.3986 },
      { name: "Kano", lat: 12.0022, lng: 8.6753 },
      { name: "Ibadan", lat: 7.3778, lng: 3.8964 },
      { name: "Port-Harcourt", lat: 4.7661, lng: 7.0114 },
    ],
  },
  {
    code: "CM",
    name: "Cameroun",
    dial: "+237",
    cities: [
      { name: "Yaoundé", lat: 3.8667, lng: 11.5167 },
      { name: "Douala", lat: 4.0511, lng: 9.7679 },
      { name: "Bamenda", lat: 5.9631, lng: 10.1591 },
      { name: "Buea", lat: 4.1557, lng: 9.2417 },
    ],
  },
  {
    code: "GA",
    name: "Gabon",
    dial: "+241",
    cities: [
      { name: "Libreville", lat: 0.4162, lng: 9.4673 },
      { name: "Port-Gentil", lat: -0.7193, lng: 8.7815 },
      { name: "Franceville", lat: -1.6281, lng: 13.6018 },
      { name: "Oyem", lat: 1.59, lng: 11.57 },
    ],
  },
  {
    code: "CG",
    name: "Congo",
    dial: "+242",
    cities: [
      { name: "Brazzaville", lat: -4.2634, lng: 15.2429 },
      { name: "Pointe-Noire", lat: -4.7731, lng: 11.8659 },
      { name: "Dolisie", lat: -4.1948, lng: 12.6728 },
      { name: "Ouésso", lat: 1.8248, lng: 14.5583 },
    ],
  },
  {
    code: "CD",
    name: "RDC (Congo-Kinshasa)",
    dial: "+243",
    cities: [
      { name: "Kinshasa", lat: -4.2634, lng: 15.2429 },
      { name: "Lubumbashi", lat: -11.6704, lng: 27.4791 },
      { name: "Mbuji-Mayi", lat: -6.8145, lng: 23.5899 },
      { name: "Goma", lat: -1.6779, lng: 29.2203 },
      { name: "Bukavu", lat: -2.5012, lng: 28.8445 },
    ],
  },
  {
    code: "AO",
    name: "Angola",
    dial: "+244",
    cities: [
      { name: "Luanda", lat: -8.8383, lng: 13.2344 },
      { name: "Huambo", lat: -12.7767, lng: 15.7942 },
      { name: "Benguela", lat: -12.5744, lng: 13.405 },
      { name: "Lubango", lat: -14.9239, lng: 13.4948 },
    ],
  },
  {
    code: "ZA",
    name: "Afrique du Sud",
    dial: "+27",
    cities: [
      { name: "Johannesburg", lat: -26.2023, lng: 28.0436 },
      { name: "Le Cap", lat: -33.9249, lng: 18.4241 },
      { name: "Durban", lat: -29.8587, lng: 31.0218 },
      { name: "Pretoria", lat: -25.7482, lng: 28.2293 },
      { name: "Port Elizabeth", lat: -33.9841, lng: 25.6053 },
    ],
  },
  {
    code: "KE",
    name: "Kenya",
    dial: "+254",
    cities: [
      { name: "Nairobi", lat: -1.2866, lng: 36.8172 },
      { name: "Mombasa", lat: -4.0435, lng: 39.6682 },
      { name: "Kisumu", lat: -0.1023, lng: 34.7617 },
      { name: "Nakuru", lat: -0.2833, lng: 36.0667 },
    ],
  },
  {
    code: "TZ",
    name: "Tanzanie",
    dial: "+255",
    cities: [
      { name: "Dar es Salaam", lat: -6.7924, lng: 39.2083 },
      { name: "Dodoma", lat: -6.1719, lng: 35.7395 },
      { name: "Arusha", lat: -3.3667, lng: 36.6833 },
      { name: "Mbeya", lat: -8.75, lng: 35.3333 },
    ],
  },
  {
    code: "UG",
    name: "Ouganda",
    dial: "+256",
    cities: [
      { name: "Kampala", lat: 0.3476, lng: 32.5825 },
      { name: "Gulu", lat: 2.7788, lng: 32.3007 },
      { name: "Mbarara", lat: -0.6103, lng: 29.6345 },
      { name: "Arua", lat: 3.0267, lng: 30.92 },
    ],
  },
  {
    code: "RW",
    name: "Rwanda",
    dial: "+250",
    cities: [
      { name: "Kigali", lat: -1.9536, lng: 29.8739 },
      { name: "Butare", lat: -2.5933, lng: 29.7408 },
      { name: "Ruhengeri", lat: -1.5027, lng: 29.6222 },
    ],
  },
  {
    code: "BI",
    name: "Burundi",
    dial: "+257",
    cities: [
      { name: "Bujumbura", lat: -3.3731, lng: 29.3585 },
      { name: "Gitega", lat: -3.4306, lng: 29.9284 },
      { name: "Ngozi", lat: -2.4833, lng: 29.95 },
    ],
  },
  {
    code: "ET",
    name: "Éthiopie",
    dial: "+251",
    cities: [
      { name: "Addis-Abeba", lat: 9.0765, lng: 38.7469 },
      { name: "Dire Dawa", lat: 9.5500, lng: 41.8500 },
      { name: "Awasa", lat: 5.0500, lng: 42.5500 },
    ],
  },
  {
    code: "SO",
    name: "Somalie",
    dial: "+252",
    cities: [
      { name: "Mogadiscio", lat: 2.0469, lng: 45.3182 },
      { name: "Hargeisa", lat: 9.5, lng: 44.4 },
      { name: "Bosaso", lat: 11.2833, lng: 49.1833 },
    ],
  },
  {
    code: "DJ",
    name: "Djibouti",
    dial: "+253",
    cities: [
      { name: "Djibouti-ville", lat: 11.5964, lng: 43.1431 },
      { name: "Ali Sabieh", lat: 11.1447, lng: 42.7311 },
    ],
  },
  {
    code: "ER",
    name: "Érythrée",
    dial: "+291",
    cities: [
      { name: "Asmara", lat: 15.3375, lng: 38.9373 },
      { name: "Massaoua", lat: 15.6419, lng: 39.4519 },
    ],
  },
  {
    code: "SD",
    name: "Soudan",
    dial: "+249",
    cities: [
      { name: "Khartoum", lat: 15.5007, lng: 32.5599 },
      { name: "Omdurman", lat: 15.6513, lng: 32.4801 },
      { name: "Port-Soudan", lat: 19.6167, lng: 37.2167 },
    ],
  },
  {
    code: "EG",
    name: "Égypte",
    dial: "+20",
    cities: [
      { name: "Le Caire", lat: 30.0444, lng: 31.2357 },
      { name: "Alexandrie", lat: 31.2001, lng: 29.9187 },
      { name: "Giza", lat: 30.0131, lng: 31.1898 },
      { name: "Louxor", lat: 25.6872, lng: 32.6396 },
      { name: "Assouan", lat: 24.0889, lng: 32.8998 },
    ],
  },
  {
    code: "MA",
    name: "Maroc",
    dial: "+212",
    cities: [
      { name: "Casablanca", lat: 33.5731, lng: -7.5898 },
      { name: "Fès", lat: 34.0731, lng: -5.0036 },
      { name: "Marrakech", lat: 31.6295, lng: -8.0088 },
      { name: "Rabat", lat: 34.0209, lng: -6.8416 },
      { name: "Tanger", lat: 35.7595, lng: -5.8341 },
    ],
  },
  {
    code: "DZ",
    name: "Algérie",
    dial: "+213",
    cities: [
      { name: "Alger", lat: 36.7372, lng: 3.0869 },
      { name: "Oran", lat: 35.6969, lng: -0.6348 },
      { name: "Constantine", lat: 36.3553, lng: 6.6147 },
      { name: "Annaba", lat: 36.9056, lng: 7.7596 },
      { name: "Blida", lat: 36.4733, lng: 2.8286 },
    ],
  },
  {
    code: "TN",
    name: "Tunisie",
    dial: "+216",
    cities: [
      { name: "Tunis", lat: 36.8065, lng: 10.1815 },
      { name: "Sfax", lat: 34.7406, lng: 10.7603 },
      { name: "Sousse", lat: 35.8256, lng: 10.6369 },
      { name: "Kairouan", lat: 35.6711, lng: 10.1062 },
    ],
  },
  {
    code: "LY",
    name: "Libye",
    dial: "+218",
    cities: [
      { name: "Tripoli", lat: 32.8872, lng: 13.1913 },
      { name: "Benghazi", lat: 32.1171, lng: 20.0631 },
      { name: "Misrata", lat: 32.3754, lng: 15.0915 },
    ],
  },
  {
    code: "FR",
    name: "France",
    dial: "+33",
    cities: [
      { name: "Paris", lat: 48.8566, lng: 2.3522 },
      { name: "Marseille", lat: 43.2965, lng: 5.3698 },
      { name: "Lyon", lat: 45.7642, lng: 4.8357 },
      { name: "Toulouse", lat: 43.6047, lng: 1.4442 },
      { name: "Nice", lat: 43.7102, lng: 7.262 },
      { name: "Nantes", lat: 47.2184, lng: -1.5536 },
      { name: "Strasbourg", lat: 48.5734, lng: 7.7521 },
      { name: "Bordeaux", lat: 44.8378, lng: -0.5792 },
      { name: "Lille", lat: 50.6292, lng: 3.0573 },
      { name: "Rennes", lat: 48.1113, lng: -1.6800 },
    ],
  },
  {
    code: "BE",
    name: "Belgique",
    dial: "+32",
    cities: [
      { name: "Bruxelles", lat: 50.8503, lng: 4.3517 },
      { name: "Anvers", lat: 51.2194, lng: 4.4025 },
      { name: "Gand", lat: 51.0538, lng: 3.7196 },
      { name: "Charleroi", lat: 50.4114, lng: 4.4446 },
      { name: "Liège", lat: 50.6292, lng: 5.5673 },
    ],
  },
  {
    code: "LU",
    name: "Luxembourg",
    dial: "+352",
    cities: [
      { name: "Luxembourg-ville", lat: 49.6116, lng: 6.1319 },
      { name: "Esch-sur-Alzette", lat: 49.4833, lng: 5.9833 },
    ],
  },
  {
    code: "CH",
    name: "Suisse",
    dial: "+41",
    cities: [
      { name: "Zurich", lat: 47.3769, lng: 8.5472 },
      { name: "Genève", lat: 46.2044, lng: 6.1432 },
      { name: "Bâle", lat: 47.5596, lng: 7.5886 },
      { name: "Berne", lat: 46.9479, lng: 7.4474 },
      { name: "Lausanne", lat: 46.5197, lng: 6.6323 },
    ],
  },
  {
    code: "MC",
    name: "Monaco",
    dial: "+377",
    cities: [
      { name: "Monaco-Ville", lat: 43.7384, lng: 7.4246 },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    dial: "+1",
    cities: [
      { name: "Toronto", lat: 43.6532, lng: -79.3832 },
      { name: "Montréal", lat: 45.5017, lng: -73.5673 },
      { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
      { name: "Ottawa", lat: 45.4215, lng: -75.6972 },
      { name: "Calgary", lat: 51.0447, lng: -114.0719 },
    ],
  },
  {
    code: "HT",
    name: "Haïti",
    dial: "+509",
    cities: [
      { name: "Port-au-Prince", lat: 18.9712, lng: -72.2852 },
      { name: "Cap-Haïtien", lat: 19.7591, lng: -72.1917 },
      { name: "Les Cayes", lat: 18.2039, lng: -73.7534 },
      { name: "Jérémie", lat: 18.6485, lng: -74.1159 },
    ],
  },
];
