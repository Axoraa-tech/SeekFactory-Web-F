"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type LanguageOption = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

export type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
  rateFromInr: number; // 1 INR = rateFromInr TargetCurrency
};

export const LANGUAGES: LanguageOption[] = [
  { code: "EN", name: "English (US)", nativeName: "English (US)", flag: "🇺🇸" },
  { code: "ZH", name: "Chinese (Simplified)", nativeName: "中文(简体)", flag: "🇨🇳" },
  { code: "ES", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "HI", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "DE", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "FR", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "JA", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "AR", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "PT", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "EN-GB", name: "English (UK)", nativeName: "English (UK)", flag: "🇬🇧" },
];

export const CURRENCIES: CurrencyOption[] = [
  { code: "EUR", name: "Euro", symbol: "€", rateFromInr: 0.01053 },
  { code: "USD", name: "US Dollar", symbol: "$", rateFromInr: 0.01149 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", rateFromInr: 1.0 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", rateFromInr: 0.0833 },
  { code: "GBP", name: "British Pound", symbol: "£", rateFromInr: 0.00893 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rateFromInr: 1.724 },
  { code: "AED", name: "UAE Dirham", symbol: "AED ", rateFromInr: 0.0422 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", rateFromInr: 0.0161 },
  { code: "AUD", name: "Australian Dollar", symbol: "AU$", rateFromInr: 0.0178 },
  { code: "SGD", name: "Singapore Dollar", symbol: "SG$", rateFromInr: 0.0151 },
];

// Dictionary of translations for top UI keys
const TRANSLATIONS: Record<string, Record<string, string>> = {
  // Navigation
  "nav.home": {
    EN: "Home",
    ZH: "首页",
    ES: "Inicio",
    HI: "मुख्य पृष्ठ",
    DE: "Startseite",
    FR: "Accueil",
    JA: "ホーム",
    AR: "الرئيسية",
    PT: "Início",
    "EN-GB": "Home",
  },
  "nav.explore": {
    EN: "Explore",
    ZH: "发现",
    ES: "Explorar",
    HI: "अन्वेषण",
    DE: "Entdecken",
    FR: "Explorer",
    JA: "見つける",
    AR: "استكشاف",
    PT: "Explorar",
    "EN-GB": "Explore",
  },
  "nav.messages": {
    EN: "Messages",
    ZH: "消息",
    ES: "Mensajes",
    HI: "संदेश",
    DE: "Nachrichten",
    FR: "Messages",
    JA: "メッセージ",
    AR: "الرسائل",
    PT: "Mensagens",
    "EN-GB": "Messages",
  },
  "nav.notifications": {
    EN: "Notifications",
    ZH: "通知",
    ES: "Notificaciones",
    HI: "सूचनाएं",
    DE: "Benachrichtigungen",
    FR: "Notifications",
    JA: "通知",
    AR: "الإشعارات",
    PT: "Notificações",
    "EN-GB": "Notifications",
  },
  "nav.profile": {
    EN: "Profile",
    ZH: "我的",
    ES: "Perfil",
    HI: "प्रोफ़ाइल",
    DE: "Profil",
    FR: "Profil",
    JA: "プロフィール",
    AR: "الملف الشخصي",
    PT: "Perfil",
    "EN-GB": "Profile",
  },
  "nav.postRfq": {
    EN: "Post RFQ",
    ZH: "发布询盘",
    ES: "Publicar RFQ",
    HI: "आरएफक्यू पोस्ट करें",
    DE: "RFQ anfragen",
    FR: "Publier RFQ",
    JA: "見積もり依頼",
    AR: "طلب عرض أسعار",
    PT: "Publicar RFQ",
    "EN-GB": "Post RFQ",
  },
  "nav.forManufacturers": {
    EN: "For Manufacturers",
    ZH: "厂家入驻",
    ES: "Para Fabricantes",
    HI: "निर्माताओं के लिए",
    DE: "Für Hersteller",
    FR: "Pour Fabricants",
    JA: "メーカー向け",
    AR: "للمصنعين",
    PT: "Para Fabricantes",
    "EN-GB": "For Manufacturers",
  },
  "nav.signIn": {
    EN: "Sign in",
    ZH: "登录",
    ES: "Iniciar sesión",
    HI: "साइन इन",
    DE: "Anmelden",
    FR: "Connexion",
    JA: "サインイン",
    AR: "تسجيل الدخول",
    PT: "Entrar",
    "EN-GB": "Sign in",
  },
  "nav.joinNow": {
    EN: "Join now",
    ZH: "立即加入",
    ES: "Únete ahora",
    HI: "अभी जुड़ें",
    DE: "Jetzt beitreten",
    FR: "Rejoindre",
    JA: "今すぐ登録",
    AR: "انضم الآن",
    PT: "Cadastre-se",
    "EN-GB": "Join now",
  },
  "nav.searchPlaceholder": {
    EN: "Search products, verified factories, categories...",
    ZH: "搜索机械设备、认证工厂、产品分类...",
    ES: "Buscar maquinaria, fábricas verificadas, categorías...",
    HI: "उत्पाद, सत्यापित कारखाने, श्रेणियां खोजें...",
    DE: "Produkte, zertifizierte Fabriken, Kategorien suchen...",
    FR: "Rechercher produits, usines vérifiées, catégories...",
    JA: "製品、認証工場、カテゴリを検索...",
    AR: "ابحث عن المنتجات والمصانع المعتمدة والفئات...",
    PT: "Pesquise produtos, fábricas verificadas, categorias...",
    "EN-GB": "Search products, verified factories, categories...",
  },
  "nav.search": {
    EN: "Search",
    ZH: "搜索",
    ES: "Buscar",
    HI: "खोजें",
    DE: "Suchen",
    FR: "Rechercher",
    JA: "検索",
    AR: "بحث",
    PT: "Buscar",
    "EN-GB": "Search",
  },

  // Sidebar
  "sidebar.machineryCategories": {
    EN: "Machinery Categories",
    ZH: "机械设备分类",
    ES: "Categorías de Maquinaria",
    HI: "मशीनरी श्रेणियां",
    DE: "Maschinenkategorien",
    FR: "Catégories de Machines",
    JA: "機械カテゴリ",
    AR: "فئات الآلات",
    PT: "Categorias de Máquinas",
    "EN-GB": "Machinery Categories",
  },
  "sidebar.allCategories": {
    EN: "All Categories",
    ZH: "全部机械分类",
    ES: "Todas las categorías",
    HI: "सभी श्रेणियां",
    DE: "Alle Kategorien",
    FR: "Toutes les catégories",
    JA: "すべてのカテゴリ",
    AR: "جميع الفئات",
    PT: "Todas as categorias",
    "EN-GB": "All Categories",
  },
  "sidebar.upgradePremium": {
    EN: "Upgrade to Premium",
    ZH: "升级至企业高级版",
    ES: "Mejorar a Premium",
    HI: "प्रीमियम में अपग्रेड करें",
    DE: "Auf Premium upgraden",
    FR: "Passer à Premium",
    JA: "プレミアムにアップグレード",
    AR: "الترقية إلى النسخة المميزة",
    PT: "Atualizar para Premium",
    "EN-GB": "Upgrade to Premium",
  },
  "sidebar.upgradeDesc": {
    EN: "Unlock advanced features and get priority factory quotes",
    ZH: "解锁高级采购功能并获得工厂优先报价",
    ES: "Desbloquee funciones avanzadas y obtenga cotizaciones prioritarias",
    HI: "उन्नत सुविधाएं अनलॉक करें और प्राथमिकता उद्धरण प्राप्त करें",
    DE: "Erweiterte Funktionen freischalten und bevorzugte Angebote erhalten",
    FR: "Débloquez les fonctionnalités avancées et devis prioritaires",
    JA: "高度な調達機能と優先見積もりを取得",
    AR: "افتح الميزات المتقدمة واحصل على عروض أسعار ذات أولوية",
    PT: "Desbloqueie recursos avançados e cotações prioritárias",
    "EN-GB": "Unlock advanced features and get priority factory quotes",
  },
  "sidebar.upgradeNow": {
    EN: "Upgrade Now",
    ZH: "立即升级",
    ES: "Actualizar ahora",
    HI: "अभी अपग्रेड करें",
    DE: "Jetzt upgraden",
    FR: "Mettre à niveau",
    JA: "今すぐアップグレード",
    AR: "ترقية الآن",
    PT: "Atualizar agora",
    "EN-GB": "Upgrade Now",
  },

  // Widgets
  "widgets.verifiedManufacturers": {
    EN: "Verified Manufacturers",
    ZH: "认证工厂推荐",
    ES: "Fabricantes Verificados",
    HI: "सत्यापित निर्माता",
    DE: "Verifizierte Hersteller",
    FR: "Fabricants Vérifiés",
    JA: "認証済みメーカー",
    AR: "المصنعون المعتمدون",
    PT: "Fabricantes Verificados",
    "EN-GB": "Verified Manufacturers",
  },
  "widgets.trendingProducts": {
    EN: "Trending Products",
    ZH: "热门工业机械",
    ES: "Productos Populares",
    HI: "ट्रेंडिंग उत्पाद",
    DE: "Beliebte Produkte",
    FR: "Produits Tendance",
    JA: "トレンド商品",
    AR: "المنتجات الرائجة",
    PT: "Produtos Populares",
    "EN-GB": "Trending Products",
  },
  "widgets.recentMessages": {
    EN: "Recent Messages",
    ZH: "最近沟通",
    ES: "Mensajes Recientes",
    HI: "हाल के संदेश",
    DE: "Letzte Nachrichten",
    FR: "Messages Récents",
    JA: "最近のメッセージ",
    AR: "الرسائل الأخيرة",
    PT: "Mensagens Recentes",
    "EN-GB": "Recent Messages",
  },
  "widgets.exploreByCategory": {
    EN: "Explore by Category",
    ZH: "按机械分类浏览",
    ES: "Explorar por Categoría",
    HI: "श्रेणी के अनुसार देखें",
    DE: "Nach Kategorie entdecken",
    FR: "Explorer par Catégorie",
    JA: "カテゴリ別に探す",
    AR: "استكشاف حسب الفئة",
    PT: "Explorar por Categoria",
    "EN-GB": "Explore by Category",
  },
  "widgets.viewAll": {
    EN: "View all",
    ZH: "查看全部",
    ES: "Ver todo",
    HI: "सभी देखें",
    DE: "Alle ansehen",
    FR: "Voir tout",
    JA: "すべて見る",
    AR: "عرض الكل",
    PT: "Ver tudo",
    "EN-GB": "View all",
  },
  "widgets.follow": {
    EN: "+ Follow",
    ZH: "+ 关注",
    ES: "+ Seguir",
    HI: "+ फॉलो करें",
    DE: "+ Folgen",
    FR: "+ Suivre",
    JA: "+ フォロー",
    AR: "+ متابعة",
    PT: "+ Seguir",
    "EN-GB": "+ Follow",
  },
  "widgets.following": {
    EN: "Following",
    ZH: "已关注",
    ES: "Siguiendo",
    HI: "फ़ॉलो किया",
    DE: "Gefolgt",
    FR: "Suivi",
    JA: "フォロー中",
    AR: "متابع",
    PT: "Seguindo",
    "EN-GB": "Following",
  },
  "widgets.repliesFast": {
    EN: "Replies < 2h",
    ZH: "2小时内快速响应",
    ES: "Responde < 2h",
    HI: "2 घंटे में उत्तर",
    DE: "Antwortet < 2 Std.",
    FR: "Répond < 2h",
    JA: "2時間以内に返信",
    AR: "الرد خلال ساعتين",
    PT: "Responde < 2h",
    "EN-GB": "Replies < 2h",
  },

  // Common Actions
  "common.order": {
    EN: "Order",
    ZH: "订购",
    ES: "Pedir",
    HI: "ऑर्डर करें",
    DE: "Bestellen",
    FR: "Commander",
    JA: "注文",
    AR: "طلب",
    PT: "Pedir",
    "EN-GB": "Order",
  },
  "common.buyNow": {
    EN: "Buy Now",
    ZH: "立即采购",
    ES: "Comprar ahora",
    HI: "अभी खरीदें",
    DE: "Jetzt kaufen",
    FR: "Acheter",
    JA: "今すぐ購入",
    AR: "شراء الآن",
    PT: "Comprar agora",
    "EN-GB": "Buy Now",
  },
  "common.visitPlant": {
    EN: "Visit Plant",
    ZH: "参观工厂",
    ES: "Visitar Fábrica",
    HI: "प्लांट देखें",
    DE: "Werk besuchen",
    FR: "Visiter l'usine",
    JA: "工場見学",
    AR: "زيارة المصنع",
    PT: "Visitar Fábrica",
    "EN-GB": "Visit Plant",
  },
  "common.online": {
    EN: "Online",
    ZH: "在线",
    ES: "En línea",
    HI: "ऑनलाइन",
    DE: "Online",
    FR: "En ligne",
    JA: "オンライン",
    AR: "متصل",
    PT: "Online",
    "EN-GB": "Online",
  },
  "common.send": {
    EN: "Send",
    ZH: "发送",
    ES: "Enviar",
    HI: "भेजें",
    DE: "Senden",
    FR: "Envoyer",
    JA: "送信",
    AR: "إرسال",
    PT: "Enviar",
    "EN-GB": "Send",
  },
  "common.chat": {
    EN: "Chat",
    ZH: "在线洽谈",
    ES: "Chat",
    HI: "चैट करें",
    DE: "Chat",
    FR: "Chat",
    JA: "チャット",
    AR: "دردشة",
    PT: "Chat",
    "EN-GB": "Chat",
  },

  // Feed Tabs & Reel Chrome
  "feed.forYou": {
    EN: "For You",
    ZH: "精选推荐",
    ES: "Para ti",
    HI: "आपके लिए",
    DE: "Für dich",
    FR: "Pour vous",
    JA: "おすすめ",
    AR: "لك",
    PT: "Para você",
    "EN-GB": "For You",
  },
  "feed.following": {
    EN: "Following",
    ZH: "已关注厂家",
    ES: "Siguiendo",
    HI: "फ़ॉलोइंग",
    DE: "Gefolgt",
    FR: "Abonnements",
    JA: "フォロー中",
    AR: "متابع",
    PT: "Seguindo",
    "EN-GB": "Following",
  },
  "feed.viewProducts": {
    EN: "View Products",
    ZH: "查看产品",
    ES: "Ver productos",
    HI: "उत्पाद देखें",
    DE: "Produkte ansehen",
    FR: "Voir produits",
    JA: "製品を見る",
    AR: "عرض المنتجات",
    PT: "Ver produtos",
    "EN-GB": "View Products",
  },
  "feed.viewManufacturer": {
    EN: "View Manufacturer",
    ZH: "查看工厂",
    ES: "Ver fabricante",
    HI: "निर्माता देखें",
    DE: "Hersteller ansehen",
    FR: "Voir fabricant",
    JA: "メーカーを見る",
    AR: "عرض المصنع",
    PT: "Ver fabricante",
    "EN-GB": "View Manufacturer",
  },
  "feed.landscape": {
    EN: "Landscape",
    ZH: "横屏展示",
    ES: "Horizontal",
    HI: "लैंडस्केप",
    DE: "Querformat",
    FR: "Paysage",
    JA: "横画面",
    AR: "أفقي",
    PT: "Paisagem",
    "EN-GB": "Landscape",
  },
  "feed.vertical": {
    EN: "Vertical",
    ZH: "竖屏专区",
    ES: "Vertical",
    HI: "वर्टिकल",
    DE: "Hochformat",
    FR: "Portrait",
    JA: "縦画面",
    AR: "عمودي",
    PT: "Retrato",
    "EN-GB": "Vertical",
  },
  "feed.verifiedOem": {
    EN: "Verified OEM Manufacturer",
    ZH: "认证OEM制造商",
    ES: "Fabricante OEM Verificado",
    HI: "सत्यापित ओईएम निर्माता",
    DE: "Verifizierter OEM-Hersteller",
    FR: "Fabricant OEM Vérifié",
    JA: "認証済みOEMメーカー",
    AR: "مصنع المعدات الأصلية المعتمد",
    PT: "Fabricante OEM Verificado",
    "EN-GB": "Verified OEM Manufacturer",
  },
  "feed.iso9001": {
    EN: "ISO 9001 Audited",
    ZH: "ISO 9001 深度验厂",
    ES: "Auditado ISO 9001",
    HI: "आईएसओ 9001 ऑडिटेड",
    DE: "ISO 9001 auditiert",
    FR: "Audité ISO 9001",
    JA: "ISO 9001 認証取得",
    AR: "معتمد وفقاً لـ ISO 9001",
    PT: "Auditado ISO 9001",
    "EN-GB": "ISO 9001 Audited",
  },
  "feed.verifiedFactory": {
    EN: "Verified Factory",
    ZH: "实地验厂",
    ES: "Fábrica Verificada",
    HI: "सत्यापित कारखाना",
    DE: "Verifizierte Fabrik",
    FR: "Usine Vérifiée",
    JA: "実地認証工場",
    AR: "مصنع معتمد",
    PT: "Fábrica Verificada",
    "EN-GB": "Verified Factory",
  },
  "feed.sendRfq": {
    EN: "Send RFQ",
    ZH: "发送询盘",
    ES: "Enviar RFQ",
    HI: "आरएफक्यू भेजें",
    DE: "RFQ senden",
    FR: "Envoyer RFQ",
    JA: "見積もり依頼",
    AR: "إرسال RFQ",
    PT: "Enviar RFQ",
    "EN-GB": "Send RFQ",
  },
  "feed.views": {
    EN: "views",
    ZH: "次浏览",
    ES: "vistas",
    HI: "बार देखा गया",
    DE: "Aufrufe",
    FR: "vues",
    JA: "回再生",
    AR: "مشاهدة",
    PT: "visualizações",
    "EN-GB": "views",
  },
  "feed.leadTime": {
    EN: "LEAD TIME",
    ZH: "交货周期",
    ES: "PLAZO DE ENTREGA",
    HI: "डिलीवरी समय",
    DE: "LIEFERZEIT",
    FR: "DÉLAI DE LIVRAISON",
    JA: "納期目安",
    AR: "مدة التوريد",
    PT: "PRAZO DE ENTREGA",
    "EN-GB": "LEAD TIME",
  },
  "feed.leadTimeVal": {
    EN: "15-20 Days",
    ZH: "15-20 天",
    ES: "15-20 Días",
    HI: "15-20 दिन",
    DE: "15-20 Tage",
    FR: "15-20 Jours",
    JA: "15〜20日",
    AR: "15-20 يوم",
    PT: "15-20 Dias",
    "EN-GB": "15-20 Days",
  },
  "feed.customization": {
    EN: "CUSTOMIZATION",
    ZH: "定制服务",
    ES: "PERSONALIZACIÓN",
    HI: "अनुकूलन",
    DE: "ANPASSUNG",
    FR: "PERSONNALISATION",
    JA: "カスタマイズ",
    AR: "التخصيص",
    PT: "PERSONALIZAÇÃO",
    "EN-GB": "CUSTOMIZATION",
  },
  "feed.customizationVal": {
    EN: "OEM & ODM",
    ZH: "支持 OEM & ODM",
    ES: "OEM y ODM",
    HI: "ओईएम और ओडीएम",
    DE: "OEM & ODM",
    FR: "OEM & ODM",
    JA: "OEM・ODM対応",
    AR: "OEM و ODM",
    PT: "OEM e ODM",
    "EN-GB": "OEM & ODM",
  },
  "feed.save": {
    EN: "Save",
    ZH: "收藏",
    ES: "Guardar",
    HI: "सहेजें",
    DE: "Speichern",
    FR: "Enregistrer",
    JA: "保存",
    AR: "حفظ",
    PT: "Salvar",
    "EN-GB": "Save",
  },
  "feed.saved": {
    EN: "Saved",
    ZH: "已收藏",
    ES: "Guardado",
    HI: "सहेजा गया",
    DE: "Gespeichert",
    FR: "Enregistré",
    JA: "保存済み",
    AR: "تم الحفظ",
    PT: "Salvo",
    "EN-GB": "Saved",
  },
  "feed.searchSeeks": {
    EN: "Search Seeks (e.g. Harvester, CNC, Laser, Robots...)",
    ZH: "搜索Seeks短视频 (如收割机、数控机床、激光、机器人...)",
    ES: "Buscar Seeks (p. ej. Cosechadora, CNC, Láser, Robots...)",
    HI: "सीक्स खोजें (उदा. हार्वेस्टर, सीएनसी, लेजर, रोबोट...)",
    DE: "Seeks suchen (z. B. Erntemaschine, CNC, Laser, Roboter...)",
    FR: "Rechercher Seeks (ex. Moissonneuse, CNC, Laser, Robots...)",
    JA: "Seeks動画を検索 (例: 収穫機, CNC, レーザー, ロボット...)",
    AR: "البحث في Seeks (مثل الحصادة، CNC، الليزر، الروبوتات...)",
    PT: "Pesquisar Seeks (ex. Colheitadeira, CNC, Laser, Robôs...)",
    "EN-GB": "Search Seeks (e.g. Harvester, CNC, Laser, Robots...)",
  },
  "feed.subcategories": {
    EN: "Subcategories",
    ZH: "子分类",
    ES: "Subcategorías",
    HI: "उपश्रेणियाँ",
    DE: "Unterkategorien",
    FR: "Sous-catégories",
    JA: "サブカテゴリ",
    AR: "الفئات الفرعية",
    PT: "Subcategorias",
    "EN-GB": "Subcategories",
  },
  "feed.clickSubcategoryToFilter": {
    EN: "Click a subcategory to filter Seeks",
    ZH: "点击子分类即可精准筛选下方Seeks视频",
    ES: "Haga clic en una subcategoría para filtrar Seeks",
    HI: "सीक्स फ़िल्टर करने के लिए उपश्रेणी पर क्लिक करें",
    DE: "Klicken Sie auf eine Unterkategorie, um Seeks zu filtern",
    FR: "Cliquez sur une sous-catégorie pour filtrer les Seeks",
    JA: "サブカテゴリをクリックしてSeeks動画を絞り込み",
    AR: "انقر على فئة فرعية لتصفية مقاطع Seeks",
    PT: "Clique em uma subcategoria para filtrar os Seeks",
    "EN-GB": "Click a subcategory to filter Seeks",
  },
  "feed.allSeeksVisible": {
    EN: "All Seeks visible • Click a subcategory to filter",
    ZH: "当前显示全部Seeks • 点击下方任一子分类即可过滤",
    ES: "Todos los Seeks visibles • Haga clic para filtrar",
    HI: "सभी सीक्स दृश्यमान हैं • फ़िल्टर करने के लिए क्लिक करें",
    DE: "Alle Seeks sichtbar • Zum Filtern Unterkategorie wählen",
    FR: "Tous les Seeks sont visibles • Cliquez pour filtrer",
    JA: "全Seeks動画を表示中 • サブカテゴリ選択で絞り込み",
    AR: "جميع مقاطع Seeks مرئية • انقر للتصفية",
    PT: "Todos os Seeks visíveis • Clique para filtrar",
    "EN-GB": "All Seeks visible • Click a subcategory to filter",
  },
  "feed.filteredBy": {
    EN: "Filtered by",
    ZH: "已按子分类筛选",
    ES: "Filtrado por",
    HI: "फ़िल्टर किया गया",
    DE: "Gefiltert nach",
    FR: "Filtré par",
    JA: "絞り込み条件",
    AR: "مصفى حسب",
    PT: "Filtrado por",
    "EN-GB": "Filtered by",
  },
  "feed.clearFilter": {
    EN: "Clear filter",
    ZH: "清除筛选",
    ES: "Borrar filtro",
    HI: "फ़िल्टर हटाएं",
    DE: "Filter löschen",
    FR: "Effacer le filtre",
    JA: "絞り込み解除",
    AR: "إزالة التصفية",
    PT: "Limpar filtro",
    "EN-GB": "Clear filter",
  },
  "feed.all": {
    EN: "All",
    ZH: "全部",
    ES: "Todos",
    HI: "सभी",
    DE: "Alle",
    FR: "Tous",
    JA: "すべて",
    AR: "الكل",
    PT: "Todos",
    "EN-GB": "All",
  },
  "feed.noSeeksFound": {
    EN: "No Seeks match this filter",
    ZH: "暂无匹配该条件的Seeks视频",
    ES: "No se encontraron Seeks para este filtro",
    HI: "इस फ़िल्टर से कोई सीक्स मेल नहीं खाता",
    DE: "Keine passenden Seeks gefunden",
    FR: "Aucun Seek ne correspond à ce filtre",
    JA: "一致するSeeks動画が見つかりませんでした",
    AR: "لم يتم العثور على مقاطع Seeks مطابقة",
    PT: "Nenhum Seek corresponde a este filtro",
    "EN-GB": "No Seeks match this filter",
  },
  "feed.showAllSeeks": {
    EN: "Show All Seeks",
    ZH: "查看全部Seeks",
    ES: "Mostrar todos los Seeks",
    HI: "सभी सीक्स दिखाएं",
    DE: "Alle Seeks anzeigen",
    FR: "Afficher tous les Seeks",
    JA: "すべてのSeeksを表示",
    AR: "عرض جميع مقاطع Seeks",
    PT: "Mostrar todos os Seeks",
    "EN-GB": "Show All Seeks",
  },

  // Notifications
  "notifications.title": {
    EN: "Notifications Center",
    ZH: "通知中心",
    ES: "Centro de Notificaciones",
    HI: "सूचना केंद्र",
    DE: "Benachrichtigungszentrum",
    FR: "Centre de Notifications",
    JA: "通知センター",
    AR: "مركز الإشعارات",
    PT: "Central de Notificações",
    "EN-GB": "Notifications Centre",
  },
  "notifications.all": {
    EN: "All",
    ZH: "全部",
    ES: "Todas",
    HI: "सभी",
    DE: "Alle",
    FR: "Toutes",
    JA: "すべて",
    AR: "الكل",
    PT: "Todas",
    "EN-GB": "All",
  },
  "notifications.unread": {
    EN: "Unread",
    ZH: "未读",
    ES: "No leídas",
    HI: "अपठित",
    DE: "Ungelesen",
    FR: "Non lues",
    JA: "未読",
    AR: "غير مقروء",
    PT: "Não lidas",
    "EN-GB": "Unread",
  },
  "notifications.markAllAsRead": {
    EN: "Mark all as read",
    ZH: "全部标为已读",
    ES: "Marcar todo como leído",
    HI: "सभी पढ़ा हुआ चिह्नित करें",
    DE: "Alle als gelesen markieren",
    FR: "Tout marquer comme lu",
    JA: "すべて既読にする",
    AR: "تحديد الكل كمقروء",
    PT: "Marcar tudo como lido",
    "EN-GB": "Mark all as read",
  },
};

// Machinery Category name translations dictionary
const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Official Priority Roots
  "Agricultural Machinery": {
    ZH: "农业机械",
    ES: "Maquinaria Agrícola",
    HI: "कृषि मशीनरी",
    DE: "Landmaschinen",
    FR: "Machines Agricoles",
    JA: "農業機械",
    AR: "الآلات الزراعية",
    PT: "Máquinas Agrícolas",
  },
  "Agriculture": {
    ZH: "农业机械",
    ES: "Agricultura",
    HI: "कृषि मशीनरी",
    DE: "Landwirtschaft",
    FR: "Machines Agricoles",
    JA: "農業機械",
    AR: "الآلات الزراعية",
    PT: "Máquinas Agrícolas",
  },
  "DIY Machinery": {
    ZH: "DIY手工与小型机械",
    ES: "Maquinaria DIY",
    HI: "DIY मशीनरी",
    DE: "Heimwerkermaschinen",
    FR: "Machines de Bricolage",
    JA: "DIY機械",
    AR: "آلات الأعمال اليدوية",
    PT: "Máquinas DIY",
  },
  "Electronics Manufacturing Machinery": {
    ZH: "电子制造与SMT设备",
    ES: "Fabricación Electrónica",
    HI: "इलेक्ट्रॉनिक्स विनिर्माण उपकरण",
    DE: "Elektronikfertigung",
    FR: "Fabrication Électronique",
    JA: "電子機器製造装置",
    AR: "معدات تصنيع الإلكترونيات",
    PT: "Fabricação Eletrônica",
  },
  "Engineering capital Machinery": {
    ZH: "工程与重型资本机械",
    ES: "Maquinaria Pesada de Ingeniería",
    HI: "इंजीनियरिंग कैपिटल मशीनरी",
    DE: "Schwere Industriemaschinen",
    FR: "Machines d'Ingénierie Lourde",
    JA: "エンジニアリング重機械",
    AR: "آلات الهندسة الثقيلة",
    PT: "Máquinas Pesadas de Engenharia",
  },
  "Fashion Machinery": {
    ZH: "时尚与服装机械",
    ES: "Maquinaria de Moda y Textil",
    HI: "फैशन मशीनरी",
    DE: "Textil- & Modemaschinen",
    FR: "Machines Textiles et Mode",
    JA: "アパレル・服飾機械",
    AR: "آلات الأزياء والنسيج",
    PT: "Máquinas de Moda",
  },
  "Food Processing Machinery": {
    ZH: "食品加工与饮料机械",
    ES: "Procesamiento de Alimentos",
    HI: "खाद्य प्रसंस्करण मशीनरी",
    DE: "Lebensmittelverarbeitung",
    FR: "Transformation des Aliments",
    JA: "食品加工機械",
    AR: "آلات تصنيع الأغذية",
    PT: "Processamento de Alimentos",
  },
  "Healthcare Machinery": {
    ZH: "医疗器械与制药机械",
    ES: "Maquinaria Médica y Sanitaria",
    HI: "स्वास्थ्य सेवा मशीनरी",
    DE: "Medizintechnik & Pharma",
    FR: "Machines Médicales",
    JA: "医療・製薬機械",
    AR: "الآلات الطبية والرعاية الصحية",
    PT: "Máquinas de Saúde",
  },
  "IT Machinery": {
    ZH: "信息技术与机房硬件设备",
    ES: "Maquinaria de TI",
    HI: "आईटी उपकरण मशीनरी",
    DE: "IT- & Datencenter-Geräte",
    FR: "Équipements Informatiques",
    JA: "ITハードウェア装置",
    AR: "معدات تكنولوجيا المعلومات",
    PT: "Máquinas de TI",
  },
  "Packaging Machinery": {
    ZH: "包装与灌装机械",
    ES: "Maquinaria de Embalaje",
    HI: "पैकेजिंग मशीनरी",
    DE: "Verpackungsmaschinen",
    FR: "Machines d'Emballage",
    JA: "包装機械",
    AR: "آلات التعبئة والتغليف",
    PT: "Máquinas de Embalagem",
  },
  "Pharmaceutical Machinery": {
    ZH: "制药与生物反应设备",
    ES: "Maquinaria Farmacéutica",
    HI: "फार्मास्युटिकल मशीनरी",
    DE: "Pharmazeutische Maschinen",
    FR: "Machines Pharmaceutiques",
    JA: "製薬機械",
    AR: "الآلات الصيدلانية",
    PT: "Máquinas Farmacêuticas",
  },
  "ROBOTS": {
    ZH: "工业机器人与自动化工作站",
    ES: "Robots Industriales",
    HI: "औद्योगिक रोबोट",
    DE: "Industrieroboter",
    FR: "Robots Industriels",
    JA: "産業用ロボット",
    AR: "الروبوتات الصناعية",
    PT: "Robôs Industriais",
  },
  "Renewable Energy Machinery": {
    ZH: "新能源与储能装备",
    ES: "Maquinaria de Energía Renovable",
    HI: "नवीकरणीय ऊर्जा मशीनरी",
    DE: "Erneuerbare Energietechnik",
    FR: "Équipements d'Énergie Renouvelable",
    JA: "再生可能エネルギー設備",
    AR: "آلات الطاقة المتجددة",
    PT: "Máquinas de Energia Renovável",
  },
  "Transaportation Machinery": {
    ZH: "交通运输与特种车辆",
    ES: "Maquinaria de Transporte",
    HI: "परिवहन मशीनरी",
    DE: "Transportmaschinen",
    FR: "Matériel de Transport",
    JA: "輸送・特殊車両機械",
    AR: "آلات النقل",
    PT: "Máquinas de Transporte",
  },

  // Legacy Catalog Sheet2 Roots
  "Aircraft & Ground Support Equipment": {
    ZH: "航空与地面支持设备",
    ES: "Equipos de Apoyo Aeronáutico",
    HI: "विमान और ग्राउंड सपोर्ट उपकरण",
    DE: "Luftfahrt & Bodengeräte",
    FR: "Aviation & Équipements au Sol",
    JA: "航空・地上支援装置",
    AR: "معدات الطيران والدعم الأرضي",
    PT: "Aviação e Apoio Terrestre",
  },
  "Boats & Marine Equipment": {
    ZH: "船舶与海洋装备",
    ES: "Barcos y Equipamiento Marino",
    HI: "नावें और समुद्री उपकरण",
    DE: "Boote & Marineausrüstung",
    FR: "Bateaux et Équipements Marins",
    JA: "船舶・海洋機器",
    AR: "القوارب والمعدات البحرية",
    PT: "Barcos e Equipamentos Marítimos",
  },
  "Construction": {
    ZH: "工程与建筑机械",
    ES: "Construcción",
    HI: "निर्माण मशीनरी",
    DE: "Baumaschinen",
    FR: "Engins de Construction",
    JA: "建設機械",
    AR: "آلات البناء والتشييد",
    PT: "Máquinas de Construção",
  },
  "Energy": {
    ZH: "能源与电力设备",
    ES: "Energía",
    HI: "ऊर्जा उपकरण",
    DE: "Energie & Kraftwerkstechnik",
    FR: "Énergie & Groupes Électrogènes",
    JA: "エネルギー・発電設備",
    AR: "معدات الطاقة",
    PT: "Equipamentos de Energia",
  },
  "Food & Beverage Processing": {
    ZH: "食品加工与饮料机械",
    ES: "Alimentos y Bebidas",
    HI: "खाद्य एवं पेय प्रसंस्करण",
    DE: "Lebensmittel- & Getränketechnik",
    FR: "Agroalimentaire et Boissons",
    JA: "食品・飲料加工装置",
    AR: "تصنيع الأغذية والمشروبات",
    PT: "Processamento de Alimentos",
  },
  "Forestry": {
    ZH: "林业与伐木机械",
    ES: "Maquinaria Forestal",
    HI: "वानिकी मशीनरी",
    DE: "Forstmaschinen",
    FR: "Machines Forestières",
    JA: "林業機械",
    AR: "آلات الغابات",
    PT: "Máquinas Florestais",
  },
  "Industrial Automation": {
    ZH: "工业自动化设备",
    ES: "Automatización Industrial",
    HI: "औद्योगिक स्वचालन",
    DE: "Industrielle Automation",
    FR: "Automatisation Industrielle",
    JA: "産業用オートメーション",
    AR: "الأتمتة الصناعية",
    PT: "Automação Industrial",
  },
  "Machine Tools": {
    ZH: "机床与金属加工设备",
    ES: "Máquinas Herramienta",
    HI: "मशीन टूल्स",
    DE: "Werkzeugmaschinen",
    FR: "Machines-Outils",
    JA: "工作機械",
    AR: "الآلات والأدوات",
    PT: "Máquinas-Ferramenta",
  },
  "Material handling": {
    ZH: "物料搬运与仓储设备",
    ES: "Manipulación de Materiales",
    HI: "सामग्री हैंडलिंग",
    DE: "Materialtransport & Fördertechnik",
    FR: "Manutention de Matériaux",
    JA: "搬送・マテリアルハンドリング",
    AR: "مناولة المواد",
    PT: "Movimentação de Materiais",
  },
  "Oil, Gas & Mining": {
    ZH: "石油、天然气与采矿设备",
    ES: "Petróleo, Gas y Minería",
    HI: "तेल, गैस और खनन",
    DE: "Öl, Gas & Bergbau",
    FR: "Pétrole, Gaz et Mines",
    JA: "石油・天然ガス・鉱業設備",
    AR: "النفط والغاز والتعدين",
    PT: "Petróleo, Gás e Mineração",
  },
  "Printing": {
    ZH: "印刷与图文工业设备",
    ES: "Impresión",
    HI: "प्रिंटिंग मशीनरी",
    DE: "Drucktechnik",
    FR: "Impression Industrielle",
    JA: "印刷機械",
    AR: "آلات الطباعة",
    PT: "Impressão",
  },
  "Processing": {
    ZH: "通用工艺加工设备",
    ES: "Procesamiento",
    HI: "प्रसंस्करण उपकरण",
    DE: "Verfahrenstechnik",
    FR: "Équipements de Traitement",
    JA: "プロセス加工設備",
    AR: "معدات المعالجة",
    PT: "Equipamentos de Processo",
  },
  "Semiconductors": {
    ZH: "半导体制造与光刻设备",
    ES: "Semiconductores",
    HI: "सेमीकंडक्टर्स विनिर्माण",
    DE: "Halbleiterfertigung",
    FR: "Semi-conducteurs",
    JA: "半導体製造装置",
    AR: "أشباه الموصلات",
    PT: "Semicondutores",
  },
  "Test, Lab, Medical equipment": {
    ZH: "检验、实验室与医疗设备",
    ES: "Equipos Médicos y de Laboratorio",
    HI: "परीक्षण, प्रयोगशाला एवं चिकित्सा उपकरण",
    DE: "Labor- & Medizintechnik",
    FR: "Équipements de Laboratoire & Médicaux",
    JA: "検査・研究・医療機器",
    AR: "معدات المختبرات والاختبار والأجهزة الطبية",
    PT: "Equipamentos Médicos e de Laboratório",
  },
  "Textile and leather manufacturing": {
    ZH: "纺织与皮革工业机械",
    ES: "Fabricación Textil y Cuero",
    HI: "कपड़ा और चमड़ा निर्माण",
    DE: "Textil- & Lederverarbeitung",
    FR: "Fabrication Textile et Cuir",
    JA: "繊維・皮革製造装置",
    AR: "صناعة المنسوجات والجلود",
    PT: "Fabricação Têxtil e Couro",
  },
  "Transportation & Trailers": {
    ZH: "特种运输与挂车设备",
    ES: "Transporte y Remolques",
    HI: "परिवहन और ट्रेलर",
    DE: "Nutzfahrzeuge & Anhänger",
    FR: "Transport et Remorques",
    JA: "輸送用トレーラー・重火器",
    AR: "مركبات النقل والمقطورات",
    PT: "Transporte e Reboques",
  },
  "Waste & Recycling": {
    ZH: "固废处理与环保回收设备",
    ES: "Residuos y Reciclaje",
    HI: "अपशिष्ट और पुनर्चक्रण",
    DE: "Abfall- & Recyclingtechnik",
    FR: "Recyclage et Gestion des Déchets",
    JA: "廃棄物処理・リサイクル機器",
    AR: "إدارة النفايات وإعادة التدوير",
    PT: "Resíduos e Reciclagem",
  },
  "Woodworking": {
    ZH: "木工加工装备",
    ES: "Trabajo de la Madera",
    HI: "काष्ठकला मशीनरी",
    DE: "Holzbearbeitungsmaschinen",
    FR: "Machines à Bois",
    JA: "木工加工機械",
    AR: "آلات تشغيل الخشب",
    PT: "Marcenaria e Madeira",
  },
  "Other": {
    ZH: "其他通用工业设备",
    ES: "Otros Equipos",
    HI: "अन्य उपकरण",
    DE: "Sonstige Anlagen",
    FR: "Autres Équipements",
    JA: "その他汎用設備",
    AR: "معدات صناعية أخرى",
    PT: "Outros Equipamentos",
  },
  "CNC Machining": {
    ZH: "数控加工中心",
    ES: "Mecanizado CNC",
    HI: "सीएनसी मशीनिंग",
    DE: "CNC-Bearbeitung",
    FR: "Usinage CNC",
    JA: "CNC加工",
    AR: "تشغيل المعادن باستخدام الحاسب الآلي",
    PT: "Usinagem CNC",
  },
  "Forging & Casting": {
    ZH: "锻造与铸造装备",
    ES: "Forja y Fundición",
    HI: "फोर्जिंग और कास्टिंग",
    DE: "Schmieden & Gießen",
    FR: "Forge et Fonderie",
    JA: "鍛造・鋳造",
    AR: "الحدادة والسباكة",
    PT: "Forjamento e Fundição",
  },
  "Molds & Tooling": {
    ZH: "精密模具与工业工装",
    ES: "Moldes y Herramientas",
    HI: "मोल्ड्स और टूलिंग",
    DE: "Formen & Werkzeuge",
    FR: "Moules et Outillage",
    JA: "金型・工具",
    AR: "القوالب والأدوات",
    PT: "Moldes e Ferramentais",
  },
  "Sheet Metal Fabrication": {
    ZH: "钣金加工与冲压成型",
    ES: "Fabricación de Chapa Metálica",
    HI: "शीट मेटल फैब्रिकेशन",
    DE: "Blechbearbeitung",
    FR: "Tôlerie Industrielle",
    JA: "板金加工",
    AR: "تشكيل الصفائح المعدنية",
    PT: "Caldeiraria e Chapas",
  },
};

