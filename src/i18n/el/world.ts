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
  'Marine Special Forces — reserve': 'Πεζοναύτες — έφεδρος',
  'Town School': 'Το Σχολείο της Πόλης',
  School: 'Σχολείο',
  'Where it all started': 'Εκεί όπου ξεκίνησαν όλα',
  'Radio Center': 'Ραδιοφωνικό Κέντρο',
  Radio: 'Ραδιόφωνο',
  'Broadcast a message to Kitsos': 'Στείλε μήνυμα στον Κίτσο',
  Lighthouse: 'Φάρος',
  'Sealed — five district keys open it':
    'Σφραγισμένος — τον ανοίγουν πέντε κλειδιά των συνοικιών',

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
  'Kyria Voula says the spare is on the shelf beside the chessboard, inside the house.':
    'Η κυρία Βούλα λέει ότι το εφεδρικό είναι στο ράφι δίπλα στη σκακιέρα, μέσα στο σπίτι.',
  'Brass Key taken from the shelf by the chessboard.':
    'Το Μπρούτζινο Κλειδί πάρθηκε από το ράφι δίπλα στη σκακιέρα.',
  'Thesis defence': 'Υποστήριξη διπλωματικής',
  'The Academy keeps its keys somewhere behind the lectern.':
    'Η Σχολή κρατάει τα κλειδιά της κάπου πίσω από την έδρα.',
  'Prof. Nikolaos left the lecture hall key on the thesis display, past the lectern.':
    'Ο καθηγητής Νικόλαος άφησε το κλειδί του αμφιθεάτρου στην προθήκη της διπλωματικής, πίσω από την έδρα.',
  'Lecture Hall Key collected from the thesis display.':
    'Το Κλειδί του Αμφιθεάτρου πάρθηκε από την προθήκη της διπλωματικής.',
  'Production access': 'Πρόσβαση στην παραγωγή',
  'Nobody gets into the server room without asking first.':
    'Κανείς δεν μπαίνει στη μηχανογράφηση χωρίς να ρωτήσει πρώτα.',
  'Anna says the server room key hangs on the rack at the back of the office floor.':
    'Η Άννα λέει ότι το κλειδί της μηχανογράφησης κρέμεται στο rack στο βάθος του ορόφου.',
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
  'Ms. Maria keeps the cabinet key in the trophy case beside the blackboard.':
    'Η κυρία Μαρία κρατάει το κλειδί της ντουλάπας στην προθήκη των επάθλων δίπλα στον πίνακα.',
  'Cabinet Key found in the trophy case.':
    'Το Κλειδί της Ντουλάπας βρέθηκε στην προθήκη των επάθλων.',

  /* ------------------------------ Islanders --------------------------- */
  'Mayor Kostas': 'Δήμαρχος Κώστας',
  'Kitsos Town': 'Η Πόλη του Κίτσου',
  Eleni: 'Ελένη',
  'Volunteer coordinator': 'Υπεύθυνη εθελοντισμού',
  Grigoris: 'Γρηγόρης',
  'Park regular': 'Θαμώνας του πάρκου',
  Thanasis: 'Θανάσης',
  Townsfolk: 'Κάτοικοι',
  Despina: 'Δέσποινα',
  Nikos: 'Νίκος',
  'Coastal path': 'Παραλιακό μονοπάτι',
  'Captain Yannis': 'Καπετάν Γιάννης',
  'The dock': 'Η προβλήτα',
  'Kyria Voula': 'Κυρία Βούλα',
  Neighbour: 'Γειτόνισσα',
  Marina: 'Μαρίνα',
  'Student council': 'Φοιτητικό συμβούλιο',
  Alex: 'Άλεξ',
  'Robotics club': 'Όμιλος ρομποτικής',
  'Sergeant Petros': 'Λοχίας Πέτρος',
  'Prof. Nikolaos': 'Καθηγητής Νικόλαος',
  'Dr. Fotini': 'Δρ. Φωτεινή',
  'Academy labs': 'Εργαστήρια της Σχολής',
  Anna: 'Άννα',
  'Veltiston.AI': 'Veltiston.AI',
  Youssef: 'Γιουσέφ',
  'Engineer, Veltiston.AI': 'Μηχανικός, Veltiston.AI',
  Thodoris: 'Θοδωρής',
  'Platform architect': 'Αρχιτέκτονας πλατφόρμας',
  Dimitris: 'Δημήτρης',
  'Dev(Sec)Ops, IBM': 'Dev(Sec)Ops, IBM',
  'Ms. Maria': 'Κυρία Μαρία',
  Stelios: 'Στέλιος',
  'Night watch, Work District': 'Νυχτοφύλακας, Συνοικία Εργασίας',
  'Sergeant Manolis': 'Λοχίας Μανώλης',
  'Guard commander, Army Camp': 'Αρχιφύλακας, Στρατόπεδο',
  'Private Fotis': 'Στρατιώτης Φώτης',
  'Sentry, Army Camp': 'Σκοπός, Στρατόπεδο',
  Sofia: 'Σοφία',
  'Town Plaza': 'Κεντρική Πλατεία',

  /* -------------------------------- Roads ----------------------------- */
  'Motivation Road': 'Οδός Κινήτρου',
  'Discipline Road': 'Οδός Πειθαρχίας',
  'Curiosity Road': 'Οδός Περιέργειας',
  'Freedom Road': 'Οδός Ελευθερίας',
  'Collaboration Road': 'Οδός Συνεργασίας',
  'Caring Road': 'Οδός Φροντίδας',
  'Leadership Road': 'Οδός Ηγεσίας',

  /* --------------------------- Journal entries ------------------------ */
  'Welcome to Kitsos Town': 'Καλώς ήρθες στην Πόλη του Κίτσου',
  'Christos "Kitsos" Orfanopoulos — Senior Full Stack Software Engineer & Technical Lead, based in Athens, Greece. Five keys, one per district, open the Old Lighthouse on the north-west cape.':
    'Χρήστος «Κίτσος» Ορφανόπουλος — Senior Full Stack Software Engineer & Technical Lead, με έδρα την Αθήνα. Πέντε κλειδιά, ένα ανά συνοικία, ανοίγουν τον Παλιό Φάρο στο βορειοδυτικό ακρωτήρι.',
  Volunteering: 'Εθελοντισμός',
  'Leading volunteer (2017–2021, 2023–today) and Director (2021–2022) at the Christian Youth Foundation "Pantokrator", Paleo Faliro. Blood donor since 2017.':
    'Επικεφαλής εθελοντής (2017–2021, 2023–σήμερα) και Διευθυντής (2021–2022) στο Χριστιανικό Ίδρυμα Νεότητας «Παντοκράτωρ», Παλαιό Φάληρο. Αιμοδότης από το 2017.',
  Hobbies: 'Ενδιαφέροντα',
  'Running, cycling, theater, DIY and handiwork at home, chess, hiking and camping.':
    'Τρέξιμο, ποδήλατο, θέατρο, μαστορέματα στο σπίτι, σκάκι, πεζοπορία και κάμπινγκ.',
  'Coastal loop': 'Ο παραλιακός γύρος',
  'Runs and cycles the island loop — the thinking happens somewhere around kilometre six.':
    'Τρέχει και κάνει ποδήλατο τον γύρο του νησιού — η σκέψη γίνεται κάπου στο έκτο χιλιόμετρο.',
  'Based in Athens': 'Με έδρα την Αθήνα',
  'Lives and works in Athens, Greece — Greek nationality, open to conversations that start with a message.':
    'Ζει και εργάζεται στην Αθήνα — Έλληνας υπήκοος, ανοιχτός σε συζητήσεις που ξεκινούν με ένα μήνυμα.',
  'Profile & languages': 'Προφίλ & γλώσσες',
  'Athens, Greece · Greek nationality. Greek (native), English (proficiency — ECPE, University of Michigan 2016), French (B2 — DELF 2019).':
    'Αθήνα · Έλληνας υπήκοος. Ελληνικά (μητρική), Αγγλικά (άριστα — ECPE, University of Michigan 2016), Γαλλικά (B2 — DELF 2019).',
  'Student representation': 'Φοιτητική εκπροσώπηση',
  'Students’ representative and leader of the Independent ECE Students — e-voting, depoliticization of the university, realistic and democratic problem-solving.':
    'Εκπρόσωπος φοιτητών και επικεφαλής των Ανεξάρτητων Φοιτητών ΗΜΜΥ — ηλεκτρονική ψηφοφορία, απο-κομματικοποίηση του πανεπιστημίου, ρεαλιστική και δημοκρατική επίλυση προβλημάτων.',
  'Teaching robotics': 'Διδασκαλία ρομποτικής',
  'Children’s tutor in Robotics at Citylab, Alimos — 2020–2021.':
    'Εκπαιδευτής παιδιών στη Ρομποτική στο Citylab, Άλιμος — 2020–2021.',
  'Military service': 'Στρατιωτική θητεία',
  'Reservist Second Lieutenant, Marine Battalion, September 2022 – November 2023. Special Forces basic training at Nea Peramos; graduated 3rd in class from the Infantry Reserve Officers School, Heraklion; completed the Rangers’ Guerilla Warfare School at Rentina; served as Deputy Company Commander and Weapons Officer.':
    'Έφεδρος Ανθυπολοχαγός, Τάγμα Πεζοναυτών, Σεπτέμβριος 2022 – Νοέμβριος 2023. Βασική εκπαίδευση Ειδικών Δυνάμεων στη Νέα Πέραμο· αποφοίτησε 3ος της σειράς του από τη ΣΕΑΠ Ηρακλείου· ολοκλήρωσε το Σχολείο Ανταρτοπολέμου (Rangers) στη Ρεντίνα· υπηρέτησε ως Υποδιοικητής Λόχου και Αξιωματικός Οπλισμού.',
  'NTUA — MEng ECE': 'ΕΜΠ — Δίπλωμα ΗΜΜΥ',
  'National Technical University of Athens, School of Electrical and Computer Engineering, MEng 2017–2022, GPA 8.4. Thesis: movement compliance application using machine learning.':
    'Εθνικό Μετσόβιο Πολυτεχνείο, Σχολή Ηλεκτρολόγων Μηχανικών και Μηχανικών Υπολογιστών, Δίπλωμα 2017–2022, βαθμός 8,4. Διπλωματική: εφαρμογή συμμόρφωσης κίνησης με μηχανική μάθηση.',
  'Seminars & contests': 'Σεμινάρια & διαγωνισμοί',
  'IBM graduate program (2024), Agile bootcamp in Hamburg (2024), Arduino IEEE Workshop at NTUA (2018). 2nd in the National Biology Competition (2016) and awards in Physics, Mathematics, Informatics and Literature. Volunteer at European Researchers’ Night (2019) and 100 years of ECE (2017).':
    'Πρόγραμμα αποφοίτων IBM (2024), Agile bootcamp στο Αμβούργο (2024), Arduino IEEE Workshop στο ΕΜΠ (2018). 2ος στον Πανελλήνιο Διαγωνισμό Βιολογίας (2016) και διακρίσεις σε Φυσική, Μαθηματικά, Πληροφορική και Λογοτεχνία. Εθελοντής στη Βραδιά του Ερευνητή (2019) και στα 100 χρόνια ΗΜΜΥ (2017).',
  'Veltiston AI — Senior Engineer': 'Veltiston AI — Senior Engineer',
  'At Veltiston AI since May 2024: full-stack engineer, then Senior Software Engineer from May 2026 and project lead on three projects. Technical Lead of the Nurse Scheduling platform — Java, Spring Boot, React, MySQL, AWS — live in four major U.S. hospitals. Also Lead Software Engineer on contract for Holistic Hospital Optimization.':
    'Στη Veltiston AI από τον Μάιο του 2024: full-stack μηχανικός, μετά Senior Software Engineer από τον Μάιο του 2026 και υπεύθυνος σε τρία έργα. Technical Lead της πλατφόρμας Nurse Scheduling — Java, Spring Boot, React, MySQL, AWS — σε παραγωγή σε τέσσερα μεγάλα νοσοκομεία των ΗΠΑ. Επίσης Lead Software Engineer σε σύμβαση για το Holistic Hospital Optimization.',
  Leadership: 'Ηγεσία',
  'Leads cross-functional teams of 5–10 developers across Greece, Boston and Morocco. Drives architecture, delivery, code reviews and sprint planning; leads technical interviews, mentoring and onboarding. Modernized a legacy Java/Angular application with Agile process, standards, CI/CD and incremental refactoring.':
    'Ηγείται διαλειτουργικών ομάδων 5–10 προγραμματιστών σε Ελλάδα, Βοστώνη και Μαρόκο. Οδηγεί αρχιτεκτονική, παράδοση, code reviews και sprint planning· διεξάγει τεχνικές συνεντεύξεις, καθοδήγηση και onboarding. Εκσυγχρόνισε μια παλαιά εφαρμογή Java/Angular με Agile διαδικασία, πρότυπα, CI/CD και σταδιακό refactoring.',
  'Platform capabilities': 'Δυνατότητες της πλατφόρμας',
  'Spring AI documentation assistant (RAG + agentic AI), a SMART on FHIR app embedded in Epic EHR, a Length of Stay analytics plugin, UKG integration, SAML 2.0 SSO via Microsoft ADFS, a secure notification framework, audit logging, and Jira-integrated ticketing with reCAPTCHA.':
    'Βοηθός τεκμηρίωσης σε Spring AI (RAG + agentic AI), εφαρμογή SMART on FHIR ενσωματωμένη στο Epic EHR, plugin αναλυτικής Length of Stay, ενσωμάτωση UKG, SSO με SAML 2.0 μέσω Microsoft ADFS, ασφαλές framework ειδοποιήσεων, audit logging και σύστημα αιτημάτων με Jira και reCAPTCHA.',
  'IBM — DevOps Engineer': 'IBM — DevOps Engineer',
  'November 2023 – May 2024, via the IBM Associate Program. Cosmos Project at the National Bank of Greece: legacy PL/I and COBOL to Infosys Finacle, integration architecture for coexistence and target states, CI/CD automation with Jenkins, Podman, ELK and Grafana. Represented IBM Greece at an Agile bootcamp in Hamburg.':
    'Νοέμβριος 2023 – Μάιος 2024, μέσω του IBM Associate Program. Έργο Cosmos στην Εθνική Τράπεζα της Ελλάδος: μετάβαση από PL/I και COBOL στο Infosys Finacle, αρχιτεκτονική ενσωμάτωσης για το μεταβατικό και το τελικό στάδιο, αυτοματοποίηση CI/CD με Jenkins, Podman, ELK και Grafana. Εκπροσώπησε την IBM Ελλάδος σε Agile bootcamp στο Αμβούργο.',
  Schooling: 'Σχολικά χρόνια',
  'Model High School of Ionidios, Piraeus (2015–2017, GPA 19.9). Model Experimental High School of Evaggeliki, Nea Smyrni (2011–2015) — ranked 1st in the 2014 admission exam.':
    'Πρότυπο Λύκειο Ιωνιδείου Πειραιά (2015–2017, βαθμός 19,9). Πρότυπο Πειραματικό Γυμνάσιο Ευαγγελικής Σχολής Νέας Σμύρνης (2011–2015) — 1ος στις εξετάσεις εισαγωγής του 2014.',

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
  'And north-west, Freedom Road, out to the Old Lighthouse on the cape. Sealed for years. Five district keys open it — one hidden in each building.':
    'Και βορειοδυτικά, η Οδός Ελευθερίας, μέχρι τον Παλιό Φάρο στο ακρωτήρι. Σφραγισμένος χρόνια. Τον ανοίγουν πέντε κλειδιά των συνοικιών — ένα κρυμμένο σε κάθε κτίριο.',
  'Press M for the map if the walk gets long. Once you have found a place, you can travel straight back to it.':
    'Πάτα M για τον χάρτη αν σου φανεί μακρύς ο δρόμος. Μόλις βρεις ένα μέρος, μπορείς να πας κατευθείαν ξανά εκεί.',

  /* ------------------------------- Eleni ------------------------------ */
  'Kitsos? He has been around this tent since 2017.':
    'Ο Κίτσος; Τριγυρνάει σε αυτή τη σκηνή από το 2017.',
  'Leading volunteer at the Christian Youth Foundation "Pantokrator" in Paleo Faliro — 2017 to 2021, then again from 2023 to today.':
    'Επικεφαλής εθελοντής στο Χριστιανικό Ίδρυμα Νεότητας «Παντοκράτωρ» στο Παλαιό Φάληρο — από το 2017 ως το 2021, και ξανά από το 2023 ως σήμερα.',
  'He even ran the place. Director from February 2021 to September 2022, appointed by the council while he was still finishing his degree.':
    'Το διηύθυνε κιόλας. Διευθυντής από τον Φεβρουάριο του 2021 ως τον Σεπτέμβριο του 2022, διορισμένος από το συμβούλιο ενώ τελείωνε ακόμη τη σχολή του.',
  'Staff, volunteers, the buildings, the books, the grant applications. Events, field trips, tree planting, donation drives, prison visits.':
    'Προσωπικό, εθελοντές, τα κτίρια, τα λογιστικά, οι αιτήσεις χρηματοδότησης. Εκδηλώσεις, εκδρομές, δενδροφυτεύσεις, συγκεντρώσεις προσφορών, επισκέψεις σε φυλακές.',
  'When the lockdowns hit he put the whole programme on a live stream so the children would not lose it.':
    'Όταν ήρθαν τα lockdown, έβαλε όλο το πρόγραμμα σε ζωντανή μετάδοση για να μην το χάσουν τα παιδιά.',
  'The Vice-President — a retired Supreme Court judge, mind you — wrote it all down in a letter. It is up at the school.':
    'Ο αντιπρόεδρος — αρεοπαγίτης εν αποστρατεία, σημείωσε — τα έγραψε όλα σε μια επιστολή. Είναι πάνω στο σχολείο.',
  'And he still gives blood. Blood donor since 2017, no fuss about it.':
    'Και δίνει ακόμη αίμα. Αιμοδότης από το 2017, χωρίς τυμπανοκρουσίες.',

  /* ------------------------------ Grigoris ---------------------------- */
  'Sit down, I have white. …No? Fine.': 'Κάτσε, έχω τα λευκά. …Όχι; Καλά.',
  'Kitsos plays here between runs. Chess, running, cycling — the man cannot sit still.':
    'Ο Κίτσος παίζει εδώ ανάμεσα στα τρεξίματα. Σκάκι, τρέξιμο, ποδήλατο — δεν κάθεται στιγμή.',
  'Hiking, camping, theater, and half the furniture in his house is DIY.':
    'Πεζοπορία, κάμπινγκ, θέατρο, και τα μισά έπιπλα στο σπίτι του τα έφτιαξε μόνος.',
  'He treats a codebase the same way he treats an endgame: slowly, then all at once.':
    'Αντιμετωπίζει τον κώδικα όπως το φινάλε μιας παρτίδας: αργά, και μετά όλα μαζί.',

  /* ------------------------- Townsfolk in the square ------------------ */
  'Lovely square, is it not? He rebuilt those benches himself.':
    'Ωραία πλατεία, ε; Αυτά τα παγκάκια τα ξαναέφτιαξε μόνος του.',
  'Careful on Motivation Road — the students cycle like maniacs.':
    'Πρόσεχε στην Οδό Κινήτρου — οι φοιτητές κάνουν ποδήλατο σαν τρελοί.',
  'Looking for the Lighthouse? Freedom Road, north-west, out to the cape.':
    'Ψάχνεις τον Φάρο; Οδός Ελευθερίας, βορειοδυτικά, μέχρι το ακρωτήρι.',
  'Locked since before I moved here. Five keys, they say. One per district.':
    'Κλειδωμένος από πριν έρθω εδώ. Πέντε κλειδιά, λένε. Ένα ανά συνοικία.',

  /* -------------------------------- Nikos ----------------------------- */
  'Cannot stop — halfway through the loop!':
    'Δεν μπορώ να σταματήσω — είμαι στη μέση του γύρου!',
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
  'If you have a job for him, do not shout it at the sea — use the Radio Center.':
    'Αν έχεις δουλειά να του προτείνεις, μη φωνάζεις στη θάλασσα — πήγαινε στο Ραδιοφωνικό Κέντρο.',

  /* ----------------------------- Kyria Voula -------------------------- */
  'Shelf by the chessboard. You cannot miss it, he never tidies.':
    'Ράφι δίπλα στη σκακιέρα. Δεν γίνεται να μην το δεις, ποτέ δεν συμμαζεύει.',
  'That is his house, right there. Lights on late, always.':
    'Να το σπίτι του, εκεί. Πάντα με τα φώτα αναμμένα ως αργά.',
  'Greek is his mother tongue, English at proficiency — the Michigan ECPE — and French to B2, he has the DELF for it.':
    'Μητρική του τα ελληνικά, αγγλικά σε επίπεδο proficiency — το ECPE του Michigan — και γαλλικά B2, έχει το DELF.',
  'Athens born and based. Greek national. Go in, he does not mind visitors.':
    'Γεννημένος και εγκατεστημένος στην Αθήνα. Έλληνας υπήκοος. Πέρνα μέσα, δεν τον πειράζουν οι επισκέπτες.',
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
  'Then the Rangers’ school at Rentina — guerilla warfare. After that, Deputy Company Commander and Weapons Officer at a Marine Battalion.':
    'Μετά το σχολείο Rangers στη Ρεντίνα — ανταρτοπόλεμος. Και έπειτα Υποδιοικητής Λόχου και Αξιωματικός Οπλισμού σε Τάγμα Πεζοναυτών.',
  'Platoon Leader and Weapons Officer for a Marine Company. Personnel, logistics, weaponry, readiness.':
    'Διμοιρίτης και Αξιωματικός Οπλισμού σε Λόχο Πεζοναυτών. Προσωπικό, εφοδιασμός, οπλισμός, ετοιμότητα.',
  'The Battalion Commander wrote him a letter. It is framed inside, on the east wall. Read it.':
    'Ο Διοικητής του Τάγματος του έγραψε επιστολή. Είναι κορνιζαρισμένη μέσα, στον ανατολικό τοίχο. Διάβασέ την.',
  'That is where the calm comes from. Bad news does not make him louder.':
    'Από εκεί βγαίνει η ψυχραιμία. Τα άσχημα νέα δεν τον κάνουν να υψώσει τη φωνή.',
  'The key you are after is in the footlocker at the end of the bunks. Go on in.':
    'Το κλειδί που ψάχνεις είναι στο ερμάριο στο τέλος των κρεβατιών. Πέρνα μέσα.',

  /* --------------------------- Prof. Nikolaos ------------------------- */
  'Ah, another visitor for the Academy.':
    'Α, άλλος ένας επισκέπτης για τη Σχολή.',
  'Christos took the MEng at the National Technical University of Athens, School of Electrical and Computer Engineering. 2017 to 2022, GPA 8.4.':
    'Ο Χρήστος πήρε το δίπλωμα στο Εθνικό Μετσόβιο Πολυτεχνείο, στη Σχολή Ηλεκτρολόγων Μηχανικών και Μηχανικών Υπολογιστών. Από το 2017 ως το 2022, με βαθμό 8,4.',
  'His thesis in 2022: a movement compliance application using machine learning.':
    'Η διπλωματική του το 2022: εφαρμογή συμμόρφωσης κίνησης με χρήση μηχανικής μάθησης.',
  'And it did not stop there — it became a paper on arXiv in December 2025. The case by the east wall has it.':
    'Και δεν σταμάτησε εκεί — έγινε δημοσίευση στο arXiv τον Δεκέμβριο του 2025. Η προθήκη στον ανατολικό τοίχο την έχει.',
  'The Dean himself supervised it, and graded it with distinction. His letter is on the board by the west wall.':
    'Την επέβλεψε ο ίδιος ο Κοσμήτορας, και τη βαθμολόγησε με άριστα. Η επιστολή του είναι στον πίνακα στον δυτικό τοίχο.',
  'Five hard years. He came out of it able to build a system, not just a feature.':
    'Πέντε δύσκολα χρόνια. Βγήκε από εκεί ικανός να χτίσει σύστημα, όχι απλώς λειτουργία.',
  'If you want the lecture hall key, it is sitting on the thesis display over there.':
    'Αν θες το κλειδί του αμφιθεάτρου, είναι πάνω στην προθήκη της διπλωματικής εκεί πέρα.',

  /* ------------------------------ Dr. Fotini -------------------------- */
  'The lab bench is open, mind the cables.':
    'Ο πάγκος του εργαστηρίου είναι ανοιχτός, πρόσεχε τα καλώδια.',
  'See the certificate wall over there? MIT Open Learning for the AI foundations, CITI Program for biomedical research and HIPAA, Docker from IBM.':
    'Βλέπεις τον τοίχο με τα πιστοποιητικά εκεί; MIT Open Learning για τα θεμέλια της τεχνητής νοημοσύνης, CITI Program για βιοϊατρική έρευνα και HIPAA, Docker από την IBM.',
  'Languages too — ECPE and ECCE from Michigan, and DELF B2 in French.':
    'Και γλώσσες — ECPE και ECCE από το Michigan, και DELF B2 στα γαλλικά.',
  'He was at the Arduino IEEE Workshop here in 2018, volunteered at the European Researchers’ Night in 2019 and the 100-years celebration of ECE in 2017.':
    'Ήταν στο Arduino IEEE Workshop εδώ το 2018, εθελοντής στη Βραδιά του Ερευνητή το 2019 και στον εορτασμό των 100 χρόνων ΗΜΜΥ το 2017.',
  'Contests as well — 2nd in the National Biology Competition of 2016, plus awards in Physics, Mathematics, Informatics and Literature.':
    'Και διαγωνισμοί — 2ος στον Πανελλήνιο Διαγωνισμό Βιολογίας του 2016, μαζί με διακρίσεις σε Φυσική, Μαθηματικά, Πληροφορική και Λογοτεχνία.',

  /* -------------------------------- Anna ------------------------------ */
  'Work District. Mind the deploys.': 'Συνοικία Εργασίας. Πρόσεχε τα deploy.',
  'He came in May 2024 as one of the first engineers at Veltiston AI — an AI healthcare startup founded by MIT Professor Dimitris Bertsimas.':
    'Ήρθε τον Μάιο του 2024 ως ένας από τους πρώτους μηχανικούς της Veltiston AI — startup τεχνητής νοημοσύνης για την υγεία, ιδρυμένη από τον καθηγητή του MIT Δημήτρη Μπερτσιμά.',
  'Full-stack engineer for two years, Senior Software Engineer since May 2026, and project lead on three projects.':
    'Full-stack μηχανικός για δύο χρόνια, Senior Software Engineer από τον Μάιο του 2026, και υπεύθυνος σε τρία έργα.',
  'Java, Spring Boot, React, MySQL and AWS — a cloud-native platform now live in four major U.S. hospitals.':
    'Java, Spring Boot, React, MySQL και AWS — μια cloud-native πλατφόρμα που τρέχει πλέον σε τέσσερα μεγάλα νοσοκομεία των ΗΠΑ.',
  'He also leads the software on a contract for Holistic Hospital Optimization, on the same problem from the other side.':
    'Ηγείται επίσης του λογισμικού σε σύμβαση για το Holistic Hospital Optimization, στο ίδιο πρόβλημα από την άλλη πλευρά.',
  'Weekly production releases, HIPAA compliance, and nobody paged at 3am. Mostly.':
    'Εβδομαδιαίες εκδόσεις στην παραγωγή, συμμόρφωση με HIPAA, και κανείς δεν ξυπνάει στις 3 τα ξημερώματα. Σχεδόν ποτέ.',
  'The server room key is on the rack at the back. Take it, you have my blessing.':
    'Το κλειδί της μηχανογράφησης είναι στο rack στο βάθος. Πάρ’ το, έχεις την ευχή μου.',

  /* ------------------------------- Youssef ---------------------------- */
  'Greece, Boston, Morocco — I am the Morocco part of the stand-up.':
    'Ελλάδα, Βοστώνη, Μαρόκο — εγώ είμαι το μαροκινό κομμάτι του stand-up.',
  'He leads cross-functional teams of five to ten developers across three time zones: architecture, delivery, code reviews, sprint planning, the calls nobody wants to make.':
    'Ηγείται διαλειτουργικών ομάδων πέντε ως δέκα προγραμματιστών σε τρεις ζώνες ώρας: αρχιτεκτονική, παράδοση, code reviews, sprint planning, και τις αποφάσεις που δεν θέλει να πάρει κανείς.',
  'He runs the technical interviews, mentors us, and onboards every new engineer himself.':
    'Κάνει τις τεχνικές συνεντεύξεις, μας καθοδηγεί, και υποδέχεται κάθε νέο μηχανικό ο ίδιος.',
  'He also took a legacy Java/Angular app and dragged it into this decade — Agile process, engineering standards, CI/CD, documentation, refactoring in slices.':
    'Πήρε επίσης μια παλιά εφαρμογή Java/Angular και την έφερε σε αυτή τη δεκαετία — Agile διαδικασία, πρότυπα μηχανικής, CI/CD, τεκμηρίωση, refactoring σε φέτες.',

  /* ------------------------------ Thodoris ---------------------------- */
  'You want the interesting part? The integrations.':
    'Θες το ενδιαφέρον κομμάτι; Οι ενσωματώσεις.',
  'A documentation assistant on Spring AI with RAG and agentic AI. A SMART on FHIR app running inside Epic. A Length of Stay plugin delivered the same way.':
    'Ένας βοηθός τεκμηρίωσης σε Spring AI με RAG και agentic AI. Μια εφαρμογή SMART on FHIR που τρέχει μέσα στο Epic. Ένα plugin Length of Stay που παραδόθηκε με τον ίδιο τρόπο.',
  'UKG workforce management wired in, SAML 2.0 single sign-on against Microsoft ADFS, a notification framework and full activity audit logging.':
    'Ενσωματωμένο UKG για τη διαχείριση προσωπικού, single sign-on με SAML 2.0 απέναντι σε Microsoft ADFS, framework ειδοποιήσεων και πλήρες audit logging δραστηριότητας.',
  'Even the ticketing is ours — Jira-integrated, with reCAPTCHA on the front so the queue stays real.':
    'Ακόμη και το σύστημα αιτημάτων είναι δικό μας — ενσωματωμένο με Jira, με reCAPTCHA μπροστά ώστε η ουρά να μένει πραγματική.',
  'Observability is not an afterthought: Grafana, Graylog, Sentry. Secure and scalable, or it does not ship.':
    'Η παρατηρησιμότητα δεν είναι δεύτερη σκέψη: Grafana, Graylog, Sentry. Ασφαλές και κλιμακώσιμο, αλλιώς δεν βγαίνει.',

  /* ------------------------------- Dimitris --------------------------- */
  'Before the startup, there was the bank.':
    'Πριν από τη startup, ήταν η τράπεζα.',
  'November 2023 to May 2024, DevOps Engineer at IBM — picked for the IBM Associate Program.':
    'Από τον Νοέμβριο του 2023 ως τον Μάιο του 2024, DevOps Engineer στην IBM — επιλεγμένος για το IBM Associate Program.',
  'The Cosmos Project at the National Bank of Greece: moving core banking off legacy PL/I and COBOL onto Infosys Finacle.':
    'Το έργο Cosmos στην Εθνική Τράπεζα της Ελλάδος: μεταφορά του βασικού τραπεζικού συστήματος από PL/I και COBOL στο Infosys Finacle.',
  'He ran the integration calls across the bank’s subsystems and designed the architecture for both the coexistence state and the target state.':
    'Έτρεχε τις συσκέψεις ενσωμάτωσης ανάμεσα στα υποσυστήματα της τράπεζας και σχεδίασε την αρχιτεκτονική τόσο για το μεταβατικό όσο και για το τελικό στάδιο.',
  'Deployments and pipeline automation with Jenkins, Podman, ELK and Grafana. And he represented IBM Greece at the Agile and Enterprise Design Thinking bootcamp in Hamburg.':
    'Deployments και αυτοματοποίηση pipeline με Jenkins, Podman, ELK και Grafana. Και εκπροσώπησε την IBM Ελλάδος στο bootcamp Agile and Enterprise Design Thinking στο Αμβούργο.',

  /* ------------------------------ Ms. Maria --------------------------- */
  'Shh — exams. Come in, quietly.': 'Σςς — διαγωνίσματα. Πέρνα, σιγά.',
  'Model High School of Ionidios in Piraeus, 2015 to 2017, graduating GPA 19.9 out of 20.':
    'Πρότυπο Λύκειο Ιωνιδείου στον Πειραιά, από το 2015 ως το 2017, με βαθμό απολυτηρίου 19,9 στα 20.',
  'Before that, the Model Experimental High School of Evaggeliki in Nea Smyrni, 2011 to 2015 — he ranked 1st in the admission exam of 2014.':
    'Πριν από αυτό, το Πρότυπο Πειραματικό Γυμνάσιο της Ευαγγελικής Σχολής στη Νέα Σμύρνη, από το 2011 ως το 2015 — βγήκε 1ος στις εξετάσεις εισαγωγής του 2014.',
  'Bright kid. Insufferably curious. Still is, I hear.':
    'Έξυπνο παιδί. Ανυπόφορα περίεργο. Ακόμη είναι, απ’ ό,τι ακούω.',
  'The cabinet key is in the trophy case by the blackboard, if that is what you came for.':
    'Το κλειδί της ντουλάπας είναι στην προθήκη των επάθλων δίπλα στον πίνακα, αν γι’ αυτό ήρθες.',

  /* ------------------------------- Stelios ---------------------------- */
  'Easy. The district is shut — nobody goes in after hours.':
    'Σιγά. Η συνοικία είναι κλειστή — μετά το ωράριο δεν μπαίνει κανείς.',
  'Unless… did production fall over at midnight? Is that what has you out here?':
    'Εκτός αν… έπεσε η παραγωγή τα μεσάνυχτα; Γι’ αυτό βρέθηκες εδώ έξω;',
  'Because it has not. Not once. Not one page in the small hours the whole time I have had this gate. It would be a first.':
    'Γιατί δεν έπεσε. Ούτε μία φορά. Ούτε μία κλήση τις μικρές ώρες σε όλο το διάστημα που κρατάω αυτή την πύλη. Θα ήταν πρωτιά.',
  'Mind you, Kitsos kept those hours anyway. University years worst of all: in before the sun, still at it long after. Nothing was paging him — he just did not stop.':
    'Βέβαια, ο Κίτσος τέτοιες ώρες έκανε ούτως ή άλλως. Τα φοιτητικά χρόνια ήταν τα χειρότερα: μέσα πριν βγει ο ήλιος, ακόμη εκεί πολύ αφού είχε δύσει. Κανείς δεν τον καλούσε — απλώς δεν σταματούσε.',

  /* --------------------------- Sergeant Manolis ----------------------- */
  'Halt. Stop where you are — you are already closer than I let anyone get.':
    'Αλτ. Στάσου εκεί που είσαι — είσαι ήδη πιο κοντά απ’ όσο αφήνω οποιονδήποτε.',
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
  'Two open channels — email and LinkedIn — plus the message desk right here.':
    'Δύο ανοιχτά κανάλια — email και LinkedIn — και το γραφείο μηνυμάτων εδώ.',
  'Step up to the console and pick one. Everything goes straight to Kitsos; there is no operator in between.':
    'Πλησίασε την κονσόλα και διάλεξε. Όλα πάνε κατευθείαν στον Κίτσο· δεν μεσολαβεί κανένας χειριστής.',

  /* ------------------------------ Road signs -------------------------- */
  'KITSOS TOWN — Town Plaza. Seven roads leave this square, and not one of them is named after where it goes.':
    'ΠΟΛΗ ΤΟΥ ΚΙΤΣΟΥ — Κεντρική Πλατεία. Επτά δρόμοι φεύγουν από εδώ, και κανένας τους δεν πήρε το όνομά του από το πού πάει.',
  'North, Motivation Road, to the Polytechnic. East, Discipline Road, to the Work District. West, Curiosity Road, to the Town School.':
    'Βόρεια, η Οδός Κινήτρου, προς το Πολυτεχνείο. Ανατολικά, η Οδός Πειθαρχίας, προς τη Συνοικία Εργασίας. Δυτικά, η Οδός Περιέργειας, προς το Σχολείο της Πόλης.',
  'South-west, Caring Road, to Kitsos House. South-east, Leadership Road, to the Army Camp. Due south, Collaboration Road, to the Radio Center.':
    'Νοτιοδυτικά, η Οδός Φροντίδας, προς το Σπίτι του Κίτσου. Νοτιοανατολικά, η Οδός Ηγεσίας, προς το Στρατόπεδο. Κατευθείαν νότια, η Οδός Συνεργασίας, προς το Ραδιοφωνικό Κέντρο.',
  'And north-west out to the cape: Freedom Road, and the Old Lighthouse at the end of it. Locked.':
    'Και βορειοδυτικά προς το ακρωτήρι: η Οδός Ελευθερίας, και ο Παλιός Φάρος στο τέρμα της. Κλειδωμένος.',
  'They are named for what he carried out of each of them. Press M for the map, J for the journal.':
    'Πήραν το όνομά τους από αυτό που κουβάλησε από τον καθένα. Πάτα M για τον χάρτη, J για το ημερολόγιο.',
  'MOTIVATION ROAD — the Polytechnic, straight on. Mind the bicycles.':
    'ΟΔΟΣ ΚΙΝΗΤΡΟΥ — το Πολυτεχνείο, ευθεία. Πρόσεχε τα ποδήλατα.',
  'Electrical & Computer Engineering, and the lecture hall behind it.':
    'Ηλεκτρολόγοι Μηχανικοί & Μηχανικοί Υπολογιστών, και το αμφιθέατρο από πίσω.',
  'Five years of it. Nobody made him finish; that is rather the point of the name.':
    'Πέντε χρόνια. Κανείς δεν τον ανάγκασε να τελειώσει· αυτό ακριβώς σημαίνει το όνομα.',
  'DISCIPLINE ROAD — the Work District. Veltiston.AI and IBM Consulting.':
    'ΟΔΟΣ ΠΕΙΘΑΡΧΙΑΣ — η Συνοικία Εργασίας. Veltiston.AI και IBM Consulting.',
  'Deploys on Thursdays. Coffee is free, the incidents are not.':
    'Deploy κάθε Πέμπτη. Ο καφές είναι δωρεάν, τα περιστατικά όχι.',
  'Shipping the same standard on a bad week as on a good one is the whole trick.':
    'Το να βγάζεις την ίδια ποιότητα μια κακή βδομάδα όπως και μια καλή — αυτό είναι όλο το κόλπο.',
  'CURIOSITY ROAD — the Town School, where the whole thing started.':
    'ΟΔΟΣ ΠΕΡΙΕΡΓΕΙΑΣ — το Σχολείο της Πόλης, εκεί όπου ξεκίνησαν όλα.',
  'Carry on past the school for the west beach and the dock.':
    'Συνέχισε πέρα από το σχολείο για τη δυτική παραλία και την προβλήτα.',
  'Everything after this road is just the same question asked louder.':
    'Όλα όσα ήρθαν μετά από αυτόν τον δρόμο είναι η ίδια ερώτηση, ρωτημένη πιο δυνατά.',
  'FREEDOM ROAD — the north-west cape, and the Old Lighthouse on the end of it.':
    'ΟΔΟΣ ΕΛΕΥΘΕΡΙΑΣ — το βορειοδυτικό ακρωτήρι, και ο Παλιός Φάρος στην άκρη του.',
  'The door has five locks. One key waits in each district building.':
    'Η πόρτα έχει πέντε κλειδαριές. Ένα κλειδί περιμένει σε κάθε κτίριο συνοικίας.',
  'Nobody has opened it in years. Be the one who does.':
    'Χρόνια έχει να τον ανοίξει κανείς. Γίνε εσύ αυτός που θα το κάνει.',
  'COLLABORATION ROAD — the Radio Center, straight ahead. Follow the antenna.':
    'ΟΔΟΣ ΣΥΝΕΡΓΑΣΙΑΣ — το Ραδιοφωνικό Κέντρο, ευθεία μπροστά. Ακολούθησε την κεραία.',
  'Open to recruiters, collaborators and old friends alike.':
    'Ανοιχτό σε recruiters, συνεργάτες και παλιούς φίλους το ίδιο.',
  'Nothing worth building on this island was built by one person.':
    'Τίποτα που άξιζε να χτιστεί σε αυτό το νησί δεν χτίστηκε από έναν άνθρωπο.',
  'CARING ROAD — Kitsos House, south-west. Kyria Voula is usually on the step.':
    'ΟΔΟΣ ΦΡΟΝΤΙΔΑΣ — το Σπίτι του Κίτσου, νοτιοδυτικά. Η κυρία Βούλα είναι συνήθως στο σκαλί.',
  'Home, and the people who made it one. Volunteering, the Foundation, the blood bank.':
    'Το σπίτι, και οι άνθρωποι που το έκαναν σπίτι. Ο εθελοντισμός, το Ίδρυμα, η τράπεζα αίματος.',
  'Everything on this road he does for nothing, which is how you know he means it.':
    'Ό,τι κάνει σε αυτόν τον δρόμο το κάνει χωρίς αντάλλαγμα, και έτσι ξέρεις ότι το εννοεί.',
  'LEADERSHIP ROAD — the Army Camp, south-east. Ask for Sergeant Petros.':
    'ΟΔΟΣ ΗΓΕΣΙΑΣ — το Στρατόπεδο, νοτιοανατολικά. Ζήτα τον λοχία Πέτρο.',
  'Marine Battalion, reserve. Platoon Leader and Weapons Officer.':
    'Τάγμα Πεζοναυτών, έφεδρος. Διμοιρίτης και Αξιωματικός Οπλισμού.',
  'He slept last and woke first. Nobody on this road had to be told twice.':
    'Κοιμόταν τελευταίος και ξυπνούσε πρώτος. Σε αυτόν τον δρόμο κανείς δεν χρειάστηκε να του πουν κάτι δεύτερη φορά.',
}
