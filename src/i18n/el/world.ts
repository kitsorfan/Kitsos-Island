/**
 * Greek for the island itself: the buildings and their signs, the five keys and
 * the missions that hide them, every islander and everything they say, and the
 * road signs at the seven exits from the plaza.
 *
 * Proper nouns follow the Greek form where the institution has one of its own —
 * the Polytechnic is ΕΜΠ, not a transliteration — while product and company
 * names (Veltiston.AI, IBM, Spring Boot, Epic) stay as they are written in the
 * industry, because that is how a Greek reader expects to meet them.
 */
export const WORLD: Record<string, string> = {
  /* ------------------------------ Buildings --------------------------- */
  'Kitsos House': 'Το Σπίτι του Κίτσου',
  House: 'Σπίτι',
  'Home of Christos "Kitsos" Orfanopoulos':
    'Το σπίτι του Χρήστου «Κίτσου» Ορφανόπουλου',
  'National Technical University of Athens': 'Εθνικό Μετσόβιο Πολυτεχνείο',
  NTUA: 'ΕΜΠ',
  'School of Electrical & Computer Engineering':
    'Σχολή Ηλεκτρολόγων Μηχανικών & Μηχανικών Υπολογιστών',
  'Work District': 'Συνοικία Εργασίας',
  Work: 'Εργασία',
  'Veltiston.AI · IBM Consulting': 'Veltiston.AI · IBM Consulting',
  'Army Camp': 'Στρατόπεδο',
  Camp: 'Στρατόπεδο',
  'Marine Special Forces, reserve': 'Πεζοναύτες, έφεδρος',
  'Town School': 'Το Σχολείο της Πόλης',
  School: 'Σχολείο',
  'Where it all started': 'Εκεί όπου ξεκίνησαν όλα',
  'Radio Center': 'Ραδιοφωνικό Κέντρο',
  Radio: 'Ραδιόφωνο',
  'Broadcast a message to Kitsos': 'Στείλε μήνυμα στον Κίτσο',
  Lighthouse: 'Φάρος',
  'Sealed. Five district keys open it':
    'Σφραγισμένος. Τον ανοίγουν πέντε κλειδιά των συνοικιών',

  /* -------------------------------- Keys ------------------------------ */
  'Brass Key': 'Μπρούτζινο Κλειδί',
  'Lecture Hall Key': 'Κλειδί Αμφιθεάτρου',
  'Server Room Key': 'Κλειδί Μηχανογράφησης',
  'Footlocker Key': 'Κλειδί Ερμαρίου',
  'Cabinet Key': 'Κλειδί Ντουλάπας',

  /* ------------------------------ Missions ---------------------------- */
  'The spare key': 'Το εφεδρικό κλειδί',
  'Someone on his street will know how to get into Kitsos House.':
    'Κάποιος στον δρόμο του θα ξέρει πώς μπαίνεις στο Σπίτι του Κίτσου.',
  'Ms. Stella says the spare is on the shelf beside the chessboard, inside the house.':
    'Η κυρία Στέλλα λέει ότι το εφεδρικό είναι στο ράφι δίπλα στη σκακιέρα, μέσα στο σπίτι.',
  'Brass Key taken from the shelf by the chessboard.':
    'Το Μπρούτζινο Κλειδί πάρθηκε από το ράφι δίπλα στη σκακιέρα.',
  'Thesis defence': 'Υποστήριξη διπλωματικής',
  'The Academy keeps its keys somewhere behind the lectern.':
    'Η Σχολή κρατάει τα κλειδιά της κάπου πίσω από την έδρα.',
  'The Dean left the lecture hall key on the thesis display, past the lectern.':
    'Ο Κοσμήτορας άφησε το κλειδί του αμφιθεάτρου στην προθήκη της διπλωματικής, πίσω από την έδρα.',
  'Lecture Hall Key collected from the thesis display.':
    'Το Κλειδί του Αμφιθεάτρου πάρθηκε από την προθήκη της διπλωματικής.',
  'Production access': 'Πρόσβαση στην παραγωγή',
  'Nobody gets into the server room without asking first.':
    'Κανείς δεν μπαίνει στη μηχανογράφηση χωρίς να ρωτήσει πρώτα.',
  'Giorgos says the server room key hangs on the rack at the back of the IBM floor, one up from the lobby.':
    'Ο Γιώργος λέει ότι το κλειδί της μηχανογράφησης κρέμεται στο rack στο βάθος του ορόφου της IBM, έναν όροφο πάνω από το ισόγειο.',
  'Server Room Key pulled off the rack.':
    'Το Κλειδί της Μηχανογράφησης βγήκε από το rack.',
  'Kit inspection': 'Επιθεώρηση υλικού',
  'The camp runs on inventory, and inventory runs on footlockers.':
    'Το στρατόπεδο δουλεύει με απογραφή, και η απογραφή δουλεύει με ερμάρια.',
  'Sergeant Petros points at the footlocker at the end of the bunks.':
    'Ο λοχίας Πέτρος δείχνει το ερμάριο στο τέλος των κρεβατιών.',
  'Footlocker Key recovered from the barracks.':
    'Το Κλειδί του Ερμαρίου βρέθηκε στον θάλαμο.',
  'Old records': 'Παλιά αρχεία',
  'The school still has his file somewhere.':
    'Το σχολείο έχει ακόμη τον φάκελό του κάπου.',
  'Ms. Maria keeps the cabinet key in the trophy case in the school hall.':
    'Η κυρία Μαρία κρατάει το κλειδί της ντουλάπας στην προθήκη των επάθλων, στο χολ του σχολείου.',
  'Cabinet Key found in the trophy case.':
    'Το Κλειδί της Ντουλάπας βρέθηκε στην προθήκη των επάθλων.',

  /* ------------------------------ Islanders --------------------------- */
  'Mayor Vasilis': 'Δήμαρχος Βασίλης',
  'Kitsos Town': 'Η Πόλη του Κίτσου',
  Eleni: 'Ελένη',
  'Volunteer coordinator': 'Υπεύθυνη εθελοντισμού',
  Kostas: 'Κώστας',
  'Foundation volunteer': 'Εθελοντής του Ιδρύματος',
  Marios: 'Μάριος',
  'At the tent with his mum': 'Στη σκηνή με τη μαμά του',
  Grigoris: 'Γρηγόρης',
  'Park regular': 'Θαμώνας του πάρκου',
  Thanasis: 'Θανάσης',
  Townsfolk: 'Κάτοικοι',
  Despina: 'Δέσποινα',
  Nikos: 'Νίκος',
  'Coastal path': 'Παραλιακό μονοπάτι',
  /* --------------------- Angelica, the island warden ------------------- */
  /* Her name is already in the dictionary: she shares it with his classmate
     at Ionidios. What is new is the post, now that she is out of the
     basement and walking the island the rest of the year. */
  'Architect, island warden': 'Αρχιτέκτονας, επόπτρια του νησιού',
  'Angelica. I am an architect, and today I am the one inspecting this island.':
    'Αντζέλικα. Είμαι αρχιτέκτονας, και σήμερα είμαι εγώ που επιθεωρώ αυτό το νησί.',
  'Not his work history — the island itself. Seven roads out of one square, a district for each part of a career, and every one of them walkable without a map. That is a plan, not a heap.':
    'Όχι το βιογραφικό του — το ίδιο το νησί. Εφτά δρόμοι από μία πλατεία, μια συνοικία για κάθε κομμάτι μιας καριέρας, και όλοι τους περπατιούνται χωρίς χάρτη. Αυτό είναι σχέδιο, όχι σωρός.',
  'I check what I am shown against what is actually built. Most places that show you a portfolio are showing you drawings. This one you can walk into, open doors in, and get a little lost in.':
    'Ελέγχω αυτό που μου δείχνουν με αυτό που έχει όντως χτιστεί. Τα περισσότερα μέρη που σου δείχνουν ένα portfolio σού δείχνουν σχέδια. Σε αυτό μπαίνεις μέσα, ανοίγεις πόρτες, και χάνεσαι κιόλας λιγάκι.',
  'The lift in the Work District is the honest bit. Two floors of employer, and a third that is poured, wired and empty, with nobody pretending it is spoken for.':
    'Το ασανσέρ στη Συνοικία Εργασίας είναι το ειλικρινές κομμάτι. Δύο όροφοι εργοδοτών, κι ένας τρίτος χυμένος, καλωδιωμένος και άδειος, χωρίς κανείς να προσποιείται ότι είναι πιασμένος.',
  'The lighthouse is right. The plaza still wants one more tree.':
    'Ο φάρος είναι σωστός. Η πλατεία θέλει ακόμη ένα δέντρο.',
  'If you need me, I am somewhere on these roads. And contact Kitsos as well — he is the one who can say yes to anything. The Radio Center is due south.':
    'Αν με χρειαστείς, είμαι κάπου σε αυτούς τους δρόμους. Και επικοινώνησε και με τον Κίτσο — αυτός είναι που μπορεί να πει ναι σε οτιδήποτε. Το Ραδιοφωνικό Κέντρο είναι νότια.',
  'Angelica, island warden': 'Αντζέλικα, επόπτρια του νησιού',
  'Amalia’s sister, an architect, who walks the island inspecting the thing itself rather than the career inside it: one square, seven roads, a district per chapter, and a third floor left honestly empty. On these roads most days, at the table on the twenty-fifth — and Kitsos through the Radio Center.':
    'Η αδελφή της Αμαλίας, αρχιτέκτονας, που περπατά το νησί επιθεωρώντας το ίδιο το πράγμα κι όχι την καριέρα που έχει μέσα του: μία πλατεία, εφτά δρόμοι, μια συνοικία ανά κεφάλαιο, κι ένας τρίτος όροφος αφημένος ειλικρινά άδειος. Στους δρόμους τις περισσότερες μέρες, στο τραπέζι στις είκοσι πέντε — και τον Κίτσο μέσω του Ραδιοφωνικού Κέντρου.',
  'Captain Yannis': 'Καπετάν Γιάννης',
  'The dock': 'Η προβλήτα',
  'Ms. Stella': 'Κυρία Στέλλα',
  Neighbour: 'Γειτόνισσα',
  Marina: 'Μαρίνα',
  'Student council': 'Φοιτητικό συμβούλιο',
  Alex: 'Άλεξ',
  'Robotics club': 'Όμιλος ρομποτικής',
  'Sergeant Petros': 'Λοχίας Πέτρος',
  'Dean Tsanakas': 'Κοσμήτορας Τσανάκας',
  'Dean, School of ECE': 'Κοσμήτορας, Σχολή ΗΜΜΥ',
  'Prof. Nikos': 'Καθηγητής Νίκος',
  'Programming, NTUA': 'Προγραμματισμός, ΕΜΠ',
  Giorgos: 'Γιώργος',
  'First year, ECE': 'Πρωτοετής, ΗΜΜΥ',
  'Prof. Ilias': 'Καθηγητής Ηλίας',
  'Faculty assembly, NTUA': 'Γενική Συνέλευση, ΕΜΠ',
  'Classmate, ECE': 'Συμφοιτητής, ΗΜΜΥ',
  'Dr. Fotini': 'Δρ. Φωτεινή',
  'Academy labs': 'Εργαστήρια της Σχολής',
  /* Η Συνοικία Εργασίας: ισόγειο, IBM, Veltiston AI. */
  Robin: 'Ρόμπιν',
  'On presenting yourself': 'Για το πώς παρουσιάζεσαι',
  'Kyriakos Oikonomou': 'Κυριάκος Οικονόμου',
  'Vice-President, "Pantokrator" Foundation':
    'Αντιπρόεδρος, Ίδρυμα «Παντοκράτωρ»',
  'DevOps colleague, IBM': 'Συνάδελφος DevOps, IBM',
  'Ms. Ioanna Panagopoulou': 'Κυρία Ιωάννα Παναγοπούλου',
  'Supervisor, National Bank of Greece':
    'Προϊσταμένη, Εθνική Τράπεζα της Ελλάδος',
  Klaus: 'Κλάους',
  'IBM Hamburg, Agile bootcamp': 'IBM Αμβούργο, Agile bootcamp',
  'Prof. Dimitris Bertsimas': 'Καθηγητής Δημήτρης Μπερτσιμάς',
  'Founder, Veltiston AI': 'Ιδρυτής, Veltiston AI',
  Karim: 'Καρίμ',
  'Engineer, Veltiston AI · Morocco': 'Μηχανικός, Veltiston AI · Μαρόκο',
  Michalis: 'Μιχάλης',
  'Engineer, Veltiston AI': 'Μηχανικός, Veltiston AI',
  Josh: 'Τζος',
  'Data scientist, MIT team · Boston': 'Data scientist, ομάδα MIT · Βοστώνη',
  'Ms. Maria': 'Κυρία Μαρία',
  Stelios: 'Στέλιος',
  'Night watch, Work District': 'Νυχτοφύλακας, Συνοικία Εργασίας',
  'Sergeant Manolis': 'Λοχίας Μανώλης',
  'Guard commander, Army Camp': 'Αρχιφύλακας, Στρατόπεδο',
  'Private Fotis': 'Στρατιώτης Φώτης',
  'Sentry, Army Camp': 'Σκοπός, Στρατόπεδο',
  Sofia: 'Σοφία',
  Signpost: 'Πινακίδα',
  'Town Plaza': 'Κεντρική Πλατεία',

  /* -------------------------------- Roads ----------------------------- */
  'Motivation Road': 'Οδός Κινήτρου',
  'Discipline Road': 'Οδός Πειθαρχίας',
  'Curiosity Road': 'Οδός Περιέργειας',
  'Freedom Road': 'Οδός Ελευθερίας',
  'Collaboration Road': 'Οδός Συνεργασίας',
  'Caring Road': 'Οδός Φροντίδας',
  'Volunteers’ Kiosk': 'Το Περίπτερο των Εθελοντών',
  'Leadership Road': 'Οδός Ηγεσίας',

  /* --------------------------- Journal entries ------------------------ */
  'Welcome to Kitsos Town': 'Καλώς ήρθες στην Πόλη του Κίτσου',
  'Christos "Kitsos" Orfanopoulos, Senior Full Stack Software Engineer & Technical Lead, based in Athens, Greece. Five keys, one per district, open the Old Lighthouse on the north-west cape.':
    'Χρήστος «Κίτσος» Ορφανόπουλος, Senior Full Stack Software Engineer & Technical Lead, με έδρα την Αθήνα. Πέντε κλειδιά, ένα ανά συνοικία, ανοίγουν τον Παλιό Φάρο στο βορειοδυτικό ακρωτήρι.',
  Volunteering: 'Εθελοντισμός',
  'Leading volunteer (2017–2021, 2023–today) and Director (2021–2022) at the Christian Youth Foundation "Pantokrator", Paleo Faliro. Blood donor since 2017.':
    'Επικεφαλής εθελοντής (2017–2021, 2023–σήμερα) και Διευθυντής (2021–2022) στο Χριστιανικό Ίδρυμα Νεότητας «Παντοκράτωρ», Παλαιό Φάληρο. Αιμοδότης από το 2017.',
  Hobbies: 'Ενδιαφέροντα',
  'Running, cycling, theater, DIY and handiwork at home, chess, hiking and camping.':
    'Τρέξιμο, ποδήλατο, θέατρο, μαστορέματα στο σπίτι, σκάκι, πεζοπορία και κάμπινγκ.',
  'Coastal loop': 'Ο παραλιακός γύρος',
  'Runs and cycles the island loop. The thinking happens somewhere around kilometre six.':
    'Τρέχει και κάνει ποδήλατο τον γύρο του νησιού. Η σκέψη γίνεται κάπου στο έκτο χιλιόμετρο.',
  'Based in Athens': 'Με έδρα την Αθήνα',
  'Lives and works in Athens, Greece. Greek nationality, open to conversations that start with a message.':
    'Ζει και εργάζεται στην Αθήνα. Έλληνας υπήκοος, ανοιχτός σε συζητήσεις που ξεκινούν με ένα μήνυμα.',
  'Profile & languages': 'Προφίλ & γλώσσες',
  'Athens, Greece · Greek nationality. Greek (native), English (proficiency, ECPE, University of Michigan 2016), French (B2, DELF 2019).':
    'Αθήνα · Έλληνας υπήκοος. Ελληνικά (μητρική), Αγγλικά (άριστα, ECPE, University of Michigan 2016), Γαλλικά (B2, DELF 2019).',
  'Student representation': 'Φοιτητική εκπροσώπηση',
  'Students’ representative and leader of the Independent ECE Students: e-voting, depoliticization of the university, realistic and democratic problem-solving.':
    'Εκπρόσωπος φοιτητών και επικεφαλής των Ανεξάρτητων Φοιτητών ΗΜΜΥ: ηλεκτρονική ψηφοφορία, απο-κομματικοποίηση του πανεπιστημίου, ρεαλιστική και δημοκρατική επίλυση προβλημάτων.',
  'Teaching robotics': 'Διδασκαλία ρομποτικής',
  'Children’s tutor in Robotics at Citylab, Alimos, 2020–2021.':
    'Εκπαιδευτής παιδιών στη Ρομποτική στο Citylab, Άλιμος, 2020–2021.',
  'Military service': 'Στρατιωτική θητεία',
  'Reservist Second Lieutenant, Marine Battalion, September 2022 – November 2023. Special Forces basic training at Nea Peramos; graduated 3rd in class from the Infantry Reserve Officers School, Heraklion; completed the Rangers’ Guerilla Warfare School at Rentina; served as Deputy Company Commander and Weapons Officer.':
    'Έφεδρος Ανθυπολοχαγός, Τάγμα Πεζοναυτών, Σεπτέμβριος 2022 – Νοέμβριος 2023. Βασική εκπαίδευση Ειδικών Δυνάμεων στη Νέα Πέραμο· αποφοίτησε 3ος της σειράς του από τη ΣΕΑΠ Ηρακλείου· ολοκλήρωσε το Σχολείο Ανταρτοπολέμου (Rangers) στη Ρεντίνα· υπηρέτησε ως Υποδιοικητής Λόχου και Αξιωματικός Οπλισμού.',
  'NTUA, MEng ECE': 'ΕΜΠ, Δίπλωμα ΗΜΜΥ',
  'Seminars & contests': 'Σεμινάρια & διαγωνισμοί',
  'IBM graduate program (2024), Agile bootcamp in Hamburg (2024), Arduino IEEE Workshop at NTUA (2018). 2nd in the National Biology Competition (2016) and awards in Physics, Mathematics, Informatics and Literature. Volunteer at European Researchers’ Night (2019) and 100 years of ECE (2017).':
    'Πρόγραμμα αποφοίτων IBM (2024), Agile bootcamp στο Αμβούργο (2024), Arduino IEEE Workshop στο ΕΜΠ (2018). 2ος στον Πανελλήνιο Διαγωνισμό Βιολογίας (2016) και διακρίσεις σε Φυσική, Μαθηματικά, Πληροφορική και Λογοτεχνία. Εθελοντής στη Βραδιά του Ερευνητή (2019) και στα 100 χρόνια ΗΜΜΥ (2017).',
  /* Τα ημερολόγια της Συνοικίας Εργασίας. */
  'How the building reads': 'Πώς διαβάζεται το κτίριο',
  'The Work District is laid out as an argument rather than a list: the ground floor is capabilities, certifications and the student jobs; the first floor is IBM 2023–2024; the second is Veltiston AI 2024–present. The third floor is built, empty and unnamed — what goes on it depends on who is hiring.':
    'Η Συνοικία Εργασίας είναι στημένη σαν επιχείρημα και όχι σαν λίστα: το ισόγειο έχει τις ικανότητες, τις πιστοποιήσεις και τις φοιτητικές δουλειές· ο πρώτος όροφος είναι η IBM 2023–2024· ο δεύτερος η Veltiston AI από το 2024 ως σήμερα. Ο τρίτος όροφος είναι χτισμένος, άδειος και χωρίς όνομα — το τι θα μπει σε αυτόν εξαρτάται από το ποιος προσλαμβάνει.',
  'Retired Justice of the Hellenic Supreme Court and Vice-President of the "Pantokrator" Foundation, who personally offered Kitsos the Directorship in 2021 while he was still an NTUA undergraduate — and judged what he left behind to have exceeded expectations.':
    'Επίτιμος Αρεοπαγίτης και Αντιπρόεδρος του Ιδρύματος «Παντοκράτωρ», που πρόσφερε προσωπικά στον Κίτσο τη θέση του Διευθυντή το 2021, όσο ήταν ακόμη προπτυχιακός φοιτητής στο ΕΜΠ — και έκρινε ότι όσα άφησε πίσω του ξεπέρασαν τις προσδοκίες.',
  'Three floors': 'Τρεις όροφοι',
  'The Work District has a floor per employer: IBM on the first, Veltiston AI on the second, and a third nobody has built yet. Stairs in the north-west corner, lift in the north-east.':
    'Η Συνοικία Εργασίας έχει έναν όροφο ανά εργοδότη: IBM στον πρώτο, Veltiston AI στον δεύτερο, και έναν τρίτο που δεν έχει χτίσει ακόμη κανείς. Σκάλα στη βορειοδυτική γωνία, ασανσέρ στη βορειοανατολική.',
  'Working through the degree': 'Δουλειά μέσα στις σπουδές',
  'Director of the "Pantokrator" Foundation 2021–2022, robotics tutor to children at Citylab in Alimos 2020–2021, and a private mathematics tutor throughout — all of it alongside NTUA.':
    'Διευθυντής του Ιδρύματος «Παντοκράτωρ» 2021–2022, καθηγητής ρομποτικής σε παιδιά στο Citylab στον Άλιμο 2020–2021, και ιδιαίτερος καθηγητής μαθηματικών σε όλο αυτό το διάστημα — όλα μαζί με το ΕΜΠ.',
  'MIT Open Learning on foundational AI, CITI Program on biomedical research conduct and HIPAA, IBM Docker Essentials, and the language certificates: ECPE C2, ECCE B2 and DELF B2.':
    'MIT Open Learning για τα θεμέλια της τεχνητής νοημοσύνης, CITI Program για τη δεοντολογία της βιοϊατρικής έρευνας και το HIPAA, IBM Docker Essentials, και τα πιστοποιητικά γλωσσών: ECPE C2, ECCE B2 και DELF B2.',
  'Senior full-stack engineer and technical lead: architecture and the hard parts himself, teams of 5–10 across three time zones, security and compliance first, and a production release most weeks.':
    'Senior full-stack μηχανικός και τεχνικός υπεύθυνος: αρχιτεκτονική και τα δύσκολα κομμάτια ο ίδιος, ομάδες 5–10 ατόμων σε τρεις ζώνες ώρας, ασφάλεια και συμμόρφωση πρώτα, και έκδοση στην παραγωγή τις περισσότερες εβδομάδες.',
  'His supervisor at the National Bank of Greece during the Finacle onboarding, who rated him excellent as an integration analyst: reading what each subsystem actually did rather than what the ticket said, and catching the mismatches that sink a migration late.':
    'Η προϊσταμένη του στην Εθνική Τράπεζα της Ελλάδος στο onboarding του Finacle, που τον χαρακτήρισε εξαιρετικό ως integration analyst: διάβαζε τι έκανε πραγματικά κάθε υποσύστημα και όχι τι έλεγε το ticket, και εντόπιζε τις ασυμφωνίες που βουλιάζουν μια μετάπτωση αργότερα.',
  'Hamburg, February 2024': 'Αμβούργο, Φεβρουάριος 2024',
  'Represented IBM Greece at the international Agile & Enterprise Design Thinking bootcamp in Hamburg, a few months into the job — sent as the one person from the Greek practice.':
    'Εκπροσώπησε την IBM Ελλάδος στο διεθνές bootcamp Agile & Enterprise Design Thinking στο Αμβούργο, λίγους μήνες μετά την πρόσληψή του — στάλθηκε ως το ένα άτομο από την ελληνική ομάδα.',
  'MIT professor and founder of Veltiston AI, who confirms Kitsos as one of the founding engineers in 2024: built the Nurse Scheduling platform from concept to production and became its technical lead. The vision — put optimisation where a charge nurse can press a button.':
    'Καθηγητής του MIT και ιδρυτής της Veltiston AI, που επιβεβαιώνει τον Κίτσο ως έναν από τους ιδρυτικούς μηχανικούς το 2024: έχτισε την πλατφόρμα Nurse Scheduling από τη σύλληψη ως την παραγωγή και έγινε ο τεχνικός υπεύθυνός της. Το όραμα — να μπει η βελτιστοποίηση εκεί που μια προϊσταμένη νοσηλεύτρια μπορεί να πατήσει ένα κουμπί.',
  'One of the first engineers from May 2024, then Senior Software Engineer from May 2026 and project lead on three projects. Technical lead of the Nurse Scheduling platform, concept to production.':
    'Ένας από τους πρώτους μηχανικούς από τον Μάιο του 2024, μετά Senior Software Engineer από τον Μάιο του 2026 και υπεύθυνος σε τρία έργα. Τεχνικός υπεύθυνος της πλατφόρμας Nurse Scheduling, από τη σύλληψη ως την παραγωγή.',
  'Leading across three time zones': 'Ηγεσία σε τρεις ζώνες ώρας',
  'Leads cross-functional teams of 5–10 across Greece, Boston and Morocco: written handover and decisions so no time zone finds out late, line-by-line code review, and he runs the technical interviews and onboards every new engineer himself.':
    'Ηγείται διαλειτουργικών ομάδων 5–10 ατόμων σε Ελλάδα, Βοστώνη και Μαρόκο: γραπτή παράδοση και γραπτές αποφάσεις ώστε καμία ζώνη ώρας να μη μαθαίνει αργά, code review γραμμή γραμμή, και κάνει ο ίδιος τις τεχνικές συνεντεύξεις και το onboarding κάθε νέου μηχανικού.',
  'What the platform is made of': 'Από τι είναι φτιαγμένη η πλατφόρμα',
  'Spring AI documentation assistant with RAG and agentic AI, a SMART on FHIR app inside Epic EHR, a Length of Stay plugin, UKG integration, SAML 2.0 SSO via Microsoft ADFS, secure notifications, audit logging and Jira-integrated ticketing with reCAPTCHA — on Java, Spring Boot, React, MySQL, AWS and Docker, released to production most weeks.':
    'Βοηθός τεκμηρίωσης σε Spring AI με RAG και agentic AI, εφαρμογή SMART on FHIR μέσα στο Epic EHR, plugin Length of Stay, ενσωμάτωση UKG, SSO με SAML 2.0 μέσω Microsoft ADFS, ασφαλείς ειδοποιήσεις, audit logging και σύστημα αιτημάτων με Jira και reCAPTCHA — πάνω σε Java, Spring Boot, React, MySQL, AWS και Docker, με έκδοση στην παραγωγή τις περισσότερες εβδομάδες.',
  'Java 17–25, Spring Boot and Spring AI, React, MySQL, AWS, Docker, Jenkins and GitLab CI, watched with Grafana, Graylog and Sentry — shipped to production most weeks, into major U.S. hospitals.':
    'Java 17–25, Spring Boot και Spring AI, React, MySQL, AWS, Docker, Jenkins και GitLab CI, υπό παρακολούθηση με Grafana, Graylog και Sentry — σε παραγωγή τις περισσότερες εβδομάδες, σε μεγάλα νοσοκομεία των ΗΠΑ.',
  'The H2O side': 'Η πλευρά του H2O',
  'Leads the software on the H2O/data-science side with the MIT team in Boston: turning proven models into something a hospital can run and a clinician can be told about — length of stay, scheduling, and the analytics delivered into Epic.':
    'Ηγείται του λογισμικού στην πλευρά H2O/data science μαζί με την ομάδα του MIT στη Βοστώνη: μετατρέπει αποδεδειγμένα μοντέλα σε κάτι που μπορεί να τρέξει ένα νοσοκομείο και να εξηγηθεί σε έναν κλινικό γιατρό — length of stay, προγραμματισμός βαρδιών, και τα analytics που παραδίδονται στο Epic.',
  'IBM, DevOps Engineer': 'IBM, DevOps Engineer',
  'November 2023 – May 2024, via the IBM Associate Program. Cosmos Project at the National Bank of Greece: legacy PL/I and COBOL to Infosys Finacle, integration architecture for both the coexistence and target states, integration calls across bank subsystems, and CI/CD with Jenkins, Podman, ELK and Grafana.':
    'Νοέμβριος 2023 – Μάιος 2024, μέσω του IBM Associate Program. Έργο Cosmos στην Εθνική Τράπεζα της Ελλάδος: μετάβαση από PL/I και COBOL στο Infosys Finacle, αρχιτεκτονική ενσωμάτωσης τόσο για το μεταβατικό όσο και για το τελικό στάδιο, συσκέψεις ενσωμάτωσης ανάμεσα στα υποσυστήματα της τράπεζας, και CI/CD με Jenkins, Podman, ELK και Grafana.',
  'November 2023 – May 2024 through the IBM Associate Program. The Cosmos Project at the National Bank of Greece: PL/I and COBOL core banking onto Infosys Finacle, integration architecture for the coexistence and target states, and CI/CD with Jenkins, Podman, ELK and Grafana.':
    'Νοέμβριος 2023 – Μάιος 2024 μέσω του IBM Associate Program. Το έργο Cosmos στην Εθνική Τράπεζα της Ελλάδος: το βασικό τραπεζικό σύστημα από PL/I και COBOL στο Infosys Finacle, αρχιτεκτονική ενσωμάτωσης για το μεταβατικό και το τελικό στάδιο, και CI/CD με Jenkins, Podman, ELK και Grafana.',
  'His first teacher': 'Η πρώτη του δασκάλα',
  'Ms. Maria, who taught his first class: a charismatic child with a good heart, homework done every day, a hand always up. She wrote that he would have a bright future.':
    'Η κυρία Μαρία, που του έκανε την πρώτη τάξη: ένα χαρισματικό παιδί με καλή καρδιά, με τα μαθήματά του διαβασμένα κάθε μέρα και το χέρι πάντα σηκωμένο. Έγραψε ότι θα έχει λαμπρό μέλλον.',
  'Principal Nikos': 'Διευθυντής Νίκος',
  'Principal, Evangeliki': 'Διευθυντής, Ευαγγελική Σχολή',
  'The principal’s word': 'Ο λόγος του διευθυντή',
  'Principal Nikos of Evangeliki: an excellent student, and a truly responsible class president, the only one in his career to hand in a report, fifteen pages of it, and to return every unspent cent of the class funds as the law required.':
    'Ο διευθυντής Νίκος της Ευαγγελικής: άριστος μαθητής και πραγματικά υπεύθυνος πρόεδρος τάξης, ο μόνος στην καριέρα του που παρέδωσε απολογισμό, δεκαπέντε σελίδες, και επέστρεψε κάθε αδιάθετο ευρώ από το ταμείο της τάξης, όπως όριζε ο νόμος.',
  'Mr. Diamantis': 'Κύριος Διαμαντής',
  'Robotics instructor': 'Καθηγητής ρομποτικής',
  'Twelve volts': 'Δώδεκα βολτ',
  'Mr. Diamantis, who ran the robotics class at Evangeliki: the class built a submarine drone, and Kitsos on his own built a working proof-of-concept electric bicycle running on 12 V.':
    'Ο κύριος Διαμαντής, που έκανε το μάθημα ρομποτικής στην Ευαγγελική: η τάξη έφτιαξε ένα υποβρύχιο drone, και ο Κίτσος μόνος του ένα λειτουργικό πρωτότυπο ηλεκτρικού ποδηλάτου στα 12 V.',
  'Ms. Stavroula': 'Κυρία Σταυρούλα',
  'Pascal tutor': 'Καθηγήτρια Pascal',
  'Pascal, at thirteen': 'Pascal, στα δεκατρία',
  'Ms. Stavroula, his Pascal tutor at Evangeliki: he always loved programming and wanted more, every extra exercise done, and small games of his own with graphics on top.':
    'Η κυρία Σταυρούλα, η καθηγήτριά του στην Pascal στην Ευαγγελική: πάντα αγαπούσε τον προγραμματισμό και ήθελε κι άλλο, κάθε έξτρα άσκηση λυμένη, και από πάνω μικρά παιχνίδια δικά του με γραφικά.',
  Sotiris: 'Σωτήρης',
  Classmate: 'Συμμαθητής',
  'Stop studying and come play': 'Άσε το διάβασμα κι έλα να παίξουμε',
  'Sotiris, his classmate at Evangeliki, who spent three years trying to get him out of a maths problem and onto a football pitch. Sometimes it worked.':
    'Ο Σωτήρης, συμμαθητής του στην Ευαγγελική, που πέρασε τρία χρόνια προσπαθώντας να τον ξεκολλήσει από κάποιο πρόβλημα μαθηματικών και να τον βγάλει στο γήπεδο. Κάποιες φορές τα κατάφερνε.',

  /* --------------------------- Doors after dark ----------------------- */
  'The glass is dark and the badge reader is dead. Nothing is shipping tonight.':
    'Τα τζάμια είναι σκοτεινά και ο αναγνώστης καρτών νεκρός. Απόψε δεν βγαίνει τίποτα στην παραγωγή.',
  'There is somebody on the gate, though, if you want the long version.':
    'Υπάρχει πάντως κάποιος στην πύλη, αν θέλεις την εκτενή εκδοχή.',
  'The chain is on the gate and the searchlight is coming round again. Two sentries between you and it, and neither has taken their eyes off you.':
    'Η αλυσίδα είναι στην πύλη και ο προβολέας ξαναέρχεται. Δύο σκοποί ανάμεσα σε σένα και εκείνη, και κανείς τους δεν σε έχει πάρει από τα μάτια του.',
  'One more step and a hand goes flat on your chest and walks you back. Getting through tonight is not on the table.':
    'Ένα βήμα ακόμη και ένα χέρι ακουμπάει στο στήθος σου και σε γυρίζει πίσω. Απόψε δεν περνάς με τίποτα.',

  /* ------------------------------ The mayor --------------------------- */
  'Welcome to KITSOS TOWN! Small island, big CV.':
    'Καλώς ήρθες στην ΠΟΛΗ ΤΟΥ ΚΙΤΣΟΥ! Μικρό νησί, μεγάλο βιογραφικό.',
  'Seven roads leave this square, and every one of them is named for what he took out of it. Motivation, Discipline, Curiosity, Caring, Leadership, Collaboration.':
    'Επτά δρόμοι φεύγουν από αυτή την πλατεία, και ο καθένας τους πήρε το όνομά του από αυτό που κέρδισε εκεί. Κίνητρο, Πειθαρχία, Περιέργεια, Φροντίδα, Ηγεσία, Συνεργασία.',
  'And north-west, Freedom Road, out to the Old Lighthouse on the cape. Sealed for years. Five district keys open it, one hidden in each building.':
    'Και βορειοδυτικά, η Οδός Ελευθερίας, μέχρι τον Παλιό Φάρο στο ακρωτήρι. Σφραγισμένος χρόνια. Τον ανοίγουν πέντε κλειδιά των συνοικιών, ένα κρυμμένο σε κάθε κτίριο.',
  'Press M for the map if the walk gets long. Once you have found a place, you can travel straight back to it.':
    'Πάτα M για τον χάρτη αν σου φανεί μακρύς ο δρόμος. Μόλις βρεις ένα μέρος, μπορείς να πας κατευθείαν ξανά εκεί.',

  /* ------------------------------- Eleni ------------------------------ */
  'Kitsos? He has been around this tent since 2017.':
    'Ο Κίτσος; Τριγυρνάει σε αυτή τη σκηνή από το 2017.',
  'Leading volunteer at the Christian Youth Foundation "Pantokrator" in Paleo Faliro, 2017 to 2021, then again from 2023 to today.':
    'Επικεφαλής εθελοντής στο Χριστιανικό Ίδρυμα Νεότητας «Παντοκράτωρ» στο Παλαιό Φάληρο, από το 2017 ως το 2021, και ξανά από το 2023 ως σήμερα.',
  'He even ran the place. Director from February 2021 to September 2022, appointed by the council while he was still finishing his degree.':
    'Το διηύθυνε κιόλας. Διευθυντής από τον Φεβρουάριο του 2021 ως τον Σεπτέμβριο του 2022, διορισμένος από το συμβούλιο ενώ τελείωνε ακόμη τη σχολή του.',
  'Staff, volunteers, the buildings, the books, the grant applications. Events, field trips, tree planting, donation drives, prison visits.':
    'Προσωπικό, εθελοντές, τα κτίρια, τα λογιστικά, οι αιτήσεις χρηματοδότησης. Εκδηλώσεις, εκδρομές, δενδροφυτεύσεις, συγκεντρώσεις προσφορών, επισκέψεις σε φυλακές.',
  'When the lockdowns hit he put the whole programme on a live stream so the children would not lose it.':
    'Όταν ήρθαν τα lockdown, έβαλε όλο το πρόγραμμα σε ζωντανή μετάδοση για να μην το χάσουν τα παιδιά.',
  'The Vice-President, a retired Supreme Court judge, mind you, wrote it all down in a letter. It is up at the school.':
    'Ο αντιπρόεδρος, αρεοπαγίτης εν αποστρατεία, σημείωσε, τα έγραψε όλα σε μια επιστολή. Είναι πάνω στο σχολείο.',
  'And he still gives blood. Blood donor since 2017, no fuss about it.':
    'Και δίνει ακόμη αίμα. Αιμοδότης από το 2017, χωρίς τυμπανοκρουσίες.',

  /* ------------------------------- Kostas ----------------------------- */
  'Clipboard is on the table, pen is on a string. The string is because of me, not because of you.':
    'Το ντοσιέ είναι στο τραπέζι, το στιλό δεμένο με σπάγκο. Ο σπάγκος μπήκε για μένα, όχι για σένα.',
  'Twenty-odd of us run this tent. Kitsos was the one who wrote down who was doing what, and after that the tent stopped losing people.':
    'Καμιά εικοσαριά είμαστε σε αυτή τη σκηνή. Ο Κίτσος ήταν αυτός που έγραψε ποιος κάνει τι, και από τότε η σκηνή σταμάτησε να χάνει κόσμο.',
  'I came in for one Saturday in 2018 to shift some boxes. He put my name on a rota and I have not got off it since.':
    'Ήρθα για ένα Σάββατο το 2018 να κουβαλήσω κάτι κούτες. Μου έγραψε το όνομα στο πρόγραμμα βαρδιών και δεν έχω ξεκολλήσει από τότε.',
  'Tree planting in the spring, the donation drive at Christmas, the prison visits, the field trips. The blood drive is the one we never have to advertise.':
    'Δενδροφύτευση την άνοιξη, η συγκέντρωση προσφορών τα Χριστούγεννα, οι επισκέψεις στις φυλακές, οι εκδρομές. Την αιμοδοσία είναι το μόνο που δεν χρειάζεται ποτέ να το διαφημίσουμε.',
  'When he took over as Director he was younger than half his volunteers. Nobody minded by the second week.':
    'Όταν ανέλαβε διευθυντής ήταν μικρότερος από τους μισούς εθελοντές του. Από τη δεύτερη εβδομάδα δεν το σκεφτόταν κανείς.',
  'The volunteers': 'Οι εθελοντές',
  'The tent on the west green: sign-ups, donation drives, tree planting and the blood drive. Kostas has been on the rota since 2018.':
    'Η σκηνή στο δυτικό πάρκο: εγγραφές, συγκεντρώσεις προσφορών, δενδροφυτεύσεις και η αιμοδοσία. Ο Κώστας είναι στο πρόγραμμα βαρδιών από το 2018.',

  /* ------------------------------- Marios ----------------------------- */
  'I am ALLOWED behind the table. Kostas said. You are not.':
    'Εγώ ΕΠΙΤΡΕΠΕΤΑΙ να είμαι πίσω από το τραπέζι. Το είπε ο Κώστας. Εσύ όχι.',
  'I do the stickers. Everyone who signs up gets one, and if you give blood you get two.':
    'Εγώ κάνω τα αυτοκόλλητα. Όποιος γράφεται παίρνει ένα, και αν δώσεις αίμα παίρνεις δύο.',
  'Kitsos took us to plant trees up the hill. Mine is the crooked one. He said crooked ones still grow.':
    'Ο Κίτσος μάς πήγε να φυτέψουμε δέντρα πάνω στον λόφο. Το δικό μου είναι το στραβό. Είπε ότι και τα στραβά μεγαλώνουν.',
  'My mum says he ran the whole building when he was young. Younger than mum. That is weird.':
    'Η μαμά μου λέει ότι διηύθυνε ολόκληρο το κτίριο όταν ήταν νέος. Πιο νέος από τη μαμά. Περίεργο.',
  'The children at the tent': 'Τα παιδιά στη σκηνή',
  'Marios hands out the sign-up stickers. The Foundation’s programme — trips, tree planting, the lot — is run for children like him, and went on a live stream through the lockdowns rather than stopping.':
    'Ο Μάριος μοιράζει τα αυτοκόλλητα των εγγραφών. Το πρόγραμμα του Ιδρύματος — εκδρομές, δενδροφυτεύσεις, όλα — γίνεται για παιδιά σαν κι αυτόν, και στα lockdown βγήκε σε ζωντανή μετάδοση αντί να σταματήσει.',

  /* -------------------------- The kiosk board ------------------------- */
  'VOLUNTEERS’ KIOSK: sign-ups, donations, tree planting, and the blood drive.':
    'ΤΟ ΠΕΡΙΠΤΕΡΟ ΤΩΝ ΕΘΕΛΟΝΤΩΝ: εγγραφές, προσφορές, δενδροφυτεύσεις και αιμοδοσία.',
  'Run out of the Christian Youth Foundation "Pantokrator" in Paleo Faliro. Kitsos has been on this rota since 2017.':
    'Λειτουργεί από το Χριστιανικό Ίδρυμα Νεότητας «Παντοκράτωρ» στο Παλαιό Φάληρο. Ο Κίτσος είναι σε αυτό το πρόγραμμα βαρδιών από το 2017.',
  'Leading volunteer 2017–2021 and again from 2023, and Director of the place in between, 2021 to 2022.':
    'Επικεφαλής εθελοντής 2017–2021 και ξανά από το 2023, και διευθυντής του στο ενδιάμεσο, από το 2021 ως το 2022.',
  'He gives blood himself, since 2017. The tin of stickers is Marios’ department, and he is strict about it.':
    'Δίνει και ο ίδιος αίμα, από το 2017. Το κουτί με τα αυτοκόλλητα είναι αρμοδιότητα του Μάριου, και είναι αυστηρός σε αυτό.',
  'The volunteers’ kiosk': 'Το περίπτερο των εθελοντών',
  'The stall on the west green: sign-ups, donation drives, tree planting and a standing blood drive, run out of the "Pantokrator" Foundation in Paleo Faliro. Kitsos has been on the rota since 2017 — leading volunteer, and Director 2021–2022.':
    'Ο πάγκος στο δυτικό πάρκο: εγγραφές, συγκεντρώσεις προσφορών, δενδροφυτεύσεις και μόνιμη αιμοδοσία, από το Ίδρυμα «Παντοκράτωρ» στο Παλαιό Φάληρο. Ο Κίτσος είναι στο πρόγραμμα βαρδιών από το 2017 — επικεφαλής εθελοντής, και διευθυντής 2021–2022.',

  /* ------------------------------ Grigoris ---------------------------- */
  'Sit down, I have white. …No? Fine.': 'Κάτσε, έχω τα λευκά. …Όχι; Καλά.',
  'Kitsos plays here between runs. Chess, running, cycling. The man cannot sit still.':
    'Ο Κίτσος παίζει εδώ ανάμεσα στα τρεξίματα. Σκάκι, τρέξιμο, ποδήλατο. Δεν κάθεται στιγμή.',
  'Hiking, camping, theater, and half the furniture in his house is DIY.':
    'Πεζοπορία, κάμπινγκ, θέατρο, και τα μισά έπιπλα στο σπίτι του τα έφτιαξε μόνος.',
  'He treats a codebase the same way he treats an endgame: slowly, then all at once.':
    'Αντιμετωπίζει τον κώδικα όπως το φινάλε μιας παρτίδας: αργά, και μετά όλα μαζί.',

  /* ------------------------- Townsfolk in the square ------------------ */
  'Lovely square, is it not? He rebuilt those benches himself.':
    'Ωραία πλατεία, ε; Αυτά τα παγκάκια τα ξαναέφτιαξε μόνος του.',
  'Careful on Motivation Road. The students cycle like maniacs.':
    'Πρόσεχε στην Οδό Κινήτρου. Οι φοιτητές κάνουν ποδήλατο σαν τρελοί.',
  'Looking for the Lighthouse? Freedom Road, north-west, out to the cape.':
    'Ψάχνεις τον Φάρο; Οδός Ελευθερίας, βορειοδυτικά, μέχρι το ακρωτήρι.',
  'Locked since before I moved here. Five keys, they say. One per district.':
    'Κλειδωμένος από πριν έρθω εδώ. Πέντε κλειδιά, λένε. Ένα ανά συνοικία.',

  /* -------------------------------- Nikos ----------------------------- */
  'Cannot stop, halfway through the loop!':
    'Δεν μπορώ να σταματήσω, είμαι στη μέση του γύρου!',
  'He runs this coast most mornings. Cycles the long way round on Sundays.':
    'Τρέχει σε αυτή την ακτή σχεδόν κάθε πρωί. Τις Κυριακές κάνει τον μεγάλο γύρο με το ποδήλατο.',
  'Says the best debugging happens at kilometre six.':
    'Λέει ότι το καλύτερο debugging γίνεται στο έκτο χιλιόμετρο.',

  /* ---------------------------- Captain Yannis ------------------------ */
  'Sea is calm. Good day for a long conversation.':
    'Η θάλασσα είναι λάδι. Καλή μέρα για μεγάλη κουβέντα.',
  'Athens is over that horizon. That is where he lives and works.':
    'Η Αθήνα είναι πίσω από εκείνο τον ορίζοντα. Εκεί ζει και δουλεύει.',
  'Hiking, camping, a boat when he can get one. Then back to the screens.':
    'Πεζοπορία, κάμπινγκ, και μια βάρκα όποτε προλάβει. Και μετά πάλι στις οθόνες.',
  'If you have a job for him, do not shout it at the sea. Use the Radio Center.':
    'Αν έχεις δουλειά να του προτείνεις, μη φωνάζεις στη θάλασσα. Πήγαινε στο Ραδιοφωνικό Κέντρο.',

  /* ------------------------------ Ms. Stella -------------------------- */
  'Shelf by the chessboard. You cannot miss it, he never tidies.':
    'Ράφι δίπλα στη σκακιέρα. Δεν γίνεται να μην το δεις, ποτέ δεν συμμαζεύει.',
  'That is his house, right there. Lights on late, always.':
    'Να το σπίτι του, εκεί. Πάντα με τα φώτα αναμμένα ως αργά.',
  'I have watched that boy grow up from this spot. Seventy years I have been across the road from them.':
    'Από εδώ τον είδα να μεγαλώνει αυτό το παιδί. Εβδομήντα χρόνια απέναντί τους.',
  'I knew his grandfather. Same walk, same way of standing in a doorway to finish a sentence.':
    'Ήξερα τον παππού του. Ίδιο περπάτημα, ίδιος τρόπος να στέκεται στην πόρτα για να τελειώσει μια κουβέντα.',
  'Whatever is broken, he is out there with it. The shutter, the gate, the car up on the drive with the bonnet open all Sunday.':
    'Ό,τι χαλάσει, έξω είναι με αυτό. Το ρολό, η αυλόπορτα, το αυτοκίνητο στην αυλή με το καπό ανοιχτό όλη την Κυριακή.',
  'And the whole family, God bless them. You will not find better people on this island.':
    'Και όλη η οικογένεια, να είναι καλά. Καλύτερους ανθρώπους δεν βρίσκεις σε αυτό το νησί.',
  'Greek is his mother tongue, English at proficiency with the Michigan ECPE, and French to B2 with the DELF for it.':
    'Μητρική του τα ελληνικά, αγγλικά σε επίπεδο proficiency με το ECPE του Michigan, και γαλλικά B2 με το DELF.',
  'Athens born and based. Greek national. Go in, go in, he does not mind visitors.':
    'Γεννημένος και εγκατεστημένος στην Αθήνα. Έλληνας υπήκοος. Πέρνα μέσα, πέρνα, δεν τον πειράζουν οι επισκέπτες.',
  'Looking for the brass key? It is on the shelf beside the chessboard, inside.':
    'Ψάχνεις το μπρούτζινο κλειδί; Είναι στο ράφι δίπλα στη σκακιέρα, μέσα.',

  /* ------------------------------- Marina ----------------------------- */
  'You missed the elections, but I can tell you about them.':
    'Έχασες τις εκλογές, αλλά μπορώ να σου πω.',
  'Kitsos was a students’ representative and led the Independent ECE Students.':
    'Ο Κίτσος ήταν εκπρόσωπος φοιτητών και επικεφαλής των Ανεξάρτητων Φοιτητών ΗΜΜΥ.',
  'The platform: establish e-voting, depoliticize the university, and solve problems with realistic, lawful, democratic means.':
    'Το πρόγραμμα: ηλεκτρονική ψηφοφορία, απο-κομματικοποίηση του πανεπιστημίου, και λύσεις με ρεαλιστικά, νόμιμα, δημοκρατικά μέσα.',
  'He argued with everyone and stayed on speaking terms with everyone. Rare skill.':
    'Τα έβαλε με όλους και κράτησε καλές σχέσεις με όλους. Σπάνιο χάρισμα.',

  /* -------------------------------- Alex ------------------------------ */
  'Look! My robot goes forward AND turns!':
    'Κοίτα! Το ρομπότ μου πάει μπροστά ΚΑΙ στρίβει!',
  'Kitsos taught robotics to kids like me at Citylab in Alimos, 2020 to 2021.':
    'Ο Κίτσος δίδασκε ρομποτική σε παιδιά σαν εμένα στο Citylab στον Άλιμο, από το 2020 ως το 2021.',
  'He says a program is just instructions someone else has to read later. So write them nicely.':
    'Λέει ότι ένα πρόγραμμα είναι απλώς οδηγίες που κάποιος άλλος θα διαβάσει αργότερα. Οπότε γράψ’ τες ωραία.',

  /* --------------------------- Sergeant Petros ------------------------ */
  'Footlocker. End of the bunks. Do not rearrange my barracks.':
    'Ερμάριο. Στο τέλος των κρεβατιών. Και μη μου αναστατώσεις τον θάλαμο.',
  'Halt. …Relax, civilian, the camp is open today.':
    'Αλτ. …Ησύχασε, πολίτη, σήμερα το στρατόπεδο είναι ανοιχτό.',
  'Second Lieutenant Orfanopoulos, reservist. September 2022 to November 2023, straight out of NTUA.':
    'Ανθυπολοχαγός Ορφανόπουλος, έφεδρος. Από τον Σεπτέμβριο του 2022 ως τον Νοέμβριο του 2023, κατευθείαν από το ΕΜΠ.',
  'Basic training at the Center of Special Forces in Nea Peramos. Third in his class out of the Infantry Reserve Officers School in Heraklion.':
    'Βασική εκπαίδευση στο Κέντρο Εκπαίδευσης Ειδικών Δυνάμεων στη Νέα Πέραμο. Τρίτος της σειράς του από τη Σχολή Εφέδρων Αξιωματικών Πεζικού στο Ηράκλειο.',
  'Then the Rangers’ school at Rentina, guerilla warfare. After that, Deputy Company Commander and Weapons Officer at a Marine Battalion.':
    'Μετά το σχολείο Rangers στη Ρεντίνα, ανταρτοπόλεμος. Και έπειτα Υποδιοικητής Λόχου και Αξιωματικός Οπλισμού σε Τάγμα Πεζοναυτών.',
  'Platoon Leader and Weapons Officer for a Marine Company. Personnel, logistics, weaponry, readiness.':
    'Διμοιρίτης και Αξιωματικός Οπλισμού σε Λόχο Πεζοναυτών. Προσωπικό, εφοδιασμός, οπλισμός, ετοιμότητα.',
  'The Battalion Commander wrote him a letter. It is framed inside, on the east wall. Read it.':
    'Ο Διοικητής του Τάγματος του έγραψε επιστολή. Είναι κορνιζαρισμένη μέσα, στον ανατολικό τοίχο. Διάβασέ την.',
  'That is where the calm comes from. Bad news does not make him louder.':
    'Από εκεί βγαίνει η ψυχραιμία. Τα άσχημα νέα δεν τον κάνουν να υψώσει τη φωνή.',
  'The key you are after is in the footlocker at the end of the bunks. Go on in.':
    'Το κλειδί που ψάχνεις είναι στο ερμάριο στο τέλος των κρεβατιών. Πέρνα μέσα.',

  /* ---------------------------- Dean Tsanakas ------------------------- */
  'Panagiotis Tsanakas, Dean of the School. Sit anywhere; the lecture is over.':
    'Παναγιώτης Τσανάκας, Κοσμήτορας της Σχολής. Κάθισε όπου θες· η διάλεξη τελείωσε.',
  'The most competitive school in the country to get into, only the top entrance grades make it, and a five-year programme most students take seven and a half to finish. Kitsos finished it in five. 2017 to 2022, 8.4.':
    'Η πιο ανταγωνιστική σχολή της χώρας για να μπεις, μόνο οι κορυφαίες βαθμολογίες των πανελληνίων περνούν, και ένα πενταετές πρόγραμμα που οι περισσότεροι φοιτητές θέλουν εφτάμισι χρόνια για να τελειώσουν. Ο Κίτσος το τελείωσε σε πέντε. 2017 ως 2022, 8,4.',
  'He was my student in Operating Systems and Software Service Technologies, and I supervised his thesis: a phone application that watches a movement through a neural network, recognises it and judges how well it was done. Distinction. Three years later, a paper on arXiv. The case by the east wall has it.':
    'Ήταν φοιτητής μου στα Λειτουργικά Συστήματα και στις Τεχνολογίες Υπηρεσιών Λογισμικού, και επέβλεψα τη διπλωματική του: μια εφαρμογή για κινητό που παρακολουθεί μια κίνηση μέσα από νευρωνικό δίκτυο, την αναγνωρίζει και κρίνει πόσο καλά εκτελέστηκε. Άριστα. Τρία χρόνια μετά, δημοσίευση στο arXiv. Η προθήκη στον ανατολικό τοίχο την έχει.',
  'When the assemblies were being wrecked by people with no connection to this School, I appointed him independent students’ representative. Two years, and he told everyone everything he did. That is rarer than the grades.':
    'Όταν οι συνελεύσεις διαλύονταν από ανθρώπους χωρίς καμία σχέση με αυτή τη Σχολή, τον όρισα ανεξάρτητο εκπρόσωπο των φοιτητών. Δύο χρόνια, και έλεγε σε όλους ό,τι έκανε. Αυτό είναι πιο σπάνιο από τους βαθμούς.',
  'And through the last three of those years he was also working, the last two of them full-time, running a youth foundation. I still do not know where the hours came from.':
    'Και τα τρία τελευταία από εκείνα τα χρόνια δούλευε κιόλας, τα δύο τελευταία με πλήρες ωράριο, διευθύνοντας ένα ίδρυμα νεότητας. Ακόμη δεν ξέρω από πού έβρισκε τις ώρες.',
  'The lecture hall key is on the thesis display, past the lectern. My letter is on the board by the west wall.':
    'Το κλειδί του αμφιθεάτρου είναι στην προθήκη της διπλωματικής, πίσω από την έδρα. Η επιστολή μου είναι στον πίνακα στον δυτικό τοίχο.',
  'National Technical University of Athens, School of Electrical and Computer Engineering, the most competitive school in Greece to enter. MEng 2017–2022 in the five years the programme is designed for, GPA 8.4; thesis supervised by the Dean and graded with distinction.':
    'Εθνικό Μετσόβιο Πολυτεχνείο, Σχολή Ηλεκτρολόγων Μηχανικών και Μηχανικών Υπολογιστών, η πιο ανταγωνιστική σχολή της Ελλάδας για να μπεις. Δίπλωμα 2017–2022 στα πέντε χρόνια που προβλέπει το πρόγραμμα, βαθμός 8,4· διπλωματική με επιβλέποντα τον Κοσμήτορα και βαθμό άριστα.',

  /* ----------------------------- Prof. Nikos -------------------------- */
  'Introduction to Programming, then Programming Techniques: ten and ten. He did not just do the exercises. He did them, and then posted the worked solutions on the forum for everybody else.':
    'Εισαγωγή στον Προγραμματισμό, μετά Τεχνικές Προγραμματισμού: δέκα και δέκα. Δεν έλυνε απλώς τις ασκήσεις. Τις έλυνε, και μετά ανέβαζε τις λύσεις στο forum για όλους τους άλλους.',
  'He assisted in my first-year labs. The students asked him things they would not ask me.':
    'Βοηθούσε στα εργαστήρια του πρώτου έτους. Οι φοιτητές τον ρωτούσαν πράγματα που δεν θα ρωτούσαν εμένα.',
  'Operating Systems, Human–Computer Interaction, Multimedia, Information Systems: tens, all of them. The transcript is on the wall; read it for yourself.':
    'Λειτουργικά Συστήματα, Αλληλεπίδραση Ανθρώπου–Υπολογιστή, Πολυμέσα, Πληροφοριακά Συστήματα: δέκα, όλα. Η αναλυτική είναι στον τοίχο· διάβασέ την μόνος σου.',
  'What I tell them is that a program is instructions somebody else has to read later. He wrote his as if he believed it.':
    'Αυτό που τους λέω είναι ότι ένα πρόγραμμα είναι οδηγίες που κάποιος άλλος θα πρέπει να διαβάσει αργότερα. Έγραφε τα δικά του σαν να το πίστευε.',
  'Tens in programming': 'Δέκα στον προγραμματισμό',
  'Prof. Nikos, who taught him programming at NTUA: a ten in every programming course from the first semester to the last, worked solutions posted for the whole year, and a lab instructor in the first-year labs.':
    'Ο καθηγητής Νίκος, που του δίδαξε προγραμματισμό στο ΕΜΠ: δέκα σε κάθε μάθημα προγραμματισμού από το πρώτο εξάμηνο ως το τελευταίο, λύσεις ανεβασμένες για όλο το έτος, και βοηθός στα εργαστήρια του πρώτου έτους.',

  /* ------------------------------- Giorgos ---------------------------- */
  'Are you here about the Guide? A hundred and ten pages. Every compulsory course: what it is, how it is examined, how to survive it.':
    'Για τον Οδηγό ήρθες; Εκατόν δέκα σελίδες. Κάθε υποχρεωτικό μάθημα: τι είναι, πώς εξετάζεται, πώς το επιβιώνεις.',
  'It is years old and we still pass it round. Half of us thought the author was a legend somebody made up. Turns out he is a person.':
    'Είναι χρόνων και ακόμη τον δίνουμε χέρι με χέρι. Οι μισοί από εμάς νομίζαμε ότι ο συγγραφέας ήταν θρύλος που κάποιος επινόησε. Τελικά είναι άνθρωπος.',
  'He put his notes online too, and answered the forum questions. Some of us would not have made it to second year without him.':
    'Ανέβασε και τις σημειώσεις του, και απαντούσε στις ερωτήσεις του forum. Κάποιοι από εμάς δεν θα είχαμε φτάσει στο δεύτερο έτος χωρίς αυτόν.',
  'The legend of the Guide': 'Ο θρύλος του Οδηγού',
  'Giorgos, a first-year at ECE: the hundred-and-ten-page Survival Guide is still passed from year to year, and some of the students reading it were not sure the author was real.':
    'Ο Γιώργος, πρωτοετής στο ΗΜΜΥ: ο Οδηγός Επιβίωσης των εκατόν δέκα σελίδων δίνεται ακόμη από έτος σε έτος, και κάποιοι από όσους τον διαβάζουν δεν ήταν σίγουροι ότι ο συγγραφέας υπήρξε.',

  /* ------------------------------ Prof. Ilias ------------------------- */
  'I sat on the faculty assemblies for years. Most student representatives came to shout. He came with a list.':
    'Κάθισα στις Γενικές Συνελεύσεις της Σχολής για χρόνια. Οι περισσότεροι εκπρόσωποι φοιτητών έρχονταν να φωνάξουν. Αυτός ήρθε με λίστα.',
  'A petition, more than seven hundred signatures in two days, for e-voting, and for keeping party politics out of the students’ business. Then he stood up in front of eight hundred people and said it again.':
    'Ένα ψήφισμα, πάνω από εφτακόσιες υπογραφές σε δύο μέρες, για ηλεκτρονική ψηφοφορία, και για να μείνουν τα κόμματα έξω από τα φοιτητικά ζητήματα. Και μετά σηκώθηκε μπροστά σε οχτακόσιους ανθρώπους και το είπε ξανά.',
  'Two years as the independent representative the Dean appointed, and every time, a note to the students on what had been said and done. Openness is not a slogan when you actually do it.':
    'Δύο χρόνια ως ο ανεξάρτητος εκπρόσωπος που όρισε ο Κοσμήτορας, και κάθε φορά, ένα σημείωμα στους φοιτητές για όσα ειπώθηκαν και έγιναν. Η διαφάνεια δεν είναι σύνθημα όταν την κάνεις πράξη.',
  'A list, not a shout': 'Μια λίστα, όχι μια φωνή',
  'Prof. Ilias, who sat on the faculty assemblies: the petition of more than 700 signatures in two days, the speech to 800, and two years of independent representation reported back to the students every time.':
    'Ο καθηγητής Ηλίας, που καθόταν στις Γενικές Συνελεύσεις: το ψήφισμα με πάνω από 700 υπογραφές σε δύο μέρες, η ομιλία σε 800, και δύο χρόνια ανεξάρτητης εκπροσώπησης με αναφορά στους φοιτητές κάθε φορά.',

  /* -------------------------------- Stelios --------------------------- */
  'Projects and coding competitions, five years of them, and he was on the team for most of mine.':
    'Εργασίες και διαγωνισμοί προγραμματισμού, πέντε χρόνια, και ήταν στην ομάδα στους περισσότερους δικούς μου.',
  'Very strong coding skills, a solution-oriented mindset, and a person of integrity. I wrote that down for him later, it is on the board in the lecture hall, and I would write it again.':
    'Πολύ δυνατές ικανότητες στον προγραμματισμό, νοοτροπία προσανατολισμένη στη λύση, και άνθρωπος με ακεραιότητα. Το έγραψα γι’ αυτόν αργότερα, είναι στον πίνακα στο αμφιθέατρο, και θα το ξανάγραφα.',
  'He always ended up leading, and nobody minded. That is the trick, and I have not learned it yet.':
    'Πάντα κατέληγε να ηγείται, και κανείς δεν είχε πρόβλημα. Αυτό είναι το κόλπο, και ακόμη δεν το έχω μάθει.',
  'A classmate’s word': 'Ο λόγος ενός συμφοιτητή',
  'Stelios Kandylakis, his classmate at ECE: five years of shared projects and coding competitions, and a recommendation: strong coding, a solution-oriented mindset, integrity, and leadership nobody minded.':
    'Ο Στέλιος Κανδυλάκης, συμφοιτητής του στο ΗΜΜΥ: πέντε χρόνια κοινών εργασιών και διαγωνισμών προγραμματισμού, και μια σύσταση: δυνατός προγραμματισμός, νοοτροπία λύσης, ακεραιότητα, και ηγεσία που κανείς δεν πείραζε.',

  /* ------------------------------ Dr. Fotini -------------------------- */
  'The lab bench is open, mind the cables.':
    'Ο πάγκος του εργαστηρίου είναι ανοιχτός, πρόσεχε τα καλώδια.',
  'See the certificate wall over there? MIT Open Learning for the AI foundations, CITI Program for biomedical research and HIPAA, Docker from IBM.':
    'Βλέπεις τον τοίχο με τα πιστοποιητικά εκεί; MIT Open Learning για τα θεμέλια της τεχνητής νοημοσύνης, CITI Program για βιοϊατρική έρευνα και HIPAA, Docker από την IBM.',
  'Languages too: ECPE and ECCE from Michigan, and DELF B2 in French.':
    'Και γλώσσες: ECPE και ECCE από το Michigan, και DELF B2 στα γαλλικά.',
  'He was at the Arduino IEEE Workshop here in 2018, volunteered at the European Researchers’ Night in 2019 and the 100-years celebration of ECE in 2017.':
    'Ήταν στο Arduino IEEE Workshop εδώ το 2018, εθελοντής στη Βραδιά του Ερευνητή το 2019 και στον εορτασμό των 100 χρόνων ΗΜΜΥ το 2017.',
  'Contests as well: 2nd in the National Biology Competition of 2016, plus awards in Physics, Mathematics, Informatics and Literature.':
    'Και διαγωνισμοί: 2ος στον Πανελλήνιο Διαγωνισμό Βιολογίας του 2016, μαζί με διακρίσεις σε Φυσική, Μαθηματικά, Πληροφορική και Λογοτεχνία.',

  /* -------------------------------- Robin ----------------------------- */
  'Welcome to the Work District. Three floors, one employer each, and a lift that only goes to two of them.':
    'Καλώς ήρθες στη Συνοικία Εργασίας. Τρεις όροφοι, ένας εργοδότης στον καθένα, και ένα ασανσέρ που πάει μόνο στους δύο.',
  'I am Robin. I am here because somebody has to say the unglamorous part out loud: the work does not speak for itself. It never has.':
    'Είμαι η Ρόμπιν. Είμαι εδώ επειδή κάποιος πρέπει να πει φωναχτά το αγλαμουρόζικο κομμάτι: η δουλειά δεν μιλάει από μόνη της. Ποτέ δεν μίλησε.',
  'Most engineers are worse at describing what they built than at building it. A CV is not a receipt for your time — it is an argument about what you can do next.':
    'Οι περισσότεροι μηχανικοί είναι χειρότεροι στο να περιγράφουν τι έφτιαξαν απ’ ό,τι στο να το φτιάχνουν. Ένα βιογραφικό δεν είναι απόδειξη για τον χρόνο σου — είναι ένα επιχείρημα για το τι μπορείς να κάνεις μετά.',
  'So this building is laid out as an argument. Ground floor: what he is good at, what he is certified in, and the jobs he held before any of it was software.':
    'Γι’ αυτό το κτίριο είναι στημένο σαν επιχείρημα. Ισόγειο: σε τι είναι καλός, τι πιστοποιήσεις έχει, και οι δουλειές που έκανε πριν γίνει τίποτα απ’ όλα αυτά λογισμικό.',
  'First floor, IBM. Second floor, Veltiston AI. Take the stairs in the corner or the lift, whichever you prefer. The lift is slower and worth it.':
    'Πρώτος όροφος, IBM. Δεύτερος όροφος, Veltiston AI. Πάρε τη σκάλα στη γωνία ή το ασανσέρ, ό,τι προτιμάς. Το ασανσέρ είναι πιο αργό και αξίζει.',
  'And the third floor? Built, empty, unnamed. He is good at this and he is listening — so what goes up there depends on who walks in.':
    'Και ο τρίτος όροφος; Χτισμένος, άδειος, χωρίς όνομα. Είναι καλός σε αυτό και ακούει προτάσεις — οπότε το τι θα ανέβει εκεί πάνω εξαρτάται από το ποιος θα μπει.',
  'You have walked in.': 'Μόλις μπήκες.',

  /* --------------------------- Κυριάκος Οικονόμου --------------------- */
  'You are looking at the small board. Good — most people walk past it to get to the lift.':
    'Κοιτάς τον μικρό πίνακα. Ωραία — οι περισσότεροι τον προσπερνούν για να πάνε στο ασανσέρ.',
  'I am Kyriakos Oikonomou. I sat on the Supreme Court, the Areios Pagos, until I retired, and I have been Vice-President of the "Pantokrator" Foundation in Paleo Faliro since 2020.':
    'Είμαι ο Κυριάκος Οικονόμου. Υπηρέτησα στον Άρειο Πάγο μέχρι που συνταξιοδοτήθηκα, και είμαι Αντιπρόεδρος του Ιδρύματος «Παντοκράτωρ» στο Παλαιό Φάληρο από το 2020.',
  'In 2021 the Directorship of the Foundation fell vacant. I did not advertise it. I went to Kitsos, who was then a student at the Polytechnic, and asked him to take it.':
    'Το 2021 έμεινε κενή η θέση του Διευθυντή του Ιδρύματος. Δεν την προκήρυξα. Πήγα στον Κίτσο, που ήταν τότε φοιτητής στο Πολυτεχνείο, και του ζήτησα να την αναλάβει.',
  'He was an undergraduate. I handed him a building, the staff, the volunteers, the budget and the children. He was twenty-something.':
    'Ήταν προπτυχιακός φοιτητής. Του παρέδωσα ένα κτίριο, το προσωπικό, τους εθελοντές, τον προϋπολογισμό και τα παιδιά. Ήταν είκοσι και κάτι χρονών.',
  'A year and a half later he left, because the degree was finished and the army was waiting, and what he handed back had gone well past what we asked of him. The premises renovated, the operations modernised, the events running.':
    'Ενάμιση χρόνο μετά έφυγε, γιατί το πτυχίο είχε τελειώσει και τον περίμενε ο στρατός, και αυτό που παρέδωσε είχε ξεπεράσει κατά πολύ όσα του ζητήσαμε. Οι εγκαταστάσεις ανακαινισμένες, η λειτουργία εκσυγχρονισμένη, οι εκδηλώσεις να τρέχουν.',
  'He was organised, hard-working and conscientious, and he told us everything he did as he did it. The children trusted him and listened to him, which is not a thing you can be appointed to.':
    'Ήταν οργανωτικός, εργατικός και ευσυνείδητος, και μας έλεγε ό,τι έκανε την ώρα που το έκανε. Τα παιδιά τον εμπιστεύονταν και τον άκουγαν, και αυτό δεν είναι κάτι στο οποίο σε διορίζουν.',
  'My letter is on the wall beside the board. Read it there — I have said it better on paper than I will standing here.':
    'Η επιστολή μου είναι στον τοίχο δίπλα στον πίνακα. Διάβασέ την εκεί — το έχω πει καλύτερα στο χαρτί απ’ ό,τι θα το πω όρθιος εδώ.',

  /* -------------------------------- Γιώργος --------------------------- */
  'First floor. IBM. Mind the deploys.':
    'Πρώτος όροφος. IBM. Πρόσεχε τα deploy.',
  'Giorgos — I was on the DevOps side with him on the Cosmos Project at the National Bank of Greece.':
    'Γιώργος — ήμουν στην πλευρά του DevOps μαζί του στο έργο Cosmos στην Εθνική Τράπεζα της Ελλάδος.',
  'Cosmos was the core banking transformation: PL/I and COBOL, decades of it, being moved onto Infosys Finacle. You do not turn that off one evening and turn it on the next morning.':
    'Το Cosmos ήταν ο μετασχηματισμός του βασικού τραπεζικού συστήματος: PL/I και COBOL, δεκαετιών, που μεταφέρονταν στο Infosys Finacle. Δεν το κλείνεις ένα βράδυ και το ανοίγεις το επόμενο πρωί.',
  'So there is a coexistence state, where the old and the new run side by side and have to agree with each other, and a target state where only the new is left. He designed the integration architecture for both.':
    'Υπάρχει λοιπόν ένα μεταβατικό στάδιο συνύπαρξης, όπου το παλιό και το νέο τρέχουν παράλληλα και πρέπει να συμφωνούν μεταξύ τους, και ένα τελικό στάδιο όπου μένει μόνο το νέο. Σχεδίασε την αρχιτεκτονική ενσωμάτωσης και για τα δύο.',
  'He ran the integration calls across the bank subsystems too, which is the job nobody volunteers for: half a dozen teams who each think the problem is somebody else.':
    'Έτρεχε και τις συσκέψεις ενσωμάτωσης ανάμεσα στα υποσυστήματα της τράπεζας, που είναι η δουλειά για την οποία δεν προσφέρεται κανείς εθελοντικά: μισή ντουζίνα ομάδες που η καθεμιά νομίζει ότι το πρόβλημα είναι κάποιος άλλος.',
  'On our side it was ticket deployments and pipeline automation — Jenkins, Podman, Docker Compose, ELK and Grafana on top so you could see what you had done.':
    'Από τη δική μας πλευρά ήταν deployments από tickets και αυτοματοποίηση pipeline — Jenkins, Podman, Docker Compose, ELK και Grafana από πάνω για να βλέπεις τι έκανες.',
  'The server room key is on the rack at the back. Take it, you have my blessing.':
    'Το κλειδί της μηχανογράφησης είναι στο rack στο βάθος. Πάρ’ το, έχεις την ευχή μου.',

  /* --------------------- Κυρία Ιωάννα Παναγοπούλου -------------------- */
  'You must be the one walking round the building. Ioanna Panagopoulou — I supervised him at the bank.':
    'Εσύ θα είσαι αυτός που γυρνάει στο κτίριο. Ιωάννα Παναγοπούλου — ήμουν προϊσταμένη του στην τράπεζα.',
  'He came to us through IBM as an integration analyst, on the Finacle onboarding. On paper that is a junior posting.':
    'Ήρθε σε εμάς μέσω της IBM ως integration analyst, στο onboarding του Finacle. Στα χαρτιά αυτή είναι θέση junior.',
  'It was not how he worked it. He would come to the calls having already read what the subsystem actually did, not just what the ticket said about it.':
    'Δεν τη δούλεψε όμως έτσι. Ερχόταν στις συσκέψεις έχοντας ήδη διαβάσει τι έκανε πραγματικά το υποσύστημα, όχι μόνο τι έλεγε το ticket γι’ αυτό.',
  'Integration analysis is mostly translation: this team says "customer", that team means something narrower by it, and the migration fails in eighteen months if nobody notices today. He noticed.':
    'Η ανάλυση ενσωμάτωσης είναι κυρίως μετάφραση: αυτή η ομάδα λέει «πελάτης», η άλλη εννοεί κάτι στενότερο, και η μετάπτωση αποτυγχάνει σε δεκαοκτώ μήνες αν δεν το προσέξει κανείς σήμερα. Εκείνος το πρόσεξε.',
  'He was excellent at it. I say that plainly because I was asked plainly, and because I would take him back tomorrow.':
    'Ήταν εξαιρετικός σε αυτό. Το λέω ευθέως γιατί ευθέως με ρώτησαν, και γιατί θα τον έπαιρνα πίσω αύριο κιόλας.',
  'He left for a startup, which I told him was the right decision and was sorry to hear.':
    'Έφυγε για μια startup, που του είπα ότι ήταν η σωστή απόφαση και λυπήθηκα που την άκουσα.',

  /* -------------------------------- Κλάους ---------------------------- */
  'Hamburg, February 2024. Cold week. Good week.':
    'Αμβούργο, Φεβρουάριος 2024. Κρύα εβδομάδα. Καλή εβδομάδα.',
  'Klaus. IBM sent people from across Europe to the Agile and Enterprise Design Thinking bootcamp, and Greece sent him.':
    'Κλάους. Η IBM έστειλε κόσμο από όλη την Ευρώπη στο bootcamp Agile and Enterprise Design Thinking, και η Ελλάδα έστειλε εκείνον.',
  'That is the part worth pausing on: one person represented IBM Greece, and he had been with the company a few months.':
    'Αυτό είναι το σημείο που αξίζει να σταθείς: ένα άτομο εκπροσώπησε την IBM Ελλάδος, και ήταν στην εταιρεία λίγους μήνες.',
  'Design Thinking at IBM is not a poster. It is a working method — you start from the user you are actually building for, you write down who they are, and you are held to it for the rest of the week.':
    'Το Design Thinking στην IBM δεν είναι αφίσα. Είναι μέθοδος δουλειάς — ξεκινάς από τον χρήστη για τον οποίο πραγματικά χτίζεις, γράφεις ποιος είναι, και λογοδοτείς γι’ αυτό όλη την υπόλοιπη εβδομάδα.',
  'He argued. Politely, but he argued, which is more than most did. And he came back with the method rather than the certificate, which is the rarer outcome.':
    'Διαφώνησε. Ευγενικά, αλλά διαφώνησε, που είναι περισσότερο απ’ ό,τι έκαναν οι περισσότεροι. Και γύρισε με τη μέθοδο αντί για το πιστοποιητικό, που είναι το σπανιότερο αποτέλεσμα.',
  'We still talk. If you are hiring him, do it before somebody in Hamburg does.':
    'Μιλάμε ακόμη. Αν σκέφτεσαι να τον προσλάβεις, κάν’ το πριν τον προλάβει κάποιος στο Αμβούργο.',

  /* --------------------- Καθηγητής Δημήτρης Μπερτσιμάς ---------------- */
  'Welcome to the second floor. This is the company.':
    'Καλώς ήρθες στον δεύτερο όροφο. Αυτή είναι η εταιρεία.',
  'Dimitris Bertsimas. I teach at MIT, and I founded Veltiston AI because optimisation has been solved in the literature for thirty years and hospitals are still building rosters by hand.':
    'Δημήτρης Μπερτσιμάς. Διδάσκω στο MIT, και ίδρυσα τη Veltiston AI επειδή η βελτιστοποίηση έχει λυθεί στη βιβλιογραφία εδώ και τριάντα χρόνια και τα νοσοκομεία εξακολουθούν να φτιάχνουν βάρδιες στο χέρι.',
  'That is the whole vision, and it is not a modest one: take the analytics that work on paper and put them where a charge nurse can press a button at seven in the morning.':
    'Αυτό είναι όλο το όραμα, και δεν είναι μετριοπαθές: πάρε τα analytics που δουλεύουν στο χαρτί και βάλ’ τα εκεί που μια προϊσταμένη νοσηλεύτρια μπορεί να πατήσει ένα κουμπί στις εφτά το πρωί.',
  'Kitsos was one of the founding engineers, in 2024. There were very few of us then and the platform did not exist — there was an idea about scheduling and a great deal of arguing.':
    'Ο Κίτσος ήταν ένας από τους ιδρυτικούς μηχανικούς, το 2024. Ήμασταν πολύ λίγοι τότε και η πλατφόρμα δεν υπήρχε — υπήρχε μια ιδέα για τον προγραμματισμό βαρδιών και πολλή συζήτηση.',
  'He built it from that. Concept to production, and then he became the technical lead of it, which is a different job and he made the change well.':
    'Την έχτισε από εκεί. Από τη σύλληψη ως την παραγωγή, και μετά έγινε ο τεχνικός υπεύθυνός της, που είναι άλλη δουλειά, και έκανε τη μετάβαση καλά.',
  'What I look for is people who can hold the mathematics and the delivery in one head. He can. He also tells me when he disagrees with me, in front of other people, which is worth more than it costs.':
    'Αυτό που ψάχνω είναι ανθρώπους που μπορούν να κρατούν τα μαθηματικά και την παράδοση στο ίδιο κεφάλι. Εκείνος μπορεί. Μου λέει επίσης πότε διαφωνεί μαζί μου, μπροστά σε άλλους, που αξίζει περισσότερο απ’ όσο κοστίζει.',
  'Major American hospitals run it now. That is not a pilot. That is a ward that is short-staffed if we are wrong.':
    'Μεγάλα αμερικανικά νοσοκομεία την τρέχουν τώρα. Αυτό δεν είναι πιλοτικό. Αυτό είναι ένας θάλαμος που μένει υποστελεχωμένος αν κάνουμε λάθος.',

  /* -------------------------------- Καρίμ ----------------------------- */
  'Greece, Boston, Morocco. I am the Morocco part of the stand-up.':
    'Ελλάδα, Βοστώνη, Μαρόκο, εγώ είμαι το μαροκινό κομμάτι του stand-up.',
  'Karim. I have worked under a few leads. I am going to tell you why this one is different, and it is not the architecture.':
    'Καρίμ. Έχω δουλέψει υπό αρκετούς υπεύθυνους. Θα σου πω γιατί αυτός είναι διαφορετικός, και δεν είναι η αρχιτεκτονική.',
  'Three time zones is an excuse most companies use. He refuses it. The handover is written down, the decisions are written down, and nobody in Casablanca finds out on Thursday what was settled in Athens on Monday.':
    'Οι τρεις ζώνες ώρας είναι δικαιολογία που χρησιμοποιούν οι περισσότερες εταιρείες. Εκείνος την αρνείται. Η παράδοση γράφεται, οι αποφάσεις γράφονται, και κανείς στην Καζαμπλάνκα δεν μαθαίνει την Πέμπτη τι κανονίστηκε στην Αθήνα τη Δευτέρα.',
  'He leads teams of five to ten across all of it: architecture, code reviews, sprint planning, the customer calls nobody wants.':
    'Ηγείται ομάδων πέντε ως δέκα ατόμων σε όλα αυτά: αρχιτεκτονική, code reviews, sprint planning, και τις κλήσεις με τους πελάτες που δεν θέλει κανείς.',
  'He reviews my code properly — line by line, with the reason, and he changes his mind when I am right. That sounds small. Ask around how rare it is.':
    'Κάνει review στον κώδικά μου σωστά — γραμμή γραμμή, με την αιτιολογία, και αλλάζει γνώμη όταν έχω δίκιο. Ακούγεται μικρό. Ρώτα τριγύρω πόσο σπάνιο είναι.',
  'He runs the technical interviews and he onboards every new engineer himself. I was onboarded by him. That is why I am still here.':
    'Κάνει τις τεχνικές συνεντεύξεις και υποδέχεται κάθε νέο μηχανικό ο ίδιος. Εμένα με υποδέχτηκε εκείνος. Γι’ αυτό είμαι ακόμη εδώ.',
  'Good leadership, honestly. I do not say that about many people and I am not paid to say it about him.':
    'Καλή ηγεσία, ειλικρινά. Δεν το λέω για πολλούς και δεν πληρώνομαι για να το πω γι’ αυτόν.',

  /* ------------------------------- Μιχάλης ---------------------------- */
  'Michalis. I joined about the same time he did, so I watched all of this get built.':
    'Μιχάλης. Μπήκα περίπου την ίδια εποχή με εκείνον, οπότε είδα όλο αυτό να χτίζεται.',
  'You want the interesting part? The integrations.':
    'Θες το ενδιαφέρον κομμάτι; Οι ενσωματώσεις.',
  'A documentation assistant on Spring AI — retrieval-augmented generation over the hospital’s own material, with agentic AI on top so it can actually do something rather than just answer.':
    'Ένας βοηθός τεκμηρίωσης σε Spring AI — retrieval-augmented generation πάνω στο υλικό του ίδιου του νοσοκομείου, με agentic AI από πάνω ώστε να μπορεί να κάνει κάτι και όχι απλώς να απαντά.',
  'A SMART on FHIR application running inside Epic. If you have not worked with an EHR: you do not get to ask Epic to change. You arrive in the shape it expects.':
    'Μια εφαρμογή SMART on FHIR που τρέχει μέσα στο Epic. Αν δεν έχεις δουλέψει με EHR: δεν έχεις το δικαίωμα να ζητήσεις από το Epic να αλλάξει. Φτάνεις στη μορφή που περιμένει εκείνο.',
  'A Length of Stay analytics plugin delivered the same way, UKG workforce management wired in, SAML 2.0 single sign-on against Microsoft ADFS.':
    'Ένα plugin analytics για το Length of Stay που παραδόθηκε με τον ίδιο τρόπο, ενσωματωμένο UKG για τη διαχείριση προσωπικού, single sign-on με SAML 2.0 απέναντι σε Microsoft ADFS.',
  'A secure notification framework, full activity audit logging, and a Jira-integrated ticketing system with reCAPTCHA on the front so the queue stays real.':
    'Ένα ασφαλές framework ειδοποιήσεων, πλήρες audit logging δραστηριότητας, και σύστημα αιτημάτων ενσωματωμένο με Jira, με reCAPTCHA μπροστά ώστε η ουρά να μένει πραγματική.',
  'Java 17 through 25, Spring Boot, React, MySQL with Flyway, AWS, Docker, Jenkins and GitLab CI. Grafana, Graylog and Sentry watching it. JUnit, Mockito and JaCoCo proving it.':
    'Java 17 ως 25, Spring Boot, React, MySQL με Flyway, AWS, Docker, Jenkins και GitLab CI. Grafana, Graylog και Sentry να το παρακολουθούν. JUnit, Mockito και JaCoCo να το αποδεικνύουν.',
  'And it goes to production most weeks. That pace is not normal. It works because HIPAA and the security architecture were designed in at the start, not bolted on when the auditor called.':
    'Και βγαίνει στην παραγωγή τις περισσότερες εβδομάδες. Αυτός ο ρυθμός δεν είναι φυσιολογικός. Δουλεύει επειδή το HIPAA και η αρχιτεκτονική ασφάλειας σχεδιάστηκαν από την αρχή, δεν βιδώθηκαν πάνω όταν τηλεφώνησε ο ελεγκτής.',

  /* --------------------------------- Τζος ----------------------------- */
  'Josh, out of Boston. Data science side, the MIT team.':
    'Τζος, από τη Βοστώνη. Πλευρά data science, η ομάδα του MIT.',
  'We work in H2O. Kitsos leads the software on that side, which means he is the one turning what we prove into something a hospital can actually run.':
    'Δουλεύουμε σε H2O. Ο Κίτσος ηγείται του λογισμικού σε εκείνη την πλευρά, που σημαίνει ότι είναι αυτός που μετατρέπει όσα αποδεικνύουμε σε κάτι που μπορεί πραγματικά να τρέξει ένα νοσοκομείο.',
  'That handoff is where most of these companies die. The model is beautiful in a notebook and then nobody can deploy it, or it deploys and nobody can explain it to a clinician.':
    'Σε αυτό το πέρασμα πεθαίνουν οι περισσότερες τέτοιες εταιρείες. Το μοντέλο είναι όμορφο σε ένα notebook και μετά κανείς δεν μπορεί να το κάνει deploy, ή γίνεται deploy και κανείς δεν μπορεί να το εξηγήσει σε έναν κλινικό γιατρό.',
  'He asks the right question, which is never "what accuracy did you get". It is "what happens to this the week the data looks different", and then he builds for that answer.':
    'Κάνει τη σωστή ερώτηση, που δεν είναι ποτέ «τι ακρίβεια πέτυχες». Είναι «τι γίνεται με αυτό την εβδομάδα που τα δεδομένα δείχνουν αλλιώς», και μετά χτίζει για εκείνη την απάντηση.',
  'He does not pretend to be a data scientist and he does not let us pretend to be engineers. Everybody is better off.':
    'Δεν προσποιείται τον data scientist και δεν μας αφήνει να προσποιούμαστε τους μηχανικούς. Όλοι βγαίνουν κερδισμένοι.',
  'Length of stay, scheduling, the analytics going into Epic — that is the pipeline from our side to the ward, and he owns the software half of it.':
    'Length of stay, προγραμματισμός βαρδιών, τα analytics που μπαίνουν στο Epic — αυτό είναι το pipeline από τη δική μας πλευρά ως τον θάλαμο, και εκείνος έχει το μισό κομμάτι του λογισμικού.',

  /* ------------------------------ Ms. Maria --------------------------- */
  'The trophy case, here in the hall. Quietly, please.':
    'Η προθήκη των επάθλων, εδώ στο χολ. Σιγά, σε παρακαλώ.',
  'Come in. The boy from my first class? Of course I remember him.':
    'Πέρνα. Το αγόρι από την πρώτη μου τάξη; Και βέβαια τον θυμάμαι.',
  'A charismatic child, and a good heart. That is the rarer half. Homework done every single day, and a hand up before I had finished the question.':
    'Χαρισματικό παιδί, και με καλή καρδιά. Αυτό είναι το πιο σπάνιο από τα δύο. Τα μαθήματα διαβασμένα κάθε μέρα, και το χέρι σηκωμένο πριν τελειώσω την ερώτηση.',
  'I wrote in his report that he would have a bright future. I do not write that often. I was right.':
    'Έγραψα στον έλεγχό του ότι θα έχει λαμπρό μέλλον. Δεν το γράφω συχνά. Είχα δίκιο.',
  'He captained the chess team to first place in the city tournament, and led the basketball team two years running, third in the local tournament.':
    'Ως αρχηγός οδήγησε την ομάδα σκακιού στην πρώτη θέση του τουρνουά της πόλης, και ηγήθηκε της ομάδας μπάσκετ δύο χρονιές στη σειρά, τρίτη στο τοπικό τουρνουά.',
  'Evangeliki is through the west door. The cabinet key is in the trophy case here in the hall, if that is what you came for.':
    'Η Ευαγγελική είναι από τη δυτική πόρτα. Το κλειδί της ντουλάπας είναι στην προθήκη των επάθλων εδώ στο χολ, αν γι’ αυτό ήρθες.',

  /* --------------------------- Evangeliki staff ----------------------- */
  'Not only an excellent student, first of his class every year, the prize of excellence every year, but truly responsible as class president.':
    'Όχι μόνο άριστος μαθητής, πρώτος της τάξης κάθε χρόνο, αριστείο κάθε χρόνο, αλλά και πραγματικά υπεύθυνος ως πρόεδρος της τάξης.',
  'Never in my career had a student handed me a report. Fifteen pages, on what his class had achieved in the year.':
    'Ποτέ στην καριέρα μου δεν μου είχε παραδώσει μαθητής απολογισμό. Δεκαπέντε σελίδες, για όσα είχε πετύχει η τάξη του μέσα στη χρονιά.',
  'And the accounts. By the letter of the law he returned every cent of the class money he had not needed. Do you know how rare that is? At that age?':
    'Και το ταμείο. Κατά γράμμα με τον νόμο, επέστρεψε κάθε ευρώ από τα χρήματα της τάξης που δεν χρειάστηκε. Ξέρεις πόσο σπάνιο είναι αυτό; Σε αυτή την ηλικία;',
  'He represented the school as well. When they asked me who should speak for us, I did not have to think.':
    'Εκπροσώπησε και το σχολείο. Όταν με ρώτησαν ποιος θα έπρεπε να μιλήσει για εμάς, δεν χρειάστηκε να το σκεφτώ.',
  'Robotics. That year the whole class built a submarine drone. It floated, it dived, it came back, mostly.':
    'Ρομποτική. Εκείνη τη χρονιά όλη η τάξη έφτιαξε ένα υποβρύχιο drone. Επέπλεε, βουτούσε, επέστρεφε, τις περισσότερες φορές.',
  'Kitsos built a proof-of-concept electric bicycle on his own. Twelve volts, a motor, a frame off the rack, and it moved. Truly remarkable, at that age.':
    'Ο Κίτσος έφτιαξε μόνος του ένα πρωτότυπο ηλεκτρικού ποδηλάτου. Δώδεκα βολτ, ένα μοτέρ, ένας σκελετός από το ράφι, και κινήθηκε. Πραγματικά αξιοσημείωτο, σε αυτή την ηλικία.',
  'That bicycle by the bench? That is the one.':
    'Το ποδήλατο δίπλα στον πάγκο; Αυτό είναι.',
  'Pascal, from the age of thirteen. He always loved programming, and he always wanted more of it.':
    'Pascal, από τα δεκατρία. Πάντα αγαπούσε τον προγραμματισμό, και πάντα ήθελε κι άλλο.',
  'Every extra exercise I set, he did, and then came back with small games of his own. With graphics, mind you, on these machines.':
    'Κάθε έξτρα άσκηση που έβαζα, την έλυνε, και μετά γύριζε με μικρά παιχνίδια δικά του. Με γραφικά, σημειωτέον, σε αυτά τα μηχανήματα.',
  'You can tell the ones who will do this for a living. They do not stop when the bell goes.':
    'Τους ξεχωρίζεις αυτούς που θα το κάνουν επάγγελμα. Δεν σταματούν όταν χτυπάει το κουδούνι.',
  'Stop studying and come play! Maths and physics, all the time!':
    'Άσε το διάβασμα κι έλα να παίξουμε! Μαθηματικά και φυσική, όλη την ώρα!',
  'Ask him about the chess team and you will be here until the bell.':
    'Ρώτα τον για την ομάδα σκακιού και θα κάτσεις εδώ μέχρι το κουδούνι.',
  'Fine. One more problem, mine this time. Get it right and I will tell you something about the jetty past the school.':
    'Καλά. Ένα πρόβλημα ακόμη, δικό μου αυτή τη φορά. Βρες το και θα σου πω κάτι για την προβλήτα πέρα από το σχολείο.',
  'Which of these contests did Kitsos never enter, or never win a prize in?':
    'Σε ποιον από αυτούς τους διαγωνισμούς ο Κίτσος δεν πήρε ποτέ μέρος, ή δεν πήρε ποτέ βραβείο;',
  Literature: 'Λογοτεχνία',
  Biology: 'Βιολογία',
  Philosophy: 'Φιλοσοφία',
  Drawing: 'Ζωγραφική',
  'Philosophy! Never went near it. Everything else on that list he had a go at, and mostly came back with something.':
    'Φιλοσοφία! Ποτέ δεν πλησίασε. Σε όλα τα άλλα της λίστας δοκίμασε, και τις περισσότερες φορές γύρισε με κάτι.',
  'So. The jetty on the west shore, out past the school. Walk to the very end of it and tap Space, the jump key, three times, quick, and he goes over the side and swims.':
    'Λοιπόν. Η προβλήτα στη δυτική ακτή, πέρα από το σχολείο. Περπάτα ως την άκρη της και πάτα Space, το πλήκτρο του άλματος, τρεις φορές, γρήγορα, και πέφτει από το πλάι και κολυμπάει.',
  'Do not tell Ms. Maria I told you.':
    'Μην πεις στην κυρία Μαρία ότι σου το είπα.',
  'Nope, he did that one. Go and read the honours board if you do not believe me.':
    'Όχι, σε αυτόν πήρε μέρος. Πήγαινε διάβασε τον πίνακα των διακρίσεων αν δεν με πιστεύεις.',
  'Come back when you have done your homework. Deal?':
    'Έλα ξανά όταν κάνεις τα μαθήματά σου. Σύμφωνοι;',

  /* ------------------------------- Ionidios --------------------------- */
  'Ms. Dimitra': 'Κυρία Δήμητρα',
  'Biology, Ionidios': 'Βιολογία, Ιωνίδειος',
  'Second among about one thousand six hundred and fifty, in the Panhellenic Biology Competition. I never once saw him revise for it.':
    'Δεύτερος ανάμεσα σε περίπου χίλιους εξακόσιους πενήντα, στον Πανελλήνιο Διαγωνισμό Βιολογίας. Ούτε μία φορά δεν τον είδα να διαβάζει γι’ αυτόν.',
  'I told him he should be a doctor. He told me biology was programming in organic matter: DNA is the source, the cell is the runtime, and evolution is a build that never finishes. I have not found the flaw in it yet.':
    'Του είπα ότι πρέπει να γίνει γιατρός. Μου είπε ότι η βιολογία είναι προγραμματισμός σε οργανική ύλη: το DNA είναι ο πηγαίος κώδικας, το κύτταρο το runtime, και η εξέλιξη ένα build που δεν τελειώνει ποτέ. Δεν έχω βρει ακόμη το λάθος.',
  'First in his class, year after year. I put that in a letter for a scholarship, and every word of it was true.':
    'Πρώτος στο τμήμα του, χρόνο με τον χρόνο. Το έγραψα σε μια επιστολή για υποτροφία, και κάθε λέξη της ήταν αληθινή.',
  'Excellent in Biology without trying. That is the part I still find unfair.':
    'Άριστος στη Βιολογία χωρίς να προσπαθεί. Αυτό είναι το κομμάτι που ακόμη το βρίσκω άδικο.',
  'Programming in organic matter': 'Προγραμματισμός σε οργανική ύλη',
  'Ms. Dimitra, his biology teacher at Ionidios: 2nd of about 1,650 in the Panhellenic Biology Competition without seeming to try, and told he should be a doctor. He answered that biology was programming in organic matter.':
    'Η κυρία Δήμητρα, η καθηγήτριά του στη Βιολογία στην Ιωνίδειο: 2ος σε περίπου 1.650 στον Πανελλήνιο Διαγωνισμό Βιολογίας χωρίς να φαίνεται να προσπαθεί, και του είπαν ότι πρέπει να γίνει γιατρός. Απάντησε ότι η βιολογία είναι προγραμματισμός σε οργανική ύλη.',
  'Mr. Nikos': 'Κύριος Νίκος',
  'Physics, Ionidios': 'Φυσική, Ιωνίδειος',
  'General physics and science-stream physics, both years. Excellent throughout. I wrote that on a scholarship form, and I do not hand the word out.':
    'Φυσική γενικής παιδείας και κατεύθυνσης, και τις δύο χρονιές. Άριστος σε όλη τη διάρκεια, το έγραψα σε έντυπο υποτροφίας, και τη λέξη αυτή δεν τη μοιράζω.',
  'He captained our EUSO team: the science olympiad where three of you share one bench of experiments and a problem that changes the moment you touch it. He kept the bench calm.':
    'Ήταν αρχηγός της ομάδας μας στη EUSO: την ολυμπιάδα φυσικών επιστημών όπου τρεις μοιράζεστε έναν πάγκο πειραμάτων και ένα πρόβλημα που αλλάζει μόλις το ακουμπήσεις. Κρατούσε τον πάγκο ήρεμο.',
  'Every event, competition and presentation this school put on, he was in it. And he argued well: a very good conversationalist, with clear arguments and a sense of humour. You need one, in physics.':
    'Σε κάθε εκδήλωση, διαγωνισμό και παρουσίαση που έκανε αυτό το σχολείο, ήταν μέσα. Και επιχειρηματολογούσε καλά: πολύ καλός συνομιλητής, με ξεκάθαρα επιχειρήματα και χιούμορ. Το χρειάζεσαι, στη φυσική.',
  'The EUSO bench': 'Ο πάγκος της EUSO',
  'Mr. Nikos, his physics teacher at Ionidios: excellent in both lyceum years, captain of the school’s EUSO science-experiments team, in every event the school ran, and, in his own words on the form, a pleasant personality with a particular sense of humour.':
    'Ο κύριος Νίκος, ο καθηγητής του στη Φυσική στην Ιωνίδειο: άριστος και τις δύο χρονιές του Λυκείου, αρχηγός της ομάδας πειραμάτων EUSO του σχολείου, σε κάθε εκδήλωση του σχολείου, και, με τα δικά του λόγια στο έντυπο, ευχάριστη προσωπικότητα με ιδιαίτερο χιούμορ.',
  'Mr. Panagiotis': 'Κύριος Παναγιώτης',
  'Informatics, Ionidios': 'Πληροφορική, Ιωνίδειος',
  'Top of the class in Informatics, and by sixteen he had left the syllabus behind. He was teaching himself C++ while the rest were still drawing flowcharts.':
    'Πρώτος της τάξης στην Πληροφορική, και στα δεκαέξι είχε αφήσει πίσω του την ύλη. Μάθαινε μόνος του C++ όσο οι υπόλοιποι σχεδίαζαν ακόμη διαγράμματα ροής.',
  'I put him forward for the Summer School of the University of Piraeus. He went. He came back asking for harder problems.':
    'Τον πρότεινα για το Θερινό Σχολείο του Πανεπιστημίου Πειραιώς. Πήγε. Γύρισε ζητώντας πιο δύσκολα προβλήματα.',
  'The awards in Programming and Mathematics are on the board. I would have been surprised by anything less.':
    'Τα βραβεία σε Προγραμματισμό και Μαθηματικά είναι στον πίνακα. Οτιδήποτε λιγότερο θα με είχε εκπλήξει.',
  'C++ at sixteen': 'C++ στα δεκαέξι',
  'Mr. Panagiotis, his informatics teacher at Ionidios: top student, teaching himself C++ from sixteen, and sent to the Summer School of the University of Piraeus on his recommendation.':
    'Ο κύριος Παναγιώτης, ο καθηγητής του στην Πληροφορική στην Ιωνίδειο: πρώτος μαθητής, μάθαινε μόνος του C++ από τα δεκαέξι, και στάλθηκε στο Θερινό Σχολείο του Πανεπιστημίου Πειραιώς με δική του σύσταση.',
  Angelica: 'Αντζέλικα',
  'If something in this school was broken, nobody called the caretaker. You waited for Kitsos to notice it.':
    'Αν κάτι σε αυτό το σχολείο ήταν σπασμένο, κανείς δεν φώναζε τον επιστάτη. Περίμενες να το προσέξει ο Κίτσος.',
  'The projector, the tap in the lab, the chair with three legs. He would have it open on the floor before the teacher had finished sighing.':
    'Ο προτζέκτορας, η βρύση στο εργαστήριο, η καρέκλα με τα τρία πόδια. Το είχε ανοιχτό στο πάτωμα πριν τελειώσει ο καθηγητής τον αναστεναγμό του.',
  'First in the class, and still the one you wanted next to you on a bad day. Do not tell him I said either of those.':
    'Πρώτος της τάξης, και παρ’ όλα αυτά εκείνος που ήθελες δίπλα σου σε μια κακή μέρα. Μην του πεις ότι είπα κανένα από τα δύο.',
  'The one who fixed things': 'Αυτός που έφτιαχνε τα πράγματα',
  'Angelica, his classmate at Ionidios: whatever broke in the school, he had it open on the floor before anyone had called the caretaker, and he was the one you wanted beside you on a bad day.':
    'Η Αντζέλικα, συμμαθήτριά του στην Ιωνίδειο: ό,τι χαλούσε στο σχολείο, το είχε ανοιχτό στο πάτωμα πριν φωνάξει κανείς τον επιστάτη, και ήταν εκείνος που ήθελες δίπλα σου σε μια κακή μέρα.',
  'Three taps off the jetty': 'Τρία πατήματα από την προβλήτα',
  'Sotiris’s tip, for a right answer: from the end of the jetty past the school, three quick taps of the jump key take him over the side and into the sea, and he swims.':
    'Η συμβουλή του Σωτήρη, για μια σωστή απάντηση: από την άκρη της προβλήτας πέρα από το σχολείο, τρία γρήγορα πατήματα του πλήκτρου άλματος τον ρίχνουν από το πλάι στη θάλασσα, και κολυμπάει.',

  /* ------------------------------- Stelios ---------------------------- */
  'Easy. The district is shut. Nobody goes in after hours.':
    'Σιγά. Η συνοικία είναι κλειστή. Μετά το ωράριο δεν μπαίνει κανείς.',
  'Unless… did production fall over at midnight? Is that what has you out here?':
    'Εκτός αν… έπεσε η παραγωγή τα μεσάνυχτα; Γι’ αυτό βρέθηκες εδώ έξω;',
  'Because it has not. Not once. Not one page in the small hours the whole time I have had this gate. It would be a first.':
    'Γιατί δεν έπεσε. Ούτε μία φορά. Ούτε μία κλήση τις μικρές ώρες σε όλο το διάστημα που κρατάω αυτή την πύλη. Θα ήταν πρωτιά.',
  'Mind you, Kitsos kept those hours anyway. University years worst of all: in before the sun, still at it long after. Nothing was paging him. He just did not stop.':
    'Βέβαια, ο Κίτσος τέτοιες ώρες έκανε ούτως ή άλλως. Τα φοιτητικά χρόνια ήταν τα χειρότερα: μέσα πριν βγει ο ήλιος, ακόμη εκεί πολύ αφού είχε δύσει. Κανείς δεν τον καλούσε. Απλώς δεν σταματούσε.',

  /* --------------------------- Sergeant Manolis ----------------------- */
  'Halt. Stop where you are. You are already closer than I let anyone get.':
    'Αλτ. Στάσου εκεί που είσαι. Είσαι ήδη πιο κοντά απ’ όσο αφήνω οποιονδήποτε.',
  'The camp is sealed until reveille. Nothing goes in, nothing comes out, and no, there is no exception being made tonight.':
    'Το στρατόπεδο είναι σφραγισμένο μέχρι το εγερτήριο. Τίποτα δεν μπαίνει, τίποτα δεν βγαίνει, και όχι, απόψε δεν γίνεται εξαίρεση.',
  'Do not take it personally. That is the whole of the job: somebody stays awake so that everybody else can sleep.':
    'Μην το πάρεις προσωπικά. Αυτή είναι όλη κι όλη η δουλειά: κάποιος μένει ξύπνιος για να μπορούν όλοι οι άλλοι να κοιμηθούν.',
  'The Lieutenant understood that better than most of them. At the Infantry Reserve Officers School they made him cadet company leader, and he slept last and woke first, every night of it.':
    'Ο Ανθυπολοχαγός το καταλάβαινε καλύτερα από τους περισσότερους. Στη Σχολή Εφέδρων Αξιωματικών Πεζικού τον έκαναν επικεφαλής του λόχου των δοκίμων, και κοιμόταν τελευταίος και ξυπνούσε πρώτος, κάθε βράδυ.',
  'So that when his company woke up he was already standing there, ready. Come back at first light and you can walk straight in.':
    'Ώστε όταν ξυπνούσε ο λόχος του να στέκεται ήδη εκεί, έτοιμος. Έλα ξανά με το πρώτο φως και θα περάσεις κατευθείαν.',

  /* ---------------------------- Private Fotis ------------------------- */
  'Back. You do not cross this line.': 'Πίσω. Αυτή τη γραμμή δεν την περνάς.',
  'Nothing goes in and nothing comes out. The sergeant will give you the reason; my job is the line.':
    'Τίποτα δεν μπαίνει και τίποτα δεν βγαίνει. Τον λόγο θα σου τον πει ο λοχίας· η δική μου δουλειά είναι η γραμμή.',
  'Push it again and we do this the other way. This post is mine until four and nobody has walked past it yet.':
    'Επίμεινε ξανά και το κάνουμε αλλιώς. Αυτό το πόστο είναι δικό μου μέχρι τις τέσσερις και κανείς δεν το έχει περάσει ακόμη.',

  /* -------------------------------- Sofia ----------------------------- */
  'Radio Center, Sofia speaking. Signal is strong today.':
    'Ραδιοφωνικό Κέντρο, η Σοφία στο ακουστικό. Το σήμα είναι δυνατό σήμερα.',
  'Two open channels, email and LinkedIn, plus the message desk right here.':
    'Δύο ανοιχτά κανάλια, email και LinkedIn, και το γραφείο μηνυμάτων εδώ.',
  'Step up to the console and pick one. Everything goes straight to Kitsos; there is no operator in between.':
    'Πλησίασε την κονσόλα και διάλεξε. Όλα πάνε κατευθείαν στον Κίτσο· δεν μεσολαβεί κανένας χειριστής.',

  /* ------------------------------ Road signs -------------------------- */
  'KITSOS TOWN: Town Plaza. Seven roads leave this square, and not one of them is named after where it goes.':
    'ΠΟΛΗ ΤΟΥ ΚΙΤΣΟΥ: Κεντρική Πλατεία. Επτά δρόμοι φεύγουν από εδώ, και κανένας τους δεν πήρε το όνομά του από το πού πάει.',
  'North, Motivation Road, to the Polytechnic. East, Discipline Road, to the Work District. West, Curiosity Road, to the Town School.':
    'Βόρεια, η Οδός Κινήτρου, προς το Πολυτεχνείο. Ανατολικά, η Οδός Πειθαρχίας, προς τη Συνοικία Εργασίας. Δυτικά, η Οδός Περιέργειας, προς το Σχολείο της Πόλης.',
  'South-west, Caring Road, to Kitsos House. South-east, Leadership Road, to the Army Camp. Due south, Collaboration Road, to the Radio Center.':
    'Νοτιοδυτικά, η Οδός Φροντίδας, προς το Σπίτι του Κίτσου. Νοτιοανατολικά, η Οδός Ηγεσίας, προς το Στρατόπεδο. Κατευθείαν νότια, η Οδός Συνεργασίας, προς το Ραδιοφωνικό Κέντρο.',
  'And north-west out to the cape: Freedom Road, and the Old Lighthouse at the end of it. Locked.':
    'Και βορειοδυτικά προς το ακρωτήρι: η Οδός Ελευθερίας, και ο Παλιός Φάρος στο τέρμα της. Κλειδωμένος.',
  'They are named for what he carried out of each of them. Press M for the map, J for the journal.':
    'Πήραν το όνομά τους από αυτό που κουβάλησε από τον καθένα. Πάτα M για τον χάρτη, J για το ημερολόγιο.',
  'MOTIVATION ROAD: the Polytechnic, straight on. Mind the bicycles.':
    'ΟΔΟΣ ΚΙΝΗΤΡΟΥ: το Πολυτεχνείο, ευθεία. Πρόσεχε τα ποδήλατα.',
  'Electrical & Computer Engineering, and the lecture hall behind it.':
    'Ηλεκτρολόγοι Μηχανικοί & Μηχανικοί Υπολογιστών, και το αμφιθέατρο από πίσω.',
  'Five years of it. Nobody made him finish; that is rather the point of the name.':
    'Πέντε χρόνια. Κανείς δεν τον ανάγκασε να τελειώσει· αυτό ακριβώς σημαίνει το όνομα.',
  'DISCIPLINE ROAD: the Work District. Veltiston.AI and IBM Consulting.':
    'ΟΔΟΣ ΠΕΙΘΑΡΧΙΑΣ: η Συνοικία Εργασίας. Veltiston.AI και IBM Consulting.',
  'Deploys on Thursdays. Coffee is free, the incidents are not.':
    'Deploy κάθε Πέμπτη. Ο καφές είναι δωρεάν, τα περιστατικά όχι.',
  'Shipping the same standard on a bad week as on a good one is the whole trick.':
    'Το να βγάζεις την ίδια ποιότητα μια κακή βδομάδα όπως και μια καλή. Αυτό είναι όλο το κόλπο.',
  'CURIOSITY ROAD: the Town School, where the whole thing started.':
    'ΟΔΟΣ ΠΕΡΙΕΡΓΕΙΑΣ: το Σχολείο της Πόλης, εκεί όπου ξεκίνησαν όλα.',
  'Carry on past the school for the west beach and the dock.':
    'Συνέχισε πέρα από το σχολείο για τη δυτική παραλία και την προβλήτα.',
  'Everything after this road is just the same question asked louder.':
    'Όλα όσα ήρθαν μετά από αυτόν τον δρόμο είναι η ίδια ερώτηση, ρωτημένη πιο δυνατά.',
  'FREEDOM ROAD: the north-west cape, and the Old Lighthouse on the end of it.':
    'ΟΔΟΣ ΕΛΕΥΘΕΡΙΑΣ: το βορειοδυτικό ακρωτήρι, και ο Παλιός Φάρος στην άκρη του.',
  'The door has five locks. One key waits in each district building.':
    'Η πόρτα έχει πέντε κλειδαριές. Ένα κλειδί περιμένει σε κάθε κτίριο συνοικίας.',
  'Nobody has opened it in years. Be the one who does.':
    'Χρόνια έχει να τον ανοίξει κανείς. Γίνε εσύ αυτός που θα το κάνει.',
  'COLLABORATION ROAD: the Radio Center, straight ahead. Follow the antenna.':
    'ΟΔΟΣ ΣΥΝΕΡΓΑΣΙΑΣ: το Ραδιοφωνικό Κέντρο, ευθεία μπροστά. Ακολούθησε την κεραία.',
  'Open to recruiters, collaborators and old friends alike.':
    'Ανοιχτό σε recruiters, συνεργάτες και παλιούς φίλους το ίδιο.',
  'Nothing worth building on this island was built by one person.':
    'Τίποτα που άξιζε να χτιστεί σε αυτό το νησί δεν χτίστηκε από έναν άνθρωπο.',
  'CARING ROAD: Kitsos House, south-west. Ms. Stella is usually on the step.':
    'ΟΔΟΣ ΦΡΟΝΤΙΔΑΣ: το Σπίτι του Κίτσου, νοτιοδυτικά. Η κυρία Στέλλα είναι συνήθως στο σκαλί.',
  'Home, and the people who made it one. Volunteering, the Foundation, the blood bank.':
    'Το σπίτι, και οι άνθρωποι που το έκαναν σπίτι. Ο εθελοντισμός, το Ίδρυμα, η τράπεζα αίματος.',
  'Everything on this road he does for nothing, which is how you know he means it.':
    'Ό,τι κάνει σε αυτόν τον δρόμο το κάνει χωρίς αντάλλαγμα, και έτσι ξέρεις ότι το εννοεί.',
  'LEADERSHIP ROAD: the Army Camp, south-east. Ask for Sergeant Petros.':
    'ΟΔΟΣ ΗΓΕΣΙΑΣ: το Στρατόπεδο, νοτιοανατολικά. Ζήτα τον λοχία Πέτρο.',
  'Marine Battalion, reserve. Platoon Leader and Weapons Officer.':
    'Τάγμα Πεζοναυτών, έφεδρος. Διμοιρίτης και Αξιωματικός Οπλισμού.',
  /* ------------------------- Mission hints ---------------------------- */

  'Server rack, back wall. Do not touch anything blinking.':
    'Το ράφι των διακομιστών, πίσω τοίχος. Μην αγγίξεις ό,τι αναβοσβήνει.',
  'The thesis display, past the lectern. Mind the cables.':
    'Η προθήκη της διπλωματικής, μετά το αναλόγιο. Πρόσεχε τα καλώδια.',

  /* ------------------------ The radio beacon -------------------------- */

  'Everything here belongs to Kitsos Orfanopoulos, a senior full stack engineer and technical lead out of Athens, Greece.':
    'Όλα εδώ ανήκουν στον Κίτσο Ορφανόπουλο, senior full stack μηχανικό και τεχνικό υπεύθυνο, από την Αθήνα.',
  'Reach Kitsos at kitsorfan@protonmail.com or linkedin.com/in/kitsorfan.':
    'Βρες τον Κίτσο στο kitsorfan@protonmail.com ή στο linkedin.com/in/kitsorfan.',

  'He slept last and woke first. Nobody on this road had to be told twice.':
    'Κοιμόταν τελευταίος και ξυπνούσε πρώτος. Σε αυτόν τον δρόμο κανείς δεν χρειάστηκε να του πουν κάτι δεύτερη φορά.',

  /* ------------------------- Off the jetty ---------------------------- */

  'Off the end of the jetty': 'Από την άκρη της προβλήτας',
  'Two hops on the planks and the third one over the side. The water is colder than it looks, the whole coast is yours to swim, and any beach will take you back.':
    'Δύο αναπηδήσεις στα σανίδια και η τρίτη σε ρίχνει στο νερό. Είναι πιο κρύο απ’ ό,τι δείχνει, όλη η ακτή είναι δική σου για κολύμπι, και όποια παραλία θέλεις σε βγάζει πάλι στη στεριά.',
}