// Country names translations dictionary
const COUNTRY_TRANSLATIONS: Record<string, Record<string, string>> = {
  "India": {
    ZH: "印度",
    ES: "India",
    HI: "भारत",
    DE: "Indien",
    FR: "Inde",
    JA: "インド",
    AR: "الهند",
    PT: "Índia",
  },
  "China": {
    ZH: "中国",
    ES: "China",
    HI: "चीन",
    DE: "China",
    FR: "Chine",
    JA: "中国",
    AR: "الصين",
    PT: "China",
  },
  "Germany": {
    ZH: "德国",
    ES: "Alemania",
    HI: "जर्मनी",
    DE: "Deutschland",
    FR: "Allemagne",
    JA: "ドイツ",
    AR: "ألمانيا",
    PT: "Alemanha",
  },
  "USA": {
    ZH: "美国",
    ES: "EE. UU.",
    HI: "यूएसए",
    DE: "USA",
    FR: "États-Unis",
    JA: "アメリカ",
    AR: "الولايات المتحدة",
    PT: "EUA",
  },
  "UAE": {
    ZH: "阿联酋",
    ES: "EAU",
    HI: "यूएई",
    DE: "VAE",
    FR: "ÉAU",
    JA: "アラブ首長国連邦",
    AR: "الإمارات",
    PT: "EAU",
  },
  "Vietnam": {
    ZH: "越南",
    ES: "Vietnam",
    HI: "वियतनाम",
    DE: "Vietnam",
    FR: "Vietnam",
    JA: "ベトナム",
    AR: "فيتنام",
    PT: "Vietnã",
  },
  "Japan": {
    ZH: "日本",
    ES: "Japón",
    HI: "जापान",
    DE: "Japan",
    FR: "Japon",
    JA: "日本",
    AR: "اليابان",
    PT: "Japão",
  },
  "Turkey": {
    ZH: "土耳其",
    ES: "Turquía",
    HI: "तुर्की",
    DE: "Türkei",
    FR: "Turquie",
    JA: "トルコ",
    AR: "تركيا",
    PT: "Turquia",
  },
  "Kenya": {
    ZH: "肯尼亚",
    ES: "Kenia",
    HI: "केन्या",
    DE: "Kenia",
    FR: "Kenya",
    JA: "ケニア",
    AR: "كينيا",
    PT: "Quênia",
  },
  "Brazil": {
    ZH: "巴西",
    ES: "Brasil",
    HI: "ब्राज़ील",
    DE: "Brasilien",
    FR: "Brésil",
    JA: "ブラジル",
    AR: "البرازيل",
    PT: "Brasil",
  },
};

