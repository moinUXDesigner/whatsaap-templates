/**
 * WhatsApp message template definitions for AHI Portal alerts — Telugu
 * counterparts (converted from AHI_Alert_Message_Formats_Approval_req.docx).
 * Each entry's `example` values fill the {{n}} placeholders in `body` for
 * Meta's template review. Pairs with the English templates in ahatemplates.js.
 */
module.exports = [

  {
    name: "ahiportallive_te",
    body: "గౌరవనీయులు {{1}} గారు, AHI పోర్టల్ ట్రాన్స్‌ఫార్మర్ ఆరోగ్య రికార్డులు, పరీక్ష ఫలితాలు, AHI గ్రేడ్‌లు మరియు అలర్ట్‌ల కోసం అధికారిక APTRANSCO వేదిక. దయచేసి {{2}} వద్ద లాగిన్ అయి మీ ఆస్తులను పరిశీలించి, సమయానుకూల నిర్వహణ నిర్ణయాల కోసం డేటాను నవీకరించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "https://aptransco.gov.in"]
  },
  {
    name: "ahidataentrycoverage_te",
    body: "గౌరవనీయులు {{1}} గారు, AHI డేటా ఎంట్రీ కవరేజ్ పూర్తి చేయడానికి {{2}} పరిధిలో పెండింగ్‌లో ఉన్న గత ట్రాన్స్‌ఫార్మర్ పరీక్ష డేటాను నమోదు చేయండి. సమర్పించిన డేటా ఆధారంగా గ్రేడ్‌లు, అలర్ట్‌లు మరియు నిర్వహణ సిఫార్సులు రూపొందుతాయి కాబట్టి ఖచ్చితమైన నమోదు అవసరం. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Vijayawada 220kV Substation"]
  },
  {
    name: "ahiportalmaint_te",
    body: "గౌరవనీయులు {{1}} గారు, AHI పోర్టల్ {{2}} న {{3}} నుండి {{4}} వరకు షెడ్యూల్డ్ నిర్వహణలో ఉంటుంది. దయచేసి అత్యవసర పనులను నిర్వహణ సమయానికి ముందే సేవ్ చేయండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "15-07-2026", "10:00 AM", "12:00 PM"]
  },
  {
    name: "ahiportalmaintnow_te",
    body: "గౌరవనీయులు {{1}} గారు, AHI పోర్టల్ ప్రస్తుతం నిర్వహణలో ఉంది. సాధారణ సేవ {{2}} నాటికి పునరుద్ధరించబడే అవకాశం ఉంది. దయచేసి పునరుద్ధరణ తరువాత మళ్లీ ప్రయత్నించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "12:00 PM"]
  },
  {
    name: "ahiportalrestart_te",
    body: "గౌరవనీయులు {{1}} గారు, AHI పోర్టల్ {{2}} కు రీస్టార్ట్ చేయబడింది మరియు ఇప్పుడు పనిచేస్తోంది. మీరు డేటా నమోదు చేస్తుంటే, చివరిగా సేవ్ చేసిన రికార్డును మరోసారి పరిశీలించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "12:05 PM"]
  },
  {
    name: "ahisubshutdown_te",
    body: "గౌరవనీయులు {{1}} గారు, {{2}} వద్ద {{3}} న {{4}} నుండి {{5}} వరకు ప్రణాళికాబద్ధమైన షట్‌డౌన్ షెడ్యూల్ చేయబడింది. ఆమోదిత విధానాల ప్రకారం పరీక్షలు మరియు స్విచింగ్ కార్యకలాపాలను సమన్వయం చేయండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Vijayawada 220kV SS", "20-07-2026", "09:00 AM", "01:00 PM"]
  },
  {
    name: "ahigradedalert_te",
    body: "గౌరవనీయులు {{1}} గారు, {{2}} PTR, {{3}} వద్ద AHI గ్రేడ్ D గా ఉంది; బలహీన భాగం {{4}}. సిఫార్సు: తాజా పరీక్ష ఫలితాలను ధృవీకరించి, పరికరాన్ని తనిఖీ చేసి ప్రణాళికాబద్ధ నిర్వహణను షెడ్యూల్ చేయండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "Oil Quality"]
  },
  {
    name: "ahigradeealert_te",
    body: "గౌరవనీయులు {{1}} గారు, {{2}} PTR, {{3}} వద్ద AHI గ్రేడ్ E గా ఉంది; బలహీన భాగం {{4}}. సిఫార్సు: ప్రాధాన్యతతో తనిఖీ ఏర్పాటు చేసి, అసాధారణ పరీక్ష ఫలితాలను ధృవీకరించి సరిదిద్దే చర్యను నమోదు చేయండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "DGA"]
  },
  {
    name: "ahigradefalert_te",
    body: "గౌరవనీయులు {{1}} గారు, {{2}} PTR, {{3}} వద్ద AHI గ్రేడ్ F గా ఉంది; కీలక భాగం {{4}}. సిఫార్సు: వెంటనే ఇంజనీరింగ్ సమీక్ష చేసి, కీలక పరీక్షలను ధృవీకరించి, ఆమోదిత భద్రతా విధానాలను పాటించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "Bushing Tan Delta"]
  },
  {
    name: "ahitestgradeadvice_te",
    body: "గౌరవనీయులు {{1}} గారు, {{2}} పరీక్ష గ్రేడ్ {{3}} PTR, {{4}} వద్ద {{5}} గా ఉంది. సిఫార్సు: విలువ మరియు ట్రెండ్‌ను పరిశీలించి, అసాధారణంగా ఉంటే పరీక్షను మళ్లీ చేయండి లేదా ధృవీకరించండి, తీసుకున్న చర్యను నమోదు చేయండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Winding Resistance", "PTR-105", "Vijayawada 220kV SS", "Grade E"]
  },
  {
    name: "ahiparamlimit_te",
    body: "గౌరవనీయులు {{1}} గారు, {{2}}, {{3}} PTR, {{4}} వద్ద {{5}} స్థాయికి చేరింది. సిఫార్సు: తాజా ఫలితం మరియు ట్రెండ్ చరిత్రను పరిశీలించి ప్రమాణాల ప్రకారం చర్య తీసుకోండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Oil Quality", "PTR-105", "Vijayawada 220kV SS", "Grade E / BDV low"]
  },
  {
    name: "ahigaslimit_te",
    body: "గౌరవనీయులు {{1}} గారు, DGA గ్యాస్ అలర్ట్: {{2}}, {{3}} PTR, {{4}} వద్ద సాధారణ విలువకు మించి ఉంది; స్కోర్ {{5}}/5. సిఫార్సు: DGA ట్రెండ్‌ను పరిశీలించి అత్యవసరంగా నిర్ధారణ చేయండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "C2H2 Acetylene", "PTR-105", "Vijayawada 220kV SS", "4"]
  },
  {
    name: "ahidesigngroup_te",
    body: "గౌరవనీయులు {{1}} గారు, డిజైన్ గ్రూప్ {{2}} అలర్ట్: మూల PTR {{3}} గ్రేడ్ F లో ఉంది. సిఫార్సు: {{4}} వద్ద ఉన్న సహోదర PTR {{5}} ను పరిశీలించి సమాన ప్రమాద పరీక్ష ఫలితాలను సమీక్షించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "DG-220-ABB-01", "PTR-105", "Vijayawada 220kV SS", "PTR-106"]
  },
  {
    name: "ahitestdue_te",
    body: "గౌరవనీయులు {{1}} గారు, {{2}} పరీక్ష {{3}} PTR, {{4}} వద్ద {{5}} లోపు చేయవలసి ఉంది. దయచేసి పరీక్షను షెడ్యూల్ చేసి ఖచ్చితమైన ఫలితాలను AHI పోర్టల్‌లో అప్‌లోడ్ చేయండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "DGA", "PTR-105", "Vijayawada 220kV SS", "25-07-2026"]
  },
  {
    name: "ahitestoverdue_te",
    body: "గౌరవనీయులు {{1}} గారు, {{2}} పరీక్ష {{3}} PTR, {{4}} వద్ద {{5}} నుండి ఆలస్యమైంది. దయచేసి వెంటనే పరీక్షను ఏర్పాటు చేసి ఖచ్చితమైన ఫలితాలను AHI పోర్టల్‌లో నవీకరించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Oil Quality", "PTR-105", "Vijayawada 220kV SS", "10-07-2026"]
  },
  {
    name: "ahisampleupdated_te",
    body: "గౌరవనీయులు {{1}} గారు, {{2}} PTR, {{3}} వద్ద {{4}} డేటా {{5}} ద్వారా నమోదు చేయబడింది. దయచేసి నవీకరించిన ఫలితం మరియు AHI సిఫార్సును పరిశీలించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "DGA", "SAP"]
  },
  {
    name: "ahiescalation_te",
    body: "గౌరవనీయులు {{1}} గారు, ఎస్కలేషన్: {{2}} అలర్ట్ {{3}} PTR, {{4}} వద్ద {{5}} గంటలకు పైగా పెండింగ్‌లో ఉంది. దయచేసి వెంటనే పరిశీలించి చర్య తీసుకొని అంగీకరించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "AHI Grade E", "PTR-105", "Vijayawada 220kV SS", "72"]
  },
  {
    name: "ahibroadcastinfo_te",
    body: "గౌరవనీయులు {{1}} గారు, AHI పోర్టల్ సమాచారం: {{2}}, {{3}} కోసం. {{4}}. వివరాల కోసం దయచేసి పోర్టల్‌ను పరిశీలించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Data Verification Drive", "Vijayawada Circle", "Verify pending transformer records by 31-07-2026"]
  },
  {
    name: "ahitrippingalert_te",
    body: "గౌరవనీయులు {{1}} గారు, ట్రిప్పింగ్ అలర్ట్: {{2}} PTR, {{3}} వద్ద {{4}} కు ట్రిప్ అయింది. సిఫార్సు: పరికరాన్ని తనిఖీ చేసి, రిలే/ఈవెంట్ వివరాలను సమీక్షించి చర్యను AHI పోర్టల్‌లో నవీకరించండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "14-07-2026 10:30 AM"]
  },
  {
    name: "ahiloadingalert_te",
    body: "గౌరవనీయులు {{1}} గారు, లోడింగ్ అలర్ట్: {{2}} PTR, {{3}} వద్ద {{4}}% లోడింగ్ {{5}} సమయంలో నమోదైంది. సిఫార్సు: లోడింగ్ ట్రెండ్‌ను పరిశీలించి ఆమోదిత సరిదిద్దే చర్య తీసుకోండి. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "115", "last 30 minutes"]
  }
];
