
import { Property, PropertyType, DealType, Job, JobType, Service, ServiceCategory, AdminUser } from '../types';

// Mocking current user ID as 'user_123' for demonstration
const CURRENT_USER = 'user_123';
const OTHER_USER = 'other_user';

export const ADMINS: AdminUser[] = [
  {
    id: 'admin_1',
    username: 'admin',
    password: '123',
    fullName: 'مدیر اصلی سیستم',
    // Fix: Added missing role property to satisfy AdminUser type
    role: 'SUPER'
  }
];

export const PROPERTIES: Property[] = [
  {
    id: '1',
    ownerId: CURRENT_USER,
    title: 'آپارتمان لوکس در شهر نو',
    price: 8500000,
    currency: 'AFN',
    location: { lat: 34.5333, lng: 69.1667 },
    address: 'کوچه قصابی، شهر نو، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=1'],
    bedrooms: 3,
    // Fix: Added missing hasStorage property
    hasStorage: true,
    area: 140,
    type: PropertyType.APARTMENT,
    dealType: DealType.SALE,
    description: 'یک آپارتمان مدرن با دیکوریشن عالی و امنیت ۲۴ ساعته در قلب شهر نو.',
    features: ['گراچ', 'لفت', 'محافظ', 'مرکز گرمی'],
    date: '۲ ساعت پیش',
    status: 'APPROVED',
    // Add missing phoneNumber
    phoneNumber: '0700112233'
  },
  {
    id: '2',
    ownerId: OTHER_USER,
    title: 'حویلی مفشن در وزیر اکبر خان',
    price: 60000,
    currency: 'AFN',
    location: { lat: 34.5400, lng: 69.1900 },
    address: 'سرک ۱۵، وزیر اکبر خان، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=2'],
    bedrooms: 5,
    // Fix: Added missing hasStorage property
    hasStorage: true,
    area: 450,
    type: PropertyType.HOUSE,
    dealType: DealType.RENT,
    description: 'حویلی پاککاری شده و کلان مناسب برای دفتر یا رهایش خارجیان.',
    features: ['حوض آب بازی', 'سرسبزی', 'جنراتور', 'گراچ کلان'],
    date: 'دیروز',
    status: 'APPROVED',
    // Add missing phoneNumber
    phoneNumber: '0799887766'
  },
  {
    id: '3',
    ownerId: OTHER_USER,
    title: 'زمین تجارتی در هرات',
    price: 2000000,
    currency: 'AFN',
    location: { lat: 34.3529, lng: 62.2040 },
    address: 'جاده ولایت، مرکز شهر هرات',
    city: 'هرات',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=3'],
    bedrooms: 0,
    // Fix: Added missing hasStorage property
    hasStorage: false,
    area: 200,
    type: PropertyType.COMMERCIAL,
    dealType: DealType.SALE,
    description: 'زمین موقعیت عالی برای ساخت مارکیت یا دکان.',
    features: ['قباله شرعی', 'آب و برق'],
    date: '۳ روز پیش',
    status: 'APPROVED',
    // Add missing phoneNumber
    phoneNumber: '0700554433'
  },
  {
    id: '4',
    ownerId: CURRENT_USER,
    title: 'آپارتمان ارزان در دشت برچی',
    price: 500000,
    currency: 'AFN',
    location: { lat: 34.4900, lng: 69.0500 },
    address: 'ایستگاه نقاش، دشت برچی',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=4'],
    bedrooms: 2,
    // Fix: Added missing hasStorage property
    hasStorage: false,
    area: 90,
    type: PropertyType.APARTMENT,
    dealType: DealType.MORTGAGE,
    description: 'آپارتمان نوساخت با قیمت مناسب برای فامیل های کوچک.',
    features: ['آفتاب‌رخ', 'نزدیک بازار'],
    date: '۵ ساعت پیش',
    status: 'APPROVED',
    // Add missing phoneNumber
    phoneNumber: '0788223344'
  },
  {
    id: '5',
    ownerId: OTHER_USER,
    title: 'باغ و حویلی در مزار شریف',
    price: 12000000,
    currency: 'AFN',
    location: { lat: 36.7119, lng: 67.1107 },
    address: 'نزدیک روضه شریف، مزار شریف',
    city: 'مزار شریف',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=5'],
    bedrooms: 4,
    // Fix: Added missing hasStorage property
    hasStorage: true,
    area: 1000,
    type: PropertyType.HOUSE,
    dealType: DealType.SALE,
    description: 'باغ زیبا با درختان میوه دار و تعمیر پخته.',
    features: ['چاه آب', 'برق رهایشی', 'فضای سبز'],
    date: '۱ هفته پیش',
    status: 'APPROVED',
    // Add missing phoneNumber
    phoneNumber: '0777112233'
  },
  {
    id: '6',
    ownerId: OTHER_USER,
    title: 'زمین زراعتی (در انتظار تایید)',
    price: 500000,
    currency: 'AFN',
    location: { lat: 34.5000, lng: 69.1000 },
    address: 'پغمان، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=6'],
    bedrooms: 0,
    // Fix: Added missing hasStorage property
    hasStorage: false,
    area: 2000,
    type: PropertyType.LAND,
    dealType: DealType.SALE,
    description: 'زمین مناسب برای کشت و زراعت.',
    features: ['آب فراوان'],
    date: 'لحظاتی پیش',
    status: 'PENDING',
    // Add missing phoneNumber
    phoneNumber: '0744998877'
  }
];