// Product names translations dictionary
const PRODUCT_TRANSLATIONS: Record<string, Record<string, string>> = {
  "CNC Machined Components": {
    ZH: "数控机加工精密零部件",
    ES: "Componentes Mecanizados CNC",
    HI: "सीएनसी मशीन्ड कंपोनेंट्स",
    DE: "CNC-gefräste Bauteile",
    FR: "Composants Usinés CNC",
    JA: "CNC精密加工部品",
    AR: "مكونات مصنعة بتقنية CNC",
    PT: "Componentes Usinados CNC",
  },
  "Forged Drive Shafts": {
    ZH: "重型锻造传动轴总成",
    ES: "Ejes de Transmisión Forjados",
    HI: "जाली ड्राइव शाफ्ट",
    DE: "Geschmiedete Antriebswellen",
    FR: "Arbres de Transmission Forgés",
    JA: "鍛造ドライブシャフト",
    AR: "أعمدة نقل حركة مطروقة",
    PT: "Eixos de Transmissão Forjados",
  },
  "Sheet Metal Enclosures": {
    ZH: "钣金防护机箱机柜",
    ES: "Gabinetes de Chapa Metálica",
    HI: "शीट मेटल बाड़े",
    DE: "Blechgehäuse für Industrieanlagen",
    FR: "Boîtiers en Tôle Métallique",
    JA: "精密板金エンクロージャー",
    AR: "حاويات الصفائح المعدنية",
    PT: "Gabinetes de Chapa Metálica",
  },
  "Hydraulic Gear Pump": {
    ZH: "工业液压齿轮泵",
    ES: "Bomba Hidráulica de Engranajes",
    HI: "हाइड्रोलिक गियर पंप",
    DE: "Hydraulische Zahnradpumpe",
    FR: "Pompe Hydraulique à Engrenages",
    JA: "産業用油圧ギアポンプ",
    AR: "مضخة تروس هيدروليكية",
    PT: "Bomba de Engrenagens Hidráulica",
  },
  "Closed Die Forgings": {
    ZH: "闭式精密模锻件",
    ES: "Forjados en Matriz Cerrada",
    HI: "क्लोज्ड डाई फोर्जिंग्स",
    DE: "Gesenkschmiedeteile",
    FR: "Pièces Forgées en Matrice Fermée",
    JA: "型鍛造精密部品",
    AR: "مطروقات القوالب المغلقة",
    PT: "Forjados em Matriz Fechada",
  },
  "5-Axis High-Speed CNC Milling Spindle": {
    ZH: "5轴高速数控电主轴",
    ES: "Husillo de Fresado CNC de 5 Ejes",
    HI: "5-अक्ष हाई-स्पीड सीएनसी मिलिंग स्पिंडल",
    DE: "5-Achsen-CNC-Hochgeschwindigkeits-Frässpindel",
    FR: "Broche de Fraisage CNC 5 Axes",
    JA: "5軸高速CNCフライス主軸",
    AR: "مغزل تفريز CNC خماسي المحاور",
    PT: "Spindle de Fresamento CNC de 5 Eixos",
  },
  "Tungsten Carbide End Mill Cutters (5-Piece Set)": {
    ZH: "钨钢立铣刀(5件套)",
    ES: "Fresas de Carburo de Tungsteno (Set 5)",
    HI: "टंगस्टन कार्बाइड एंड मिल कटर",
    DE: "Wolframcarbid-Schaftfräser (5er-Set)",
    FR: "Fraises en Carbure de Tungstène (Jeu de 5)",
    JA: "超硬エンドミルカッター (5本セット)",
    AR: "قواطع تفريز كربيد التنجستن (طقم 5 قطع)",
    PT: "Fresas de Metal Duro (Conjunto 5 peças)",
  },
  "Precision CNC Turned Flange Adaptor": {
    ZH: "精密数控车削法兰接头",
    ES: "Adaptador de Brida Torneado CNC",
    HI: "प्रिसिजन सीएनसी टर्नड निकला हुआ किनारा एडाप्टर",
    DE: "Präzisions-CNC-Flanschadapter",
    FR: "Adaptateur de Bride Tourné CNC",
    JA: "精密CNC旋盤フランジアダプター",
    AR: "محول فلنجة مخرطة بدقة CNC",
    PT: "Adaptador de Flange Torneado CNC",
  },
};

