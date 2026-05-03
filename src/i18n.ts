export type Locale = 'en' | 'tl' | 'ru' | 'uk' | 'hi';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  tl: 'Filipino',
  ru: 'Русский',
  uk: 'Українська',
  hi: 'हिंदी',
};

const translations = {
  en: {
    appName: 'Marine ROB',
    tagline: 'Built for the people who keep ships moving',
    overview: 'Overview',
    tanks: 'Tanks',
    log: 'Log',
    crew: 'Crew',
    settings: 'Settings',

    totalROB: 'Total Fuel ROB',
    fuelEndurance: 'Fuel Endurance',

    daysRemaining: 'days remaining',
    daysPassed: 'days passed',

    addTank: 'Add Tank',
    save: 'Save',
    saved: 'Saved!',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',

    contractProgress: 'Contract Progress',
    vesselName: 'Vessel Name',
    rank: 'Rank / Position',

    contractDays: 'Contract Days',
    signOnDate: 'Sign-on Date',
    daysPassedManual: 'Days Passed (manual)',

    finishContract: 'Finish Contract',
    contractHistory: 'Contract History',

    earnedSoFar: 'Earned So Far',
    stillToEarn: 'Still to Earn',
    totalEarnings: 'Total Contract Earnings',

    monthlySalary: 'Monthly Salary',
    currency: 'Currency',
    dailyRate: 'Daily rate',

    removeAds: 'Remove Ads',
    removeAdsPrice: 'Remove Ads — $4.99',
    removeAdsDesc: 'One-time purchase. No subscription.',

    unlock: 'Unlock — $4.99',

    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeSystem: 'System',

    language: 'Language',
    shareApp: 'Share App',
    shareReport: 'Share ROB Report',

    telegram: 'Telegram',
    copyShare: 'Copy / Share',

    bunkerLog: 'Bunker Log',
    consumption: 'Consumption',

    previousROB: 'Previous ROB (MT)',
    currentROB: 'Current ROB (MT)',
    saveEntry: 'Save Entry',

    port: 'Port',
    quantity: 'Quantity (MT)',
    density: 'Density (t/m³)',
    note: 'Note (optional)',
    logBunker: 'Log Bunker',

    recentLog: 'Recent Log',
    bunkerHistory: 'Bunker History',

    noTanks: 'No tanks added yet',
    addFirst: 'Tap "Add Tank" to start',

    tankName: 'Tank Name',
    volume: 'Volume (m³)',
    calcMass: 'Calculated Mass',

    msg0: 'Early days — settle in 🚢',
    msg25: 'Quarter done, stay sharp ⚓',
    msg50: 'Halfway home! 💪',
    msg75: 'Three quarters done 🌊',
    msg90: 'Almost there, hold on! ⭐',
    msg100: 'Last day — you made it! 🎉',

    adLabel: 'Advertisement',
    adSpace: '[ Ad Space ]',

    settingsTitle: 'Settings',
    dataInfo: 'All data stays on this device only.',

    version: 'Version 2.1',
    contactUs: 'Contact / Feedback',

    avgConsumption: 'Avg daily consumption (MT/day)',
    enduranceDays: 'days endurance',
  },

  ru: {
    appName: 'Marine ROB',
    tagline: 'Для тех, кто держит курс',

    overview: 'Обзор',
    tanks: 'Танки',
    log: 'Журнал',
    crew: 'Экипаж',
    settings: 'Настройки',

    totalROB: 'Общий ROB топлива',
    fuelEndurance: 'Запас топлива',

    daysRemaining: 'дней осталось',
    daysPassed: 'дней прошло',

    addTank: 'Добавить танк',
    save: 'Сохранить',
    saved: 'Сохранено!',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Изменить',

    contractProgress: 'Прогресс контракта',
    vesselName: 'Название судна',
    rank: 'Должность',

    contractDays: 'Дней контракта',
    signOnDate: 'Дата начала',
    daysPassedManual: 'Прошло дней (вручную)',

    finishContract: 'Завершить контракт',
    contractHistory: 'История контрактов',

    earnedSoFar: 'Заработано',
    stillToEarn: 'Ещё заработаю',
    totalEarnings: 'Общий заработок',

    monthlySalary: 'Зарплата в месяц',
    currency: 'Валюта',
    dailyRate: 'Дневная ставка',

    removeAds: 'Убрать рекламу',
    removeAdsPrice: 'Убрать рекламу — $4.99',
    removeAdsDesc: 'Разовая покупка. Без подписки.',

    unlock: 'Разблокировать — $4.99',

    theme: 'Тема',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',
    themeSystem: 'Системная',

    language: 'Язык',
    shareApp: 'Поделиться приложением',
    shareReport: 'Поделиться отчётом ROB',

    telegram: 'Telegram',
    copyShare: 'Копировать / Поделиться',

    bunkerLog: 'Журнал бункеровки',
    consumption: 'Расход',

    previousROB: 'Предыдущий ROB (МТ)',
    currentROB: 'Текущий ROB (МТ)',
    saveEntry: 'Сохранить запись',

    port: 'Порт',
    quantity: 'Количество (МТ)',
    density: 'Плотность (т/м³)',
    note: 'Примечание (необязательно)',
    logBunker: 'Записать бункеровку',

    recentLog: 'Последние записи',
    bunkerHistory: 'История бункеровок',

    noTanks: 'Танки ещё не добавлены',
    addFirst: 'Нажмите "Добавить танк"',

    tankName: 'Название танка',
    volume: 'Объём (м³)',
    calcMass: 'Расчётная масса',

    msg0: 'Начало контракта — обустраивайтесь 🚢',
    msg25: 'Четверть позади ⚓',
    msg50: 'Полпути! 💪',
    msg75: 'Три четверти позади 🌊',
    msg90: 'Почти дома, держись! ⭐',
    msg100: 'Последний день — ты справился! 🎉',

    adLabel: 'Реклама',
    adSpace: '[ Место для рекламы ]',

    settingsTitle: 'Настройки',
    dataInfo: 'Все данные хранятся только на устройстве.',

    version: 'Версия 2.1',
    contactUs: 'Связаться / Предложения',

    avgConsumption: 'Средний расход в сутки (МТ/день)',
    enduranceDays: 'дней запаса',
  },

  uk: {
    appName: 'Marine ROB',
    tagline: 'Для тих, хто тримає курс',

    overview: 'Огляд',
    tanks: 'Танки',
    log: 'Журнал',
    crew: 'Екіпаж',
    settings: 'Налаштування',

    totalROB: 'Загальний ROB палива',
    fuelEndurance: 'Запас палива',

    daysRemaining: 'днів залишилось',
    daysPassed: 'днів пройшло',

    addTank: 'Додати танк',
    save: 'Зберегти',
    saved: 'Збережено!',
    cancel: 'Скасувати',
    delete: 'Видалити',
    edit: 'Змінити',

    contractProgress: 'Прогрес контракту',
    vesselName: 'Назва судна',
    rank: 'Посада',

    contractDays: 'Днів контракту',
    signOnDate: 'Дата початку',
    daysPassedManual: 'Пройшло днів (вручну)',

    finishContract: 'Завершити контракт',
    contractHistory: 'Історія контрактів',

    earnedSoFar: 'Зароблено',
    stillToEarn: 'Ще заробляю',
    totalEarnings: 'Загальний заробіток',

    monthlySalary: 'Зарплата на місяць',
    currency: 'Валюта',
    dailyRate: 'Денна ставка',

    removeAds: 'Прибрати рекламу',
    removeAdsPrice: 'Прибрати рекламу — $4.99',
    removeAdsDesc: 'Разова покупка. Без підписки.',

    unlock: 'Розблокувати — $4.99',

    theme: 'Тема',
    themeDark: 'Темна',
    themeLight: 'Світла',
    themeSystem: 'Системна',

    language: 'Мова',
    shareApp: 'Поділитися додатком',
    shareReport: 'Поділитися звітом ROB',

    telegram: 'Telegram',
    copyShare: 'Копіювати / Поділитися',

    bunkerLog: 'Журнал бункерування',
    consumption: 'Витрата',

    previousROB: 'Попередній ROB (МТ)',
    currentROB: 'Поточний ROB (МТ)',
    saveEntry: 'Зберегти запис',

    port: 'Порт',
    quantity: 'Кількість (МТ)',
    density: 'Густина (т/м³)',
    note: 'Примітка (необов’язково)',
    logBunker: 'Записати бункерування',

    recentLog: 'Останні записи',
    bunkerHistory: 'Історія бункерувань',

    noTanks: 'Танки ще не додано',
    addFirst: 'Натисніть "Додати танк"',

    tankName: 'Назва танка',
    volume: 'Обʼєм (м³)',
    calcMass: 'Розрахункова маса',

    msg0: 'Початок контракту — облаштовуйтесь 🚢',
    msg25: 'Чверть позаду ⚓',
    msg50: 'Половина шляху! 💪',
    msg75: 'Три чверті позаду 🌊',
    msg90: 'Майже вдома, тримайся! ⭐',
    msg100: 'Останній день — ти впорався! 🎉',

    adLabel: 'Реклама',
    adSpace: '[ Місце для реклами ]',

    settingsTitle: 'Налаштування',
    dataInfo: 'Всі дані зберігаються лише на пристрої.',

    version: 'Версія 2.1',
    contactUs: 'Звʼязатися / Пропозиції',

    avgConsumption: 'Середня витрата на добу (МТ/день)',
    enduranceDays: 'днів запасу',
  },

  tl: {
    appName: 'Marine ROB',
    tagline: 'Para sa mga nagpapatakbo ng barko',
    overview: 'Buod',
    tanks: 'Mga Tank',
    log: 'Talaan',
    crew: 'Crew',
    settings: 'Mga Setting',

    totalROB: 'Kabuuang Fuel ROB',
    fuelEndurance: 'Fuel Endurance',

    daysRemaining: 'araw na natitira',
    daysPassed: 'araw na lumipas',

    addTank: 'Magdagdag ng Tank',
    save: 'I-save',
    saved: 'Nai-save!',
    cancel: 'Kanselahin',
    delete: 'Burahin',
    edit: 'I-edit',

    contractProgress: 'Progreso ng Kontrata',
    vesselName: 'Pangalan ng Barko',
    rank: 'Ranggo / Posisyon',

    contractDays: 'Araw ng Kontrata',
    signOnDate: 'Petsa ng Pag-sign on',
    daysPassedManual: 'Araw na Lumipas (manual)',

    finishContract: 'Tapusin ang Kontrata',
    contractHistory: 'Kasaysayan ng Kontrata',

    earnedSoFar: 'Kita Hanggang Ngayon',
    stillToEarn: 'Kita pa',
    totalEarnings: 'Kabuuang Kita ng Kontrata',

    monthlySalary: 'Buwanang Sahod',
    currency: 'Pera',
    dailyRate: 'Araw-araw na rate',

    removeAds: 'Alisin ang Ads',
    removeAdsPrice: 'Alisin ang Ads — $4.99',
    removeAdsDesc: 'Isang beses na bayad.',

    unlock: 'I-unlock — $4.99',

    theme: 'Tema',
    themeDark: 'Madilim',
    themeLight: 'Maliwanag',
    themeSystem: 'System',

    language: 'Wika',
    shareApp: 'Ibahagi ang App',
    shareReport: 'Ibahagi ang ROB Report',

    telegram: 'Telegram',
    copyShare: 'Kopyahin / Ibahagi',

    bunkerLog: 'Bunker Log',
    consumption: 'Konsumo',

    previousROB: 'Nakaraang ROB (MT)',
    currentROB: 'Kasalukuyang ROB (MT)',
    saveEntry: 'I-save ang Entry',

    port: 'Daungan',
    quantity: 'Dami (MT)',
    density: 'Densidad (t/m³)',
    note: 'Tala (opsyonal)',
    logBunker: 'Itala ang Bunker',

    recentLog: 'Kamakailang Talaan',
    bunkerHistory: 'Kasaysayan ng Bunker',

    noTanks: 'Walang tank na naidagdag',
    addFirst: 'Pindutin ang "Magdagdag ng Tank"',

    tankName: 'Pangalan ng Tank',
    volume: 'Dami (m³)',
    calcMass: 'Nakalkulang Masa',

    msg0: 'Unang araw — mag-ayos na 🚢',
    msg25: 'Isang quarter na tapos ⚓',
    msg50: 'Kalahati na! 💪',
    msg75: 'Tatlong quarter na tapos 🌊',
    msg90: 'Malapit na! ⭐',
    msg100: 'Huling araw — nagawa mo na! 🎉',

    adLabel: 'Advertisement',
    adSpace: '[ Espasyo ng Ad ]',

    settingsTitle: 'Mga Setting',
    dataInfo: 'Lahat ng data ay naka-imbak sa device mo.',

    version: 'Bersyon 2.1',
    contactUs: 'Makipag-ugnayan',

    avgConsumption: 'Avg araw-araw na konsumo (MT/araw)',
    enduranceDays: 'araw na suplay',
  },

  hi: {
    appName: 'Marine ROB',
    tagline: 'जहाज चलाने वालों के लिए',

    overview: 'सारांश',
    tanks: 'टैंक',
    log: 'लॉग',
    crew: 'क्रू',
    settings: 'सेटिंग्स',

    totalROB: 'कुल ईंधन ROB',
    fuelEndurance: 'ईंधन की अवधि',

    daysRemaining: 'दिन शेष',
    daysPassed: 'दिन बीते',

    addTank: 'टैंक जोड़ें',
    save: 'सहेजें',
    saved: 'सहेजा गया!',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',

    contractProgress: 'अनुबंध प्रगति',
    vesselName: 'जहाज का नाम',
    rank: 'पद / स्थिति',

    contractDays: 'अनुबंध दिन',
    signOnDate: 'साइन-ऑन तारीख',
    daysPassedManual: 'बीते दिन (मैनुअल)',

    finishContract: 'अनुबंध समाप्त करें',
    contractHistory: 'अनुबंध इतिहास',

    earnedSoFar: 'अब तक कमाया',
    stillToEarn: 'अभी कमाना है',
    totalEarnings: 'कुल अनुबंध आय',

    monthlySalary: 'मासिक वेतन',
    currency: 'मुद्रा',
    dailyRate: 'दैनिक दर',

    removeAds: 'विज्ञापन हटाएं',
    removeAdsPrice: 'विज्ञापन हटाएं — $4.99',
    removeAdsDesc: 'एकमुश्त खरीद। कोई सदस्यता नहीं।',

    unlock: 'अनलॉक करें — $4.99',

    theme: 'थीम',
    themeDark: 'डार्क',
    themeLight: 'लाइट',
    themeSystem: 'सिस्टम',

    language: 'भाषा',
    shareApp: 'ऐप शेयर करें',
    shareReport: 'ROB रिपोर्ट शेयर करें',

    telegram: 'Telegram',
    copyShare: 'कॉपी / शेयर करें',

    bunkerLog: 'बंकर लॉग',
    consumption: 'खपत',

    previousROB: 'पिछला ROB (MT)',
    currentROB: 'वर्तमान ROB (MT)',
    saveEntry: 'एंट्री सहेजें',

    port: 'बंदरगाह',
    quantity: 'मात्रा (MT)',
    density: 'घनत्व (t/m³)',
    note: 'नोट (वैकल्पिक)',
    logBunker: 'बंकर दर्ज करें',

    recentLog: 'हाल के लॉग',
    bunkerHistory: 'बंकर इतिहास',

    noTanks: 'कोई टैंक नहीं जोड़ा गया',
    addFirst: '"टैंक जोड़ें" दबाएं',

    tankName: 'टैंक का नाम',
    volume: 'वॉल्यूम (m³)',
    calcMass: 'गणना किया गया द्रव्यमान',

    msg0: 'शुरुआत — व्यवस्थित हों 🚢',
    msg25: 'एक चौथाई पूरा ⚓',
    msg50: 'आधा रास्ता! 💪',
    msg75: 'तीन चौथाई पूरा 🌊',
    msg90: 'लगभग वहां! ⭐',
    msg100: 'आखिरी दिन — आप कर गए! 🎉',

    adLabel: 'विज्ञापन',
    adSpace: '[ विज्ञापन स्थान ]',

    settingsTitle: 'सेटिंग्स',
    dataInfo: 'सभी डेटा केवल इस डिवाइस पर संग्रहीत है।',

    version: 'संस्करण 2.1',
    contactUs: 'संपर्क / प्रतिक्रिया',

    avgConsumption: 'औसत दैनिक खपत (MT/दिन)',
    enduranceDays: 'दिनों की आपूर्ति',
  },
} as const;

export type TKey = keyof typeof translations.en;

export function t(locale: Locale, key: TKey): string {
  const dict = translations[locale] ?? translations.en;
  return dict[key] ?? key;
}

export function detectLocale(): Locale {
  const saved = localStorage.getItem('mrob_locale') as Locale | null;
  if (saved && saved in translations) return saved;

  const lang = navigator.language.toLowerCase();

  if (lang.startsWith('tl') || lang.startsWith('fil')) return 'tl';
  if (lang.startsWith('uk')) return 'uk';
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('hi')) return 'hi';

  return 'en';
}