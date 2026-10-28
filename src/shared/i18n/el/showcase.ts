/**
 * Greek for the side projects on the stand out front of the Work District:
 * the banner, the screens, and the card behind each one.
 */

/**
 * Names kept in Latin, as the projects and the industry write them. Listed
 * rather than left out so the coverage check can tell a deliberate
 * pass-through from a gap. JavaScript, HTML and CSS are already kept by the
 * CV's own list.
 */
const KEPT = [
  'Dental CBCT Viewer',
  'WebGL2',
  'Vite',
  'Canvas',
  'Web Audio',
  'DICOM',
  'GitHub Actions',
  'GitHub Pages',
  'MIT',
]

const AS_WRITTEN: Record<string, string> = Object.fromEntries(
  KEPT.map((term) => [term, term]),
)

export const SHOWCASE: Record<string, string> = {
  ...AS_WRITTEN,

  /* ------------------------------ The stand --------------------------- */
  'Side Projects': 'Προσωπικά Project',
  'Try <b>Dental CBCT Viewer</b>': 'Δοκίμασε το <b>Dental CBCT Viewer</b>',
  'Try <b>OXI 1940</b>': 'Παίξε το <b>ΟΧΙ 1940</b>',
  'opens in a new tab': 'ανοίγει σε νέα καρτέλα',

  /* ------------------------- Dental CBCT Viewer ----------------------- */
  'Side project · 2026': 'Προσωπικό project · 2026',
  'Dental CBCT Viewer, open on a scan':
    'Το Dental CBCT Viewer με μια εξέταση ανοιχτή',
  'On screen: an anonymised public CBCT, case K01 by Feng L, Li Z, Gu Q, Wang Y and Yu X, Science Data Bank, CC BY 4.0.':
    'Στην οθόνη: μια ανωνυμοποιημένη δημόσια εξέταση CBCT, το περιστατικό K01 των Feng L, Li Z, Gu Q, Wang Y και Yu X, Science Data Bank, CC BY 4.0.',
  'Open the viewer': 'Άνοιξε την εφαρμογή',
  'Try the demo jaw': 'Δοκίμασε τη γνάθο επίδειξης',
  'Source on GitHub': 'Ο κώδικας στο GitHub',

  'What it is': 'Τι είναι',
  'A dental CBCT viewer that runs entirely in the browser. Open a scan folder or its ZIP and you get the panoramic, cross-sections along the arch, the three slice planes, a 3D rendering, measurements, and a PDF report in one click.':
    'Ένα πρόγραμμα προβολής οδοντιατρικών εξετάσεων CBCT που τρέχει ολόκληρο μέσα στον browser. Ανοίγεις τον φάκελο της εξέτασης ή το ZIP της και έχεις την πανοραμική, εγκάρσιες τομές κατά μήκος του τόξου, τα τρία επίπεδα τομών, τρισδιάστατη απεικόνιση, μετρήσεις και αναφορά PDF με ένα κλικ.',
  'It works on a computer, a tablet or a phone. Nothing to install, nothing stored, and the scan never leaves the device it was opened on.':
    'Δουλεύει σε υπολογιστή, tablet ή κινητό. Δεν εγκαθιστάς τίποτα, δεν αποθηκεύεται τίποτα, και η εξέταση δεν φεύγει ποτέ από τη συσκευή όπου την άνοιξες.',

  'What it does': 'Τι κάνει',
  'A panoramic rebuilt along the dental arch, which it finds by itself from the teeth when a scan arrives without one.':
    'Πανοραμική κατά μήκος του οδοντικού τόξου· κι αν η εξέταση δεν έρχεται με τόξο, το βρίσκει μόνο του από τα δόντια.',
  'Cross-sections at right angles to the arch, linked axial, coronal and sagittal slices, and a 3D view ray-marched on the graphics card.':
    'Εγκάρσιες τομές κάθετα στο τόξο, συνδεδεμένες αξονικές, στεφανιαίες και οβελιαίες τομές, και προβολή 3D με ray marching στην κάρτα γραφικών.',
  'Distances and angles on any view, and the nerve canals traced in CS 3D Imaging drawn on every one of them.':
    'Αποστάσεις και γωνίες σε όποια προβολή θέλεις, και τα νευρικά κανάλια που χαράχτηκαν στο CS 3D Imaging σχεδιασμένα πάνω σε όλες.',
  'A PDF report in one click: the overview, then a cross-section every millimetre along the whole arch, numbered and matched to marks on the panoramic.':
    'Αναφορά PDF με ένα κλικ: πρώτα η σύνοψη και μετά μια εγκάρσια τομή ανά χιλιοστό σε όλο το τόξο, αριθμημένες και αντιστοιχισμένες με σημάδια πάνω στην πανοραμική.',
  'Reads DICOM straight out of a ZIP, ZIP64 included, without unpacking it. On a phone you pick the ZIP and that is all.':
    'Διαβάζει DICOM κατευθείαν από το ZIP, ακόμα και ZIP64, χωρίς να το αποσυμπιέσει. Στο κινητό διαλέγεις το ZIP και τέλος.',
  'In English, Greek and French, and it gets Greek patient names right.':
    'Στα αγγλικά, στα ελληνικά και στα γαλλικά, και δείχνει σωστά τα ελληνικά ονόματα ασθενών.',

  'Private by construction': 'Ιδιωτικό από τη φύση του',
  'There is no server side. The browser reads the scan, keeps it in memory, and the reports go straight to the Downloads folder.':
    'Δεν υπάρχει server. Ο browser διαβάζει την εξέταση, την κρατά στη μνήμη, και οι αναφορές πάνε κατευθείαν στον φάκελο με τις λήψεις.',
  'A Content Security Policy lets only the viewer’s own script run, pinned by its hash, and blocks every network connection, so even a bug could not send a scan anywhere.':
    'Ένα Content Security Policy αφήνει να τρέξει μόνο ο κώδικας της ίδιας της εφαρμογής, κλειδωμένος με το hash του, και κόβει κάθε σύνδεση στο δίκτυο. Έτσι ούτε ένα bug δεν θα μπορούσε να στείλει μια εξέταση πουθενά.',
  'No cookies, no local storage, no analytics.':
    'Ούτε cookies, ούτε local storage, ούτε analytics.',
  'A privacy tab checks all of that live while you watch, and wipes the scan from memory on request.':
    'Μια καρτέλα απορρήτου τα ελέγχει όλα αυτά ζωντανά μπροστά σου, και σβήνει την εξέταση από τη μνήμη μόλις της το ζητήσεις.',
  'Or skip the host entirely: the whole viewer downloads as one HTML file that works offline, off a USB stick.':
    'Ή ξέχνα τελείως τον server: όλη η εφαρμογή κατεβαίνει σε ένα αρχείο HTML που δουλεύει και χωρίς internet, ακόμα και από ένα στικάκι USB.',

  'How it is built': 'Πώς είναι φτιαγμένο',
  Size: 'Μέγεθος',
  'About 220 KB, one file': 'Περίπου 220 KB, ένα αρχείο',
  Dependencies: 'Εξαρτήσεις',
  None: 'Καμία',
  'English · Ελληνικά · Français': 'Αγγλικά · Ελληνικά · Γαλλικά',
  Licence: 'Άδεια',
  'Plain JavaScript, HTML and CSS, with no frameworks and no third-party code. It has its own DICOM reader, its own ZIP reader and its own PDF writer, and the build inlines the lot into a single page.':
    'Σκέτη JavaScript, HTML και CSS, χωρίς frameworks και χωρίς κώδικα τρίτων. Έχει δικό του αναγνώστη DICOM, δικό του αναγνώστη ZIP και δική του γεννήτρια PDF, και το build τα πακετάρει όλα σε μία μόνο σελίδα.',
  'The tests make their DICOM files in memory and the demo jaw is synthetic, so no patient data has ever been part of the project.':
    'Τα tests φτιάχνουν τα αρχεία DICOM τους στη μνήμη και η γνάθος επίδειξης είναι συνθετική, οπότε κανένα δεδομένο ασθενή δεν έχει μπει ποτέ στο project.',
  'Built with': 'Φτιαγμένο με',
  'Shipped with': 'Ανεβαίνει με',

  'Small print': 'Τα ψιλά γράμματα',
  'For reviewing scans only. It is not a certified medical device, and it is no substitute for certified software when a diagnosis or a treatment plan depends on it.':
    'Μόνο για προβολή εξετάσεων. Δεν είναι πιστοποιημένο ιατροτεχνολογικό προϊόν και δεν αντικαθιστά το πιστοποιημένο λογισμικό όταν από αυτό κρέμεται μια διάγνωση ή ένα σχέδιο θεραπείας.',

  'A side project, free and open source: a dental CBCT viewer that runs entirely in the browser. Panoramic, cross-sections, 3D, measurements and a PDF report in one click, and the scan never leaves the device. Live at kitsorfan.github.io/dental-cbct-viewer.':
    'Ένα προσωπικό project, δωρεάν και ανοιχτού κώδικα: πρόγραμμα προβολής οδοντιατρικών εξετάσεων CBCT που τρέχει ολόκληρο μέσα στον browser. Πανοραμική, εγκάρσιες τομές, 3D, μετρήσεις και αναφορά PDF με ένα κλικ, και η εξέταση δεν φεύγει ποτέ από τη συσκευή. Online στο kitsorfan.github.io/dental-cbct-viewer.',

  /* ------------------------------ OXI 1940 ---------------------------- */
  /* As the quiz itself calls itself in Greek. */
  'OXI 1940': 'ΟΧΙ 1940',
  'OXI 1940 on four phones: the home screen with the 1940 broadcast on air, a photo question, a map question in Greek and the gold medal':
    'Το ΟΧΙ 1940 σε τέσσερα κινητά: η αρχική οθόνη με το ραδιόφωνο του 1940 να παίζει, μια ερώτηση με φωτογραφία, μια ερώτηση στον χάρτη στα ελληνικά και το χρυσό μετάλλιο',
  'On screen: Ioannis Metaxas in 1937, from the Archaeological Society at Athens, public domain, and the relief map of Greece by Lencer and Uwe Dedering, CC BY-SA 3.0.':
    'Στην οθόνη: ο Ιωάννης Μεταξάς το 1937, από την εν Αθήναις Αρχαιολογική Εταιρεία, κοινό κτήμα, και ο ανάγλυφος χάρτης της Ελλάδας των Lencer και Uwe Dedering, CC BY-SA 3.0.',
  'Play the quiz': 'Παίξε το κουίζ',
  'Play it in Greek': 'Παίξε το στα ελληνικά',

  'A history quiz for Ochi Day, in English and Greek. On 28 October 1940 Greece answered Mussolini’s ultimatum with one word, «ΟΧΙ», and the quiz follows what came of it: the winter war in the mountains of Epirus and Albania, the German invasion, the Battle of Crete, the occupation, the Resistance and the liberation.':
    'Ένα κουίζ ιστορίας για την επέτειο του «ΟΧΙ», στα ελληνικά και στα αγγλικά. Στις 28 Οκτωβρίου 1940 η Ελλάδα απάντησε στο τελεσίγραφο του Μουσολίνι με μία λέξη, «ΟΧΙ», και το κουίζ σε πάει σε όλα όσα ακολούθησαν: τον πόλεμο στα χιονισμένα βουνά της Ηπείρου και της Αλβανίας, τη γερμανική εισβολή, τη Μάχη της Κρήτης, την Κατοχή, την Αντίσταση και την Απελευθέρωση.',
  'It is made for phones first and works on any screen. There is no account to make, and your best scores stay on your device.':
    'Είναι φτιαγμένο πρώτα απ’ όλα για το κινητό, αλλά παίζει σε κάθε οθόνη. Δεν χρειάζεσαι λογαριασμό, και τα καλύτερα σκορ σου μένουν στη συσκευή σου.',

  'A hundred questions in five chapters of twenty, in order from Corfu in 1923 to the liberation, and a Grand Challenge that draws twenty at random from all of them.':
    'Εκατό ερωτήσεις σε πέντε κεφάλαια των είκοσι, με τη σειρά, από το επεισόδιο της Κέρκυρας το 1923 ως την Απελευθέρωση, και η Μεγάλη Πρόκληση, με είκοσι τυχαίες ερωτήσεις απ’ όλα τα κεφάλαια.',
  'Real photos and maps, and the story behind every answer. On the map questions you tap the relief map of Greece and it tells you how many kilometres you were off.':
    'Αληθινές φωτογραφίες και χάρτες, και η ιστορία πίσω από κάθε απάντηση. Στις ερωτήσεις με χάρτη πατάς πάνω στον ανάγλυφο χάρτη της Ελλάδας και σου λέει πόσα χιλιόμετρα έπεσες έξω.',
  'Four helps, once each a game: 50:50, Ask the company, Second chance, and a Telegram from HQ with a clue written for every one of the hundred questions.':
    'Τέσσερις βοήθειες, μία φορά η καθεμία σε κάθε παιχνίδι: 50:50, Ρώτα τον λόχο, Δεύτερη ευκαιρία, και Τηλεγράφημα από το Στρατηγείο, με μια υπόδειξη γραμμένη ειδικά για καθεμία από τις εκατό ερωτήσεις.',
  'A wireless set in the top bar that plays the archive recording of the General Headquarters’ first communiqué of 28 October 1940, each sentence on a ticker as it is read, and real bugle calls to open a game and greet a medal.':
    'Ένα ραδιόφωνο στην πάνω μπάρα παίζει την ηχογράφηση από το αρχείο με το πρώτο ανακοινωθέν του Γενικού Στρατηγείου στις 28 Οκτωβρίου 1940, και κάθε φράση κυλάει στην οθόνη την ώρα που διαβάζεται. Αληθινά σαλπίσματα ανοίγουν κάθε παιχνίδι και υποδέχονται κάθε μετάλλιο.',
  'Medals for 18, 19 and 20 out of 20, and a certificate of honour drawn in the browser, in the language you played in, to download and share.':
    'Μετάλλια για 18, 19 και 20 στα 20, και ένα δίπλωμα τιμής που φτιάχνεται μέσα στον browser, στη γλώσσα που έπαιξες, για να το κατεβάσεις και να το μοιραστείς.',
  'English and Greek all the way through, switchable at any moment. It picks Greek for you when your browser speaks Greek or your clock is set to Greece or Cyprus.':
    'Ελληνικά και αγγλικά από την αρχή ως το τέλος, κι αλλάζεις γλώσσα όποτε θέλεις. Αν ο browser σου μιλάει ελληνικά ή το ρολόι σου είναι ρυθμισμένο σε ώρα Ελλάδας ή Κύπρου, ξεκινά μόνο του στα ελληνικά.',

  Questions: 'Ερωτήσεις',
  '100, in five chapters': '100, σε πέντε κεφάλαια',
  'Photos and maps': 'Φωτογραφίες και χάρτες',
  '52, from Wikimedia Commons': '52, από το Wikimedia Commons',
  'English · Ελληνικά': 'Αγγλικά · Ελληνικά',
  'React, TypeScript and Vite, with no backend and no tracking. Your progress stays in the browser, the certificate is drawn on a canvas, and every sound but the radio and the two bugle calls is synthesised on the spot.':
    'React, TypeScript και Vite, χωρίς backend και χωρίς καμία παρακολούθηση. Η πρόοδός σου μένει στον browser, το δίπλωμα ζωγραφίζεται σε canvas, και όλοι οι ήχοι, εκτός από το ραδιόφωνο και τα δύο σαλπίσματα, φτιάχνονται εκείνη τη στιγμή μέσα στον browser.',
  'The questions are plain data, each with its English and Greek side by side. The tests check that every chapter has twenty, that every line is there in both languages, that every map target falls on the map, and that every picture is used and credited.':
    'Οι ερωτήσεις είναι απλά δεδομένα, με τα αγγλικά και τα ελληνικά δίπλα δίπλα. Τα tests ελέγχουν ότι κάθε κεφάλαιο έχει είκοσι, ότι κάθε κείμενο υπάρχει και στις δύο γλώσσες, ότι κάθε στόχος πέφτει μέσα στον χάρτη, και ότι κάθε εικόνα χρησιμοποιείται και αναφέρει τον δημιουργό της.',

  Sources: 'Πηγές',
  'The questions keep to well-documented facts, and where a story is uncertain, such as the line attributed to Churchill, the question says so.':
    'Οι ερωτήσεις μένουν σε καλά τεκμηριωμένα γεγονότα, κι όπου μια ιστορία δεν είναι σίγουρη, όπως η φράση που αποδίδεται στον Τσόρτσιλ, η ερώτηση το λέει ξεκάθαρα.',
  'Every photo and map comes from Wikimedia Commons, in the public domain or under a free licence, and the game’s About page names the author and the licence of each one.':
    'Όλες οι φωτογραφίες και οι χάρτες είναι από το Wikimedia Commons, κοινό κτήμα ή με ελεύθερη άδεια, και η σελίδα «Σχετικά και πηγές» του παιχνιδιού γράφει τον δημιουργό και την άδεια για τον καθένα.',

  'A side project, free and open source: a history quiz for Ochi Day, in English and Greek. A hundred questions on 1940–1945 with real photos and maps, four helps, and a medal and a certificate for 18 out of 20 or better. Live at kitsorfan.github.io/oxi-1940.':
    'Ένα προσωπικό project, δωρεάν και ανοιχτού κώδικα: ένα κουίζ ιστορίας για την επέτειο του «ΟΧΙ», στα ελληνικά και στα αγγλικά. Εκατό ερωτήσεις για το 1940–1945 με αληθινές φωτογραφίες και χάρτες, τέσσερις βοήθειες, και μετάλλιο και δίπλωμα για 18 στα 20 και πάνω. Online στο kitsorfan.github.io/oxi-1940.',
}