// Unit translations dictionary
const UNIT_TRANSLATIONS: Record<string, Record<string, string>> = {
  "piece": {
    ZH: "件",
    ES: "pieza",
    HI: "पीस",
    DE: "Stk.",
    FR: "pièce",
    JA: "個",
    AR: "قطعة",
    PT: "peça",
  },
  "pieces": {
    ZH: "件",
    ES: "piezas",
    HI: "पीस",
    DE: "Stk.",
    FR: "pièces",
    JA: "個",
    AR: "قطع",
    PT: "peças",
  },
  "set": {
    ZH: "套",
    ES: "set",
    HI: "सेट",
    DE: "Set",
    FR: "ensemble",
    JA: "セット",
    AR: "طقم",
    PT: "conjunto",
  },
  "sets": {
    ZH: "套",
    ES: "sets",
    HI: "सेट",
    DE: "Sets",
    FR: "ensembles",
    JA: "セット",
    AR: "أطقم",
    PT: "conjuntos",
  },
  "unit": {
    ZH: "台",
    ES: "unidad",
    HI: "इकाई",
    DE: "Einheit",
    FR: "unité",
    JA: "台",
    AR: "وحدة",
    PT: "unidade",
  },
  "units": {
    ZH: "台",
    ES: "unidades",
    HI: "इकाइयां",
    DE: "Einheiten",
    FR: "unités",
    JA: "台",
    AR: "وحدات",
    PT: "unidades",
  },
};