export const JOBS: Job[] = [
  {
    id: '101',
    ownerId: CURRENT_USER,
    title: 'برنامه‌نویس وب (React)',
    company: 'شرکت تکنالوژی افغان سافت',
    salary: 40000,
    currency: 'AFN',
    location: { lat: 34.5150, lng: 69.1800 },
    address: 'ده افغانان، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=10'],
    jobType: JobType.FULL_TIME,
    description: 'ما به دنبال یک برنامه نویس باتجربه React هستیم که توانایی کار تیمی را داشته باشد.',
    requirements: ['مسلط به React و TypeScript', 'آشنایی با Git', 'حداقل ۲ سال تجربه کاری'],
    date: 'امروز',
    status: 'APPROVED',
    // Add missing phoneNumber
    phoneNumber: '0700111222'
  },
  {
    id: '102',
    ownerId: OTHER_USER,
    title: 'بازاریاب فروش (Sales)',
    company: 'شرکت تولیدی نوشابه',
    salary: 25000,
    currency: 'AFN',
    location: { lat: 34.3400, lng: 62.1900 },
    address: 'شهرک صنعتی، هرات',
    city: 'هرات',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=11'],
    jobType: JobType.FULL_TIME,
    description: 'استخدام بازاریاب میدانی با روابط عمومی بالا برای پخش محصولات.',
    requirements: ['فن بیان عالی', 'آشنایی با شهر هرات', 'سابقه کار در فروش'],
    date: 'دیروز',
    status: 'APPROVED',
    // Add missing phoneNumber
    phoneNumber: '0799333444'
  },
  {
    id: '103',
    ownerId: OTHER_USER,
    title: 'گرافیست و ادیتور',
    company: 'استودیو خلاق',
    salary: 30000,
    currency: 'AFN',
    location: { lat: 36.7000, lng: 67.1100 },
    address: 'چوک الکوزی، مزار شریف',
    city: 'مزار شریف',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=12'],
    jobType: JobType.REMOTE,
    description: 'نیاز به یک طراح گرافیک مسلط به فتوشاپ و ایلاستریتور برای کار پروژه‌ای.',
    requirements: ['تسلط به Adobe Suite', 'خلاقیت بالا', 'تحویل به موقع پروژه'],
    date: '۲ روز پیش',
    status: 'APPROVED',
    // Add missing phoneNumber
    phoneNumber: '0788555666'
  },
  {
    id: '104',
    ownerId: CURRENT_USER,
    title: 'حسابدار مالی',
    company: 'سوپر مارکت بزرگ',
    salary: 18000,
    currency: 'AFN',
    location: { lat: 34.5450, lng: 69.1700 },
    address: 'تایمنی، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=13'],
    jobType: JobType.PART_TIME,
    description: 'حسابدار برای رسیدگی به امور مالی فروشگاه در شیفت عصر.',
    requirements: ['آشنایی با نرم افزار کوییک بوک', 'دقت بالا در اعداد', 'ضمانت معتبر'],
    date: '۳ ساعت پیش',
    status: 'APPROVED',
    // Add missing phoneNumber
    phoneNumber: '0777444555'
  },
  {
    id: '105',
    ownerId: OTHER_USER,
    title: 'منشی دفتر (در انتظار تایید)',
    company: 'شرکت تجارتی',
    salary: 15000,
    currency: 'AFN',
    location: { lat: 34.5200, lng: 69.1600 },
    address: 'شهر نو، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=14'],
    jobType: JobType.FULL_TIME,
    description: 'منشی با روابط عمومی بالا و آشنایی با کامپیوتر.',
    requirements: ['Word', 'Excel'],
    date: 'امروز',
    status: 'PENDING',
    // Add missing phoneNumber
    phoneNumber: '0744111222'
  }
];

