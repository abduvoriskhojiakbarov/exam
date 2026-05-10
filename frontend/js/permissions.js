const permissions = {
  ADMIN: {
    dashboard: 'Admin foydalanuvchilar, kurslar, modullar, darslar, vazifalar va barcha natijalarni boshqara oladi.',
    auth: "Siz admin sifatida tizimga kirgansiz. Boshqa rol sinashda bu yerda hisob almashtiring.",
    courses: "Admin barcha kurslarni yaratishi, yangilashi va o'chirishi mumkin.",
    learning: "Admin istalgan kurs uchun modul va darslar yarata oladi.",
    assignments: "Admin vazifalarni baholashi mumkin.",
    results: "Admin barcha natijalarni yuklay oladi.",
    users: "Admin foydalanuvchilarni yuklab boshqara oladi."
  },
  TEACHER: {
    dashboard: "O'qituvchi o'z kurslarini, modul va darslarni yarata oladi va vazifalarni baholashi mumkin.",
    auth: "Siz o'qituvchi sifatida tizimga kirgansiz. Faqat talaba amallari uchun hisob almashtiring.",
    courses: "O'qituvchi kurs yaratishi va faqat o'z kurslarini boshqara oladi.",
    learning: "O'qituvchi o'z kurslari uchun modul va darslar yarata oladi.",
    assignments: "O'qituvchi o'z kurslari uchun vazifalarni baholashi mumkin.",
    results: "O'qituvchi barcha natijalarni yuklay oladi.",
    users: "Faqat admin foydalanuvchilarni yuklay oladi."
  },
  STUDENT: {
    dashboard: "Talaba kurslarga yozilishi, darslarni ko'rishi, vazifalar topshirishi va o'z natijalarini ko'rishi mumkin.",
    auth: "Siz talaba sifatida tizimga kirgansiz. O'qituvchi/admin amallari uchun hisob almashtiring.",
    courses: "Talaba kurslarni ko'rishi mumkin, lekin kurs yarata olmaydi.",
    learning: "Modul yoki darslarni ko'rish uchun avval kursga yozilish kerak.",
    assignments: "Talaba o'z vazifalarini topshirishi va ko'rishi mumkin.",
    results: "Talaba faqat o'z natijalarini yuklay oladi.",
    users: "Faqat admin foydalanuvchilarni yuklay oladi."
  },
  GUEST: {
    dashboard: "Avval tizimga kiring. Auth sahifasiga o'ting va kerakli rolni tanlang.",
    auth: "Kiring yoki ro'yxatdan o'ting. O'qituvchi kontent yaratadi, talaba yoziladi/topshiradi, admin foydalanuvchilarni boshqaradi.",
    courses: "Mehmonlar faqat ochiq kurslarni ko'rishi mumkin.",
    learning: "Kurs kontentidan foydalanish uchun avval tizimga kiring.",
    assignments: "Vazifalardan foydalanish uchun avval tizimga kiring.",
    results: "Natijalarni ko'rish uchun avval tizimga kiring.",
    users: "Foydalanuvchilarni ko'rish uchun admin sifatida kiring."
  }
};