// Reel title and description translations
const REEL_TRANSLATIONS: Record<string, Record<string, string>> = {
  "China-Made Agricultural Machinery & Harvesters": {
    ZH: "中国制造农业机械与高效联合收割机",
    ES: "Maquinaria Agrícola y Cosechadoras Hechas en China",
    HI: "चीन निर्मित कृषि मशीनरी और हार्वेस्टर",
    DE: "Landmaschinen & Erntemaschinen aus China",
    FR: "Machines Agricoles et Moissonneuses Fabriquées en Chine",
    JA: "中国製農業機械・高効率コンバインハーベスター",
    AR: "الآلات الزراعية والحصادات المصنوعة في الصين",
    PT: "Maquinário Agrícola e Colheitadeiras Fabricados na China",
  },
  "Innovated to boost grain production! Automated harvester engineering, chassis assembly, and high-efficiency field operations.": {
    ZH: "助力粮食丰产丰收！全自动化收割工程技术、坚固底盘总装实拍与高效田间作业演示。",
    ES: "¡Innovado para aumentar la producción de granos! Ingeniería de cosechadoras automatizadas y ensamblaje de chasis.",
    HI: "अनाज उत्पादन बढ़ाने के लिए नवाचार! स्वचालित हार्वेस्टर इंजीनियरिंग और कुशल फील्ड संचालन।",
    DE: "Innoviert zur Steigerung der Getreideproduktion! Automatisierte Erntemaschinentechnik und Feldbetrieb.",
    FR: "Innové pour stimuler la production céréalière ! Ingénierie automatisée des moissonneuses.",
    JA: "穀物増産を加速！自動収穫機エンジニアリング、頑丈なシャーシ組立、高効率なフィールド実演。",
    AR: "مبتكرة لزيادة إنتاج الحبوب! هندسة الحصادات الآلية وتشغيل عالي الكفاءة.",
    PT: "Inovado para aumentar a produção de grãos! Engenharia de colheitadeiras automatizadas e montagem de chassi.",
  },
  "Precision Forging & Heavy Press Line": {
    ZH: "精密模锻与大型重工液压机生产线",
    ES: "Forja de Precisión y Línea de Prensa Pesada",
    HI: "प्रिसिजन फोर्जिंग और हेवी प्रेस लाइन",
    DE: "Präzisionsschmiede & Schwere Pressenlinie",
    FR: "Forge de Précision et Ligne de Presse Lourde",
    JA: "精密鍛造＆大型重工油圧プレス製造ライン",
    AR: "الحدادة الدقيقة وخط المكابس الثقيلة",
    PT: "Forjamento de Precisão e Linha de Prensa Pesada",
  },
  "Watch our multi-station closed-die forging line delivering unmatched durability and mechanical integrity for export drivelines.": {
    ZH: "实拍多工位闭式模锻生产线，为出口级传动系统提供无与伦比的机械强度与耐用性。",
    ES: "Mire nuestra línea de forja en matriz cerrada que ofrece una durabilidad y resistencia inigualables.",
    HI: "निर्यात ड्राइवलाइनों के लिए बेजोड़ स्थायित्व प्रदान करने वाली हमारी बहु-स्टेशन फोर्जिंग लाइन देखें।",
    DE: "Sehen Sie sich unsere Gesenkschmiedelinie für unübertroffene Haltbarkeit von Antriebssträngen an.",
    FR: "Découvrez notre ligne de forgeage délivrant une durabilité et une intégrité mécanique inégalées.",
    JA: "輸出仕様のドライブトレイン向けに高耐久性と強度を実現する多工程型鍛造ラインの実演映像。",
    AR: "شاهد خط الحدادة متعدد المحطات الذي يوفر متانة لا مثيل لها لخطوط نقل الحركة التصديرية.",
    PT: "Assista à nossa linha de forjamento em matriz fechada que oferece durabilidade incomparável.",
  },
  "Live Product Lineup: High-Precision CNC Spindles, Cutters & Adaptors": {
    ZH: "主打精密装备实拍：高速数控电主轴、钨钢铣刀及法兰适配器",
    ES: "Gama de Productos en Vivo: Husillos CNC de Precisión, Fresas y Adaptadores",
    HI: "लाइव उत्पाद लाइनअप: उच्च-परिशुद्धता सीएनसी स्पिंडल, कटर और एडेप्टर",
    DE: "Live-Produktaufstellung: Hochpräzisions-CNC-Spindeln, Fräser & Adapter",
    FR: "Gamme de Produits en Direct : Broches CNC Haute Précision, Fraises & Adaptateurs",
    JA: "主力精密機械実演：高速CNC電主軸・超硬エンドミル・高精度フランジアダプター",
    AR: "مجموعة منتجات حية: مغازل CNC عالية الدقة وقواطع ومحولات",
    PT: "Linha de Produtos ao Vivo: Spindles CNC de Precisão, Fresas e Adaptadores",
  },
  "Watch our top 4 exported precision machinery components running live on our Pune machining center. Direct factory pricing with MOQ starting at 1 unit.": {
    ZH: "实拍4款核心出口级数控配件，原厂直供批发价，支持1件起订（MOQ）。",
    ES: "Vea nuestros 4 principales componentes de maquinaria de precisión en acción. Precios directos de fábrica con MOQ desde 1 unidad.",
    HI: "हमारे पुणे मशीनिंग सेंटर पर लाइव चलने वाले हमारे शीर्ष 4 निर्यात परिशुद्धता मशीनरी घटकों को देखें। 1 इकाई से शुरू होने वाले एमओक्यू के साथ प्रत्यक्ष फैक्टरी मूल्य निर्धारण।",
    DE: "Erleben Sie unsere 4 führenden Präzisionskomponenten live. Direkte Fabrikpreise mit MOQ ab 1 Stück.",
    FR: "Regardez nos 4 principaux composants usinés en direct. Prix direct usine avec MOQ à partir de 1 unité.",
    JA: "自社マシニングセンタで稼働中の輸出向け主要4製品の実演。原価直販価格、最小ロット1点(MOQ)から対応。",
    AR: "شاهد أهم 4 مكونات آلات دقيقة تصديرية تعمل مباشرة في مركز التصنيع لدينا. أسعار مصنع مباشرة مع حد أدنى للطلب يبدأ من وحدة واحدة.",
    PT: "Assista aos nossos 4 principais componentes de precisão exportados em operação. Preços diretos de fábrica com MOQ a partir de 1 unidade.",
  },
};

