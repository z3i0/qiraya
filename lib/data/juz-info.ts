export interface JuzMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  startSurahNumber: number;
  startSurahNameArabic: string;
  startSurahNameEnglish: string;
  startAyahNumber: number;
}

export const JUZ_LIST: JuzMeta[] = [
  { number: 1, nameArabic: "الم", nameEnglish: "Alif Lam Meem", startSurahNumber: 1, startSurahNameArabic: "الفاتحة", startSurahNameEnglish: "Al-Fatiha", startAyahNumber: 1 },
  { number: 2, nameArabic: "سيقول", nameEnglish: "Sayaqool", startSurahNumber: 2, startSurahNameArabic: "البقرة", startSurahNameEnglish: "Al-Baqarah", startAyahNumber: 142 },
  { number: 3, nameArabic: "تلك الرسل", nameEnglish: "Tilka ar-Rusul", startSurahNumber: 2, startSurahNameArabic: "البقرة", startSurahNameEnglish: "Al-Baqarah", startAyahNumber: 253 },
  { number: 4, nameArabic: "لن تنالوا", nameEnglish: "Lan Tanaaloo", startSurahNumber: 3, startSurahNameArabic: "آل عمران", startSurahNameEnglish: "Ali 'Imran", startAyahNumber: 93 },
  { number: 5, nameArabic: "والمحصنات", nameEnglish: "Wal-Muhsanat", startSurahNumber: 4, startSurahNameArabic: "النساء", startSurahNameEnglish: "An-Nisa", startAyahNumber: 24 },
  { number: 6, nameArabic: "لا يحب الله", nameEnglish: "La Yuhibbullah", startSurahNumber: 4, startSurahNameArabic: "النساء", startSurahNameEnglish: "An-Nisa", startAyahNumber: 148 },
  { number: 7, nameArabic: "وإذا سمعوا", nameEnglish: "Wa Iza Sami'oo", startSurahNumber: 5, startSurahNameArabic: "المائدة", startSurahNameEnglish: "Al-Ma'idah", startAyahNumber: 82 },
  { number: 8, nameArabic: "ولو أننا", nameEnglish: "Wa Law Annana", startSurahNumber: 6, startSurahNameArabic: "الأنعام", startSurahNameEnglish: "Al-An'am", startAyahNumber: 111 },
  { number: 9, nameArabic: "قال الملأ", nameEnglish: "Qal al-Mala'u", startSurahNumber: 7, startSurahNameArabic: "الأعراف", startSurahNameEnglish: "Al-A'raf", startAyahNumber: 88 },
  { number: 10, nameArabic: "واعلموا", nameEnglish: "Wa A'lamoo", startSurahNumber: 8, startSurahNameArabic: "الأنفال", startSurahNameEnglish: "Al-Anfal", startAyahNumber: 41 },
  { number: 11, nameArabic: "يعتذرون", nameEnglish: "Ya'taziroona", startSurahNumber: 9, startSurahNameArabic: "التوبة", startSurahNameEnglish: "At-Tawbah", startAyahNumber: 93 },
  { number: 12, nameArabic: "وما من دابة", nameEnglish: "Wa Ma Min Dabbah", startSurahNumber: 11, startSurahNameArabic: "هود", startSurahNameEnglish: "Hud", startAyahNumber: 6 },
  { number: 13, nameArabic: "وما أبرئ", nameEnglish: "Wa Ma Oobari'u", startSurahNumber: 12, startSurahNameArabic: "يوسف", startSurahNameEnglish: "Yusuf", startAyahNumber: 53 },
  { number: 14, nameArabic: "ربما", nameEnglish: "Rubama", startSurahNumber: 15, startSurahNameArabic: "الحجر", startSurahNameEnglish: "Al-Hijr", startAyahNumber: 1 },
  { number: 15, nameArabic: "سبحان الذي", nameEnglish: "Subhan allazi", startSurahNumber: 17, startSurahNameArabic: "الإسراء", startSurahNameEnglish: "Al-Isra", startAyahNumber: 1 },
  { number: 16, nameArabic: "قال ألم", nameEnglish: "Qala Alam", startSurahNumber: 18, startSurahNameArabic: "الكهف", startSurahNameEnglish: "Al-Kahf", startAyahNumber: 75 },
  { number: 17, nameArabic: "اقترب", nameEnglish: "Iqtaraba", startSurahNumber: 21, startSurahNameArabic: "الأنبياء", startSurahNameEnglish: "Al-Anbiya", startAyahNumber: 1 },
  { number: 18, nameArabic: "قد أفلح", nameEnglish: "Qad Aflaha", startSurahNumber: 23, startSurahNameArabic: "المؤمنون", startSurahNameEnglish: "Al-Mu'minun", startAyahNumber: 1 },
  { number: 19, nameArabic: "وقال الذين", nameEnglish: "Wa Qal allazina", startSurahNumber: 25, startSurahNameArabic: "الفرقان", startSurahNameEnglish: "Al-Furqan", startAyahNumber: 21 },
  { number: 20, nameArabic: "فما كان", nameEnglish: "Fa Ma Kana", startSurahNumber: 27, startSurahNameArabic: "النمل", startSurahNameEnglish: "An-Naml", startAyahNumber: 56 },
  { number: 21, nameArabic: "ولا تجادلوا", nameEnglish: "Wa La Tujadiloo", startSurahNumber: 29, startSurahNameArabic: "العنكبوت", startSurahNameEnglish: "Al-'Ankabut", startAyahNumber: 46 },
  { number: 22, nameArabic: "ومن يقنت", nameEnglish: "Wa Man Yaqnut", startSurahNumber: 33, startSurahNameArabic: "الأحزاب", startSurahNameEnglish: "Al-Ahzab", startAyahNumber: 31 },
  { number: 23, nameArabic: "وما أنزلنا", nameEnglish: "Wa Ma Anzalna", startSurahNumber: 36, startSurahNameArabic: "يس", startSurahNameEnglish: "Ya-Sin", startAyahNumber: 28 },
  { number: 24, nameArabic: "فمن أظلم", nameEnglish: "Faman Azlamu", startSurahNumber: 39, startSurahNameArabic: "الزمر", startSurahNameEnglish: "Az-Zumar", startAyahNumber: 32 },
  { number: 25, nameArabic: "إليه يرد", nameEnglish: "Ilayhi Yuraddu", startSurahNumber: 41, startSurahNameArabic: "فصلت", startSurahNameEnglish: "Fussilat", startAyahNumber: 47 },
  { number: 26, nameArabic: "حم", nameEnglish: "Ha Meem", startSurahNumber: 46, startSurahNameArabic: "الأحقاف", startSurahNameEnglish: "Al-Ahqaf", startAyahNumber: 1 },
  { number: 27, nameArabic: "قال فما خطبكم", nameEnglish: "Qala Fama Khatbukum", startSurahNumber: 51, startSurahNameArabic: "الذاريات", startSurahNameEnglish: "Adh-Dhariyat", startAyahNumber: 31 },
  { number: 28, nameArabic: "قد سمع الله", nameEnglish: "Qad Sami'a Allahu", startSurahNumber: 58, startSurahNameArabic: "المجادلة", startSurahNameEnglish: "Al-Mujadila", startAyahNumber: 1 },
  { number: 29, nameArabic: "تبارك الذي", nameEnglish: "Tabarak allazi", startSurahNumber: 67, startSurahNameArabic: "الملك", startSurahNameEnglish: "Al-Mulk", startAyahNumber: 1 },
  { number: 30, nameArabic: "عمّ", nameEnglish: "'Amma", startSurahNumber: 78, startSurahNameArabic: "النبأ", startSurahNameEnglish: "An-Naba", startAyahNumber: 1 },
];