export const SERVICES: Service[] = [
  {
    id: '201',
    ownerId: CURRENT_USER,
    title: 'نل دوانی و لوله کشی ماهر',
    providerName: 'اوستا رحیم',
    category: ServiceCategory.REPAIR,
    location: { lat: 34.5300, lng: 69.1500 },
    address: 'کوته سنگی، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=20'],
    description: 'انجام تمام امور نل دوانی، نصب و ترمیم شیر دهن، ترمیم پمپ آب و غیره با ۱۰ سال تجربه کاری.',
    experience: '۱۰ سال',
    phoneNumber: '0700123456',
    date: '۱ ساعت پیش',
    status: 'APPROVED'
  },
  {
    id: '202',
    ownerId: OTHER_USER,
    title: 'برق کاری ساختمان و صنعتی',
    providerName: 'خدمات فنی نور',
    category: ServiceCategory.TECHNICAL,
    location: { lat: 34.2100, lng: 62.2100 },
    address: 'چهارراهی مستوفیت، هرات',
    city: 'هرات',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=21'],
    description: 'سیم کشی ساختمان، نصب و ترمیم انواع گروپ و سوییچ، رفع اتصالی برق به صورت ۲۴ ساعته.',
    experience: '۷ سال',
    phoneNumber: '0799654321',
    date: '۳ ساعت پیش',
    status: 'APPROVED'
  },
  {
    id: '203',
    ownerId: OTHER_USER,
    title: 'تدریس خصوصی ریاضی و فزیک',
    providerName: 'استاد محمدی',
    category: ServiceCategory.EDUCATION,
    location: { lat: 36.7200, lng: 67.1200 },
    address: 'کارت صلح، مزار شریف',
    city: 'مزار شریف',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=22'],
    description: 'تدریس مضامین ساینسی برای شاگردان مکتب و آمادگی کانکور با متد جدید.',
    experience: '۵ سال',
    phoneNumber: '0788112233',
    date: 'دیروز',
    status: 'APPROVED'
  },
  {
    id: '204',
    ownerId: CURRENT_USER,
    title: 'صفا کاری و نظافت منازل',
    providerName: 'شرکت خدماتی پاک',
    category: ServiceCategory.CLEANING,
    location: { lat: 34.5500, lng: 69.2000 },
    address: 'مکروریان سوم، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=23'],
    description: 'اعزام کارگر ماهر جهت پاک کاری منازل، دفاتر و شستشوی فرش و قالین در محل.',
    experience: '۱۲ سال',
    phoneNumber: '0777998877',
    date: '۲ روز پیش',
    status: 'APPROVED'
  },
  {
    id: '205',
    ownerId: OTHER_USER,
    title: 'باربری و انتقال اموال',
    providerName: 'ترانسپورت عقاب',
    category: ServiceCategory.TRANSPORT,
    location: { lat: 34.5000, lng: 69.1000 },
    address: 'کمپنی، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=24'],
    description: 'انتقال اثاثیه منزل با موترهای مسقف و کارگران ورزیده به تمام نقاط کابل و ولایات.',
    experience: '۱۵ سال',
    phoneNumber: '0744556677',
    date: '۴ ساعت پیش',
    status: 'APPROVED'
  },
  {
    id: '206',
    ownerId: OTHER_USER,
    title: 'آموزش زبان انگلیسی (در انتظار)',
    providerName: 'آموزشگاه برتر',
    category: ServiceCategory.EDUCATION,
    location: { lat: 34.5100, lng: 69.1400 },
    address: 'داسپیچری، کابل',
    city: 'کابل',
    // Fixed: changed 'image' to 'images' array
    images: ['https://picsum.photos/800/600?random=25'],
    description: 'صنف های آمادگی تافل و آیلتس.',
    experience: '۸ سال',
    phoneNumber: '0700000000',
    date: 'امروز',
    status: 'PENDING'
  }
];