type RegionalSettingsContextType = {
  selectedLanguage: LanguageOption;
  selectedCurrency: CurrencyOption;
  setLanguage: (lang: LanguageOption) => void;
  setCurrency: (curr: CurrencyOption) => void;
  t: (key: string, fallback?: string) => string;
  formatPrice: (amountInr: number) => string;
  translateCategory: (categoryName: string) => string;
  translateCountry: (countryName: string) => string;
  translateProduct: (productName: string) => string;
  translateUnit: (unitName: string) => string;
  translateReelTitle: (title: string) => string;
  translateReelDescription: (desc: string) => string;
};

const RegionalSettingsContext = createContext<RegionalSettingsContextType | null>(null);

export function RegionalSettingsProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(CURRENCIES[0]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("seek_lang");
      const savedCurr = localStorage.getItem("seek_curr");

      if (savedLang) {
        const found = LANGUAGES.find((l) => l.code === savedLang);
        if (found) setSelectedLanguage(found);
      }
      if (savedCurr) {
        const found = CURRENCIES.find((c) => c.code === savedCurr);
        if (found) setSelectedCurrency(found);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetLanguage = (lang: LanguageOption) => {
    setSelectedLanguage(lang);
    try {
      localStorage.setItem("seek_lang", lang.code);
      document.cookie = `seek_lang=${lang.code}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  };

  const handleSetCurrency = (curr: CurrencyOption) => {
    setSelectedCurrency(curr);
    try {
      localStorage.setItem("seek_curr", curr.code);
      document.cookie = `seek_curr=${curr.code}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  };

  const t = (key: string, fallback?: string): string => {
    const langCode = selectedLanguage.code;
    const item = TRANSLATIONS[key];
    if (item) {
      if (item[langCode]) return item[langCode];
      if (item["EN"]) return item["EN"];
    }
    return fallback || key;
  };

  const formatPrice = (amountInr: number): string => {
    const converted = amountInr * selectedCurrency.rateFromInr;
    const sym = selectedCurrency.symbol;

    if (selectedCurrency.code === "INR") {
      return `${sym}${amountInr.toLocaleString("en-IN")}`;
    }

    if (selectedCurrency.code === "JPY") {
      return `${sym}${Math.round(converted).toLocaleString("ja-JP")}`;
    }

    if (converted >= 1000) {
      return `${sym}${Math.round(converted).toLocaleString()}`;
    }

    if (converted < 10) {
      return `${sym}${converted.toFixed(2)}`;
    }

    return `${sym}${converted.toFixed(1)}`;
  };

  const translateCategory = (categoryName: string): string => {
    const langCode = selectedLanguage.code;
    if (langCode === "EN" || langCode === "EN-GB") return categoryName;

    const matched = CATEGORY_TRANSLATIONS[categoryName];
    if (matched && matched[langCode]) {
      return matched[langCode];
    }
    return categoryName;
  };

  const translateCountry = (countryName: string): string => {
    const langCode = selectedLanguage.code;
    if (langCode === "EN" || langCode === "EN-GB") return countryName;

    const matched = COUNTRY_TRANSLATIONS[countryName];
    if (matched && matched[langCode]) {
      return matched[langCode];
    }
    return countryName;
  };

  const translateProduct = (productName: string): string => {
    const langCode = selectedLanguage.code;
    if (langCode === "EN" || langCode === "EN-GB") return productName;

    const matched = PRODUCT_TRANSLATIONS[productName];
    if (matched && matched[langCode]) {
      return matched[langCode];
    }
    return productName;
  };

  const translateUnit = (unitName: string): string => {
    const langCode = selectedLanguage.code;
    if (langCode === "EN" || langCode === "EN-GB") return unitName;

    const lower = unitName.toLowerCase();
    const matched = UNIT_TRANSLATIONS[lower];
    if (matched && matched[langCode]) {
      return matched[langCode];
    }
    return unitName;
  };

  const translateReelTitle = (title: string): string => {
    const langCode = selectedLanguage.code;
    if (langCode === "EN" || langCode === "EN-GB") return title;

    const matched = REEL_TRANSLATIONS[title];
    if (matched && matched[langCode]) {
      return matched[langCode];
    }
    return title;
  };

  const translateReelDescription = (desc: string): string => {
    const langCode = selectedLanguage.code;
    if (langCode === "EN" || langCode === "EN-GB") return desc;

    const matched = REEL_TRANSLATIONS[desc];
    if (matched && matched[langCode]) {
      return matched[langCode];
    }
    return desc;
  };

  return (
    <RegionalSettingsContext.Provider
      value={{
        selectedLanguage,
        selectedCurrency,
        setLanguage: handleSetLanguage,
        setCurrency: handleSetCurrency,
        t,
        formatPrice,
        translateCategory,
        translateCountry,
        translateProduct,
        translateUnit,
        translateReelTitle,
        translateReelDescription,
      }}
    >
      {children}
    </RegionalSettingsContext.Provider>
  );
}

export function useRegionalSettings() {
  const context = useContext(RegionalSettingsContext);
  if (!context) {
    // Fallback safe values for SSR or unmounted state
    return {
      selectedLanguage: LANGUAGES[0],
      selectedCurrency: CURRENCIES[0],
      setLanguage: () => {},
      setCurrency: () => {},
      t: (key: string, fallback?: string) => fallback || key,
      formatPrice: (amountInr: number) => `₹${amountInr.toLocaleString()}`,
      translateCategory: (name: string) => name,
      translateCountry: (name: string) => name,
      translateProduct: (name: string) => name,
      translateUnit: (unit: string) => unit,
      translateReelTitle: (title: string) => title,
      translateReelDescription: (desc: string) => desc,
    };
  }
  return context;
}

