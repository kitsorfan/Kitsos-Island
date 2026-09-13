/**
 * Greek for the insides of the buildings: every room, the things you can look
 * at in them, the doors between them, and the journal each exhibit files.
 *
 * The verbs on the exits ("the stairs to the basement") are the words the
 * prompt puts after "E", so they read as things rather than as commands.
 */
export const INTERIORS: Record<string, string> = {
  /* ---------------------------- Kitsos House -------------------------- */
  'Living room': 'Σαλόνι',
  'the stairs to the basement': 'η σκάλα για το υπόγειο',
  'The basement stairs': 'Η σκάλα του υπογείου',
  'Under Kitsos House: the basement where the family he grew up in still sits round the table, and the garage off it.':
    'Κάτω από το Σπίτι του Κίτσου: το υπόγειο όπου η οικογένεια στην οποία μεγάλωσε κάθεται ακόμη γύρω από το τραπέζι, και το γκαράζ δίπλα του.',
  'the stairs to the landing': 'η σκάλα για το πλατύσκαλο',
  Upstairs: 'Επάνω όροφος',
  'The first floor of Kitsos House: the landing, the lab at the end of it, and a door that does not open yet.':
    'Ο πρώτος όροφος του Σπιτιού του Κίτσου: το πλατύσκαλο, το εργαστήριο στο βάθος του, και μια πόρτα που δεν ανοίγει ακόμη.',
  'the door to the library': 'η πόρτα για τη βιβλιοθήκη',
  'the trainer card': 'η κάρτα του εκπαιδευτή',
  'Who lives here': 'Ποιος μένει εδώ',
  'Athens-based senior full stack engineer and technical lead — Java, Spring Boot, React and AWS, with the teams to match.':
    'Senior full stack μηχανικός και technical lead με έδρα την Αθήνα — Java, Spring Boot, React και AWS, με τις ανάλογες ομάδες.',
  'the shelf by the chessboard': 'το ράφι δίπλα στη σκακιέρα',

  /* ------------------------------ Basement ---------------------------- */
  'The basement': 'Το υπόγειο',
  'Back up the stairs': 'Πίσω πάνω από τη σκάλα',
  'the door to the garage': 'η πόρτα για το γκαράζ',
  'the photographs': 'οι φωτογραφίες',
  'The house I grew up in': 'Το σπίτι όπου μεγάλωσα',
  'Seven at the table': 'Επτά στο τραπέζι',
  'Father, mother, three brothers, one sister and him. A big family is a small organisation: nobody hands you a role, you find the thing that needs doing.':
    'Πατέρας, μητέρα, τρία αδέλφια, μία αδελφή και εκείνος. Μια μεγάλη οικογένεια είναι ένας μικρός οργανισμός: κανείς δεν σου δίνει ρόλο, βρίσκεις μόνος σου τι πρέπει να γίνει.',

  /* ------------------------------- Garage ----------------------------- */
  'The garage': 'Το γκαράζ',
  'Back to the basement': 'Πίσω στο υπόγειο',
  'the workbench': 'ο πάγκος εργασίας',
  'Tools on the board, bench along the back wall, car on one side and the bicycle on the other. Half the furniture upstairs was built here.':
    'Εργαλεία στο ταμπλό, πάγκος στον πίσω τοίχο, αυτοκίνητο από τη μία και το ποδήλατο από την άλλη. Τα μισά έπιπλα του πάνω ορόφου φτιάχτηκαν εδώ.',

  /* --------------------------------- Lab ------------------------------ */
  'The lab': 'Το εργαστήριο',
  'Back to the landing': 'Πίσω στο πλατύσκαλο',
  'the server': 'ο σέρβερ',
  'The home lab': 'Το εργαστήριο του σπιτιού',
  'A mini server on Linux and a bench of electronics. Everything he knows about running things he learned breaking his own machine at eleven at night, with nobody to escalate to.':
    'Ένας μικρός σέρβερ σε Linux και ένας πάγκος με ηλεκτρονικά. Ό,τι ξέρει για τη λειτουργία συστημάτων το έμαθε χαλώντας το δικό του μηχάνημα στις έντεκα το βράδυ, χωρίς κανέναν να κλιμακώσει.',

  /* ------------------------------ Library ----------------------------- */
  'The library': 'Η βιβλιοθήκη',
  'Back to the living room': 'Πίσω στο σαλόνι',
  'the shelf that swings': 'το ράφι που γυρίζει',
  'The room that is not on the plans': 'Το δωμάτιο που δεν είναι στα σχέδια',
  'Behind the middle shelf in the library: a television, a Switch, two beanbags and the posters he never grew out of.':
    'Πίσω από το μεσαίο ράφι της βιβλιοθήκης: μια τηλεόραση, ένα Switch, δύο πουφ και οι αφίσες που ποτέ δεν ξεπέρασε.',
  'the bookshelf': 'η βιβλιοθήκη',
  'The shelf downstairs': 'Το ράφι στο κάτω πάτωμα',
  'Dostoevsky, Hugo, Feynman, Orwell, Remarque, Steinbeck — six books he has gone back to, in a room with one shelf that turns out not to be only a shelf.':
    'Ντοστογιέφσκι, Ουγκώ, Φάινμαν, Όργουελ, Ρεμάρκ, Στάινμπεκ — έξι βιβλία στα οποία έχει επιστρέψει, σε ένα δωμάτιο με ένα ράφι που τελικά δεν είναι μόνο ράφι.',
  'The shelf moves': 'Το ράφι κουνιέται',
  'Taking a book off the end of the run, the whole middle shelf shifts a centimetre. There is a hinge behind it. There is a room behind that.':
    'Βγάζοντας ένα βιβλίο από την άκρη της σειράς, όλο το μεσαίο ράφι μετακινείται έναν πόντο. Πίσω του υπάρχει μεντεσές. Και πίσω από αυτόν, ένα δωμάτιο.',
  'the Verne shelf': 'το ράφι του Βερν',
  'The Verne shelf': 'Το ράφι του Βερν',
  'Five Weeks in a Balloon, Journey to the Centre of the Earth, Twenty Thousand Leagues, The Mysterious Island, A Captain at Fifteen, and A Drama in Livonia. Mostly people somewhere impossible, building their way out — which turned out to be a career.':
    'Πέντε Εβδομάδες σε Αερόστατο, Ταξίδι στο Κέντρο της Γης, Είκοσι Χιλιάδες Λεύγες, Το Μυστηριώδες Νησί, Ένας Δεκαπεντάχρονος Πλοίαρχος, και Ένα Δράμα στη Λιβονία. Ως επί το πλείστον άνθρωποι κάπου αδύνατα, που χτίζουν τον δρόμο τους προς τα έξω — που τελικά αποδείχθηκε επάγγελμα.',

  /* ------------------------------ Landing ----------------------------- */
  'The landing': 'Το πλατύσκαλο',
  'Back down the stairs': 'Πίσω κάτω από τη σκάλα',
  'the door to the lab': 'η πόρτα για το εργαστήριο',
  'the door at the end of the landing': 'η πόρτα στο βάθος του πλατύσκαλου',
  'Locked. Behind it, according to the plans, is the rest of the first floor.':
    'Κλειδωμένη. Πίσω της, σύμφωνα με τα σχέδια, είναι ο υπόλοιπος πρώτος όροφος.',
  'The bedrooms are down there. So is a room that has been "the office" for two years, and a cupboard nobody has opened since the survey.':
    'Εκεί κάτω είναι τα υπνοδωμάτια. Και ένα δωμάτιο που εδώ και δύο χρόνια είναι «το γραφείο», και μια ντουλάπα που κανείς δεν άνοιξε από την αυτοψία.',
  'The handle turns about a centimetre and stops. Whatever is on the other side of it, it is not finished yet.':
    'Το πόμολο γυρίζει έναν πόντο και σταματάει. Ό,τι κι αν είναι από την άλλη πλευρά, δεν έχει τελειώσει ακόμη.',
  'Come back in a later commit.': 'Έλα ξανά σε επόμενο commit.',

  /* ------------------------------ Playroom ---------------------------- */
  'Back through the shelf': 'Πίσω μέσα από το ράφι',
  'the console under the television': 'η κονσόλα κάτω από την τηλεόραση',
  'The playroom': 'Το δωμάτιο των παιχνιδιών',
  'Mario, still': 'Ακόμη Mario',
  'A Switch docked under the television, two beanbags, and the posters he never grew out of: Star Wars in order, the Marvel run in sequence.':
    'Ένα Switch στη βάση του κάτω από την τηλεόραση, δύο πουφ, και οι αφίσες που ποτέ δεν ξεπέρασε: Star Wars με τη σειρά, όλο το Marvel στη σειρά του.',

  /* ---------------------------- The Polytechnic ----------------------- */
  'Lecture hall': 'Αμφιθέατρο',
  'the degree notice': 'η ανακοίνωση του διπλώματος',
  Education: 'Εκπαίδευση',
  'The Polytechnic': 'Το Πολυτεχνείο',
  'MEng in Electrical & Computer Engineering, NTUA, 2017–2022, GPA 8.4.':
    'Δίπλωμα Ηλεκτρολόγου Μηχανικού & Μηχανικού Υπολογιστών, ΕΜΠ, 2017–2022, βαθμός 8,4.',
  'the thesis display': 'η προθήκη της διπλωματικής',
  'Thesis & contests': 'Διπλωματική & διαγωνισμοί',
  'the student council board': 'ο πίνακας του φοιτητικού συμβουλίου',
  'Campus life': 'Ζωή στη σχολή',
  'the publication case': 'η προθήκη της δημοσίευσης',
  'Published research': 'Δημοσιευμένη έρευνα',
  'Published on arXiv': 'Δημοσιευμένο στο arXiv',
  '"An M-Health Algorithmic Approach to Identify and Assess Physiotherapy Exercises in Real Time" — arXiv, Cornell University, December 2025. Pose estimation plus a modified Levenshtein distance, running entirely on the client.':
    '«An M-Health Algorithmic Approach to Identify and Assess Physiotherapy Exercises in Real Time» — arXiv, Cornell University, Δεκέμβριος 2025. Εκτίμηση στάσης σώματος μαζί με τροποποιημένη απόσταση Levenshtein, που τρέχει εξ ολοκλήρου στον client.',
  'the certificate wall': 'ο τοίχος με τα πιστοποιητικά',
  Certifications: 'Πιστοποιήσεις',
  'MIT Open Learning — Universal AI Foundational Modules (2026). CITI Program — Biomedical Research Investigators (2026–2029). IBM Docker Essentials (2024). ECPE and ECCE in English, DELF B2 in French.':
    'MIT Open Learning — Universal AI Foundational Modules (2026). CITI Program — Biomedical Research Investigators (2026–2029). IBM Docker Essentials (2024). ECPE και ECCE στα αγγλικά, DELF B2 στα γαλλικά.',
  'the letters of reference': 'οι συστατικές επιστολές',
  References: 'Συστάσεις',
  'Academic references': 'Ακαδημαϊκές συστάσεις',
  'Prof. Panagiotis Tsanakas, Dean of the School of ECE and his thesis supervisor: the thesis was "marked by scientific soundness and technological originality", graded with distinction. Stelios Kandylakis, a classmate: "very strong coding skills, a solution-oriented mindset, and a person of integrity."':
    'Ο καθηγητής Παναγιώτης Τσανάκας, Κοσμήτορας της Σχολής ΗΜΜΥ και επιβλέπων της διπλωματικής του: η εργασία «διακρινόταν για την επιστημονική της αρτιότητα και την τεχνολογική της πρωτοτυπία», βαθμολογημένη με άριστα. Ο Στέλιος Κανδυλάκης, συμφοιτητής: «πολύ δυνατές ικανότητες στον προγραμματισμό, νοοτροπία προσανατολισμένη στη λύση, και άνθρωπος με ακεραιότητα.»',
  'the thesis display shelf': 'το ράφι της προθήκης της διπλωματικής',

  /* ---------------------------- Work District ------------------------- */
  'Office floor': 'Όροφος γραφείων',
  'the team board': 'ο πίνακας της ομάδας',
  'Current role': 'Τρέχων ρόλος',
  'Technical Lead at Veltiston.AI since May 2024, after Dev(Sec)Ops at IBM Consulting in 2023–2024.':
    'Technical Lead στη Veltiston.AI από τον Μάιο του 2024, μετά από Dev(Sec)Ops στην IBM Consulting το 2023–2024.',
  'the platform terminal': 'το τερματικό της πλατφόρμας',
  'The platform': 'Η πλατφόρμα',
  'the IBM pinboard': 'ο πίνακας ανακοινώσεων της IBM',
  'IBM Consulting': 'IBM Consulting',
  'Hybrid Cloud, 2023–2024': 'Hybrid Cloud, 2023–2024',
  'the skills whiteboard': 'ο πίνακας των δεξιοτήτων',
  Skills: 'Δεξιότητες',
  'the server rack': 'το rack των σέρβερ',

  /* ------------------------------ Army camp --------------------------- */
  Barracks: 'Θάλαμος',
  'the service record': 'το φύλλο μητρώου',
  'Reservist Second Lieutenant, Marine Special Forces, 2022–2023 — a unit to plan for, train and look after.':
    'Έφεδρος Ανθυπολοχαγός, Πεζοναύτες Ειδικών Δυνάμεων, 2022–2023 — μια μονάδα να σχεδιάζεις, να εκπαιδεύεις και να φροντίζεις.',
  'the commander’s letter': 'η επιστολή του διοικητή',
  'The commander’s letter': 'Η επιστολή του διοικητή',
  'Commander’s reference': 'Σύσταση του διοικητή',
  'Lt Col Georgios Mitsidis, Commander of the 575 Marine Battalion: Platoon Leader and Weapons Officer for a Marine Company, "accomplished his tasks successfully without the need of supervision"; recommended with the utmost confidence as "a valuable and trusted partner".':
    'Ο Αντισυνταγματάρχης Γεώργιος Μητσίδης, Διοικητής του 575 Τάγματος Πεζοναυτών: Διμοιρίτης και Αξιωματικός Οπλισμού σε Λόχο Πεζοναυτών, «έφερε εις πέρας τα καθήκοντά του με επιτυχία χωρίς να χρειάζεται επίβλεψη»· τον συστήνει με απόλυτη εμπιστοσύνη ως «πολύτιμο και αξιόπιστο συνεργάτη».',
  'the footlocker at the end of the bunks':
    'το ερμάριο στο τέλος των κρεβατιών',

  /* ------------------------------- School ----------------------------- */
  Classroom: 'Αίθουσα διδασκαλίας',
  'the school record': 'το σχολικό αρχείο',
  'Early education': 'Πρώτα χρόνια εκπαίδευσης',
  'Model High School of Ionidios (GPA 19.9) and Evaggeliki in Nea Smyrni — ranked 1st in the 2014 admission exam.':
    'Πρότυπο Λύκειο Ιωνιδείου (βαθμός 19,9) και Ευαγγελική Σχολή Νέας Σμύρνης — 1ος στις εξετάσεις εισαγωγής του 2014.',
  'the trophy case': 'η προθήκη των επάθλων',
  'Teaching & volunteering': 'Διδασκαλία & εθελοντισμός',
  'the foundation’s letter': 'η επιστολή του ιδρύματος',
  'The foundation’s letter': 'Η επιστολή του ιδρύματος',
  'Foundation reference': 'Σύσταση του ιδρύματος',
  'Kyriakos Oikonomou, retired Justice of the Hellenic Supreme Court and Vice-President of the "Pantokrator" Foundation, who appointed him Director at 2021: his contribution "had far exceeded our expectations" — renovation, events, volunteers and digital media.':
    'Ο Κυριάκος Οικονόμου, Αρεοπαγίτης ε.τ. και Αντιπρόεδρος του Ιδρύματος «Παντοκράτωρ», που τον διόρισε Διευθυντή το 2021: η συνεισφορά του «είχε ξεπεράσει κατά πολύ τις προσδοκίες μας» — ανακαίνιση, εκδηλώσεις, εθελοντές και ψηφιακά μέσα.',
  'the trophy case shelf': 'το ράφι της προθήκης των επάθλων',

  /* --------------------------- Radio & lighthouse --------------------- */
  'Control room': 'Αίθουσα ελέγχου',
  'the transmitter': 'ο πομπός',
  'Get in touch': 'Επικοινώνησε',
  'The message desk composes an email straight to Kitsos — no operator in between.':
    'Το γραφείο μηνυμάτων συντάσσει email κατευθείαν προς τον Κίτσο — χωρίς κανέναν χειριστή στη μέση.',
  'Summit room': 'Το δωμάτιο της κορυφής',
  'the keeper’s logbook': 'το ημερολόγιο του φαροφύλακα',
  'The shelf swings out on a hinge nobody fitted by accident.':
    'Το ράφι ανοίγει σε έναν μεντεσέ που δεν τον έβαλε κανείς κατά λάθος.',
  'The short version': 'Η σύντομη εκδοχή',
  'Opened with all five district keys. The keeper’s logbook holds the career summary, what he is good at, and what he is looking for.':
    'Άνοιξε με τα πέντε κλειδιά των συνοικιών. Το ημερολόγιο του φαροφύλακα κρατάει τη σύνοψη της καριέρας, σε τι είναι καλός, και τι ψάχνει.',
}
