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
  'opens in a new tab': 'ανοίγει σε νέα καρτέλα',
  '{name}, open on a scan': '{name} με μια εξέταση ανοιχτή',

  /* ------------------------- Dental CBCT Viewer ----------------------- */
  'Side project · 2026': 'Προσωπικό project · 2026',
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
}
