/**
 * Greek for the insides of the buildings: every room, the things you can look
 * at in them, the doors between them, and the journal each exhibit files.
 *
 * The doors and stairs are named as things ("the stairs to the basement"),
 * the way the prompt on a locked one reads after "E". The signs over them
 * are the far room's kicker, which is translated with the room.
 */
export const INTERIORS: Record<string, string> = {
  /* ------------------------------ Signs ------------------------------- */
  'Way out': 'Έξοδος',
  Through: 'Πέρασμα',

  /* ---------------------------- Kitsos House -------------------------- */
  'Living room': 'Σαλόνι',
  'the stairs to the basement': 'η σκάλα για το υπόγειο',
  'The basement stairs': 'Η σκάλα του υπογείου',
  'Under Kitsos House: the basement where his mother and father stand, at the table the seven of them grew up round.':
    'Κάτω από το Σπίτι του Κίτσου: το υπόγειο όπου στέκονται η μητέρα και ο πατέρας του, στο τραπέζι γύρω από το οποίο μεγάλωσαν και οι επτά.',
  'the stairs to the landing': 'η σκάλα για το πλατύσκαλο',
  Upstairs: 'Επάνω όροφος',
  'The first floor of Kitsos House: the landing, the lab at the end of it, and a door that does not open yet.':
    'Ο πρώτος όροφος του Σπιτιού του Κίτσου: το πλατύσκαλο, το εργαστήριο στο βάθος του, και μια πόρτα που δεν ανοίγει ακόμη.',
  'the door to the library': 'η πόρτα για τη βιβλιοθήκη',
  'the trainer card': 'η κάρτα του εκπαιδευτή',
  'Who lives here': 'Ποιος μένει εδώ',
  'Athens-based senior full stack engineer and technical lead: Java, Spring Boot, React and AWS, with the teams to match.':
    'Senior full stack μηχανικός και technical lead με έδρα την Αθήνα: Java, Spring Boot, React και AWS, με τις ανάλογες ομάδες.',
  'the shelf by the chessboard': 'το ράφι δίπλα στη σκακιέρα',

  /* ------------------------------ Basement ---------------------------- */
  'The basement': 'Το υπόγειο',
  'the stairs up to the living room': 'η σκάλα πάνω για το σαλόνι',
  'the door to the garage': 'η πόρτα για το γκαράζ',
  'the photographs': 'οι φωτογραφίες',
  'The house I grew up in': 'Το σπίτι όπου μεγάλωσα',
  'Seven at the table': 'Επτά στο τραπέζι',
  'Father, mother, three brothers, one sister and him. A big family is a small organisation: nobody hands you a role, you find the thing that needs doing.':
    'Πατέρας, μητέρα, τρία αδέλφια, μία αδελφή και εκείνος. Μια μεγάλη οικογένεια είναι ένας μικρός οργανισμός: κανείς δεν σου δίνει ρόλο, βρίσκεις μόνος σου τι πρέπει να γίνει.',

  /* ------------------------------- Garage ----------------------------- */
  'The garage': 'Το γκαράζ',
  'the door to the living room': 'η πόρτα για το σαλόνι',
  'the workbench': 'ο πάγκος εργασίας',
  'Tools on the board, bench along the back wall, car on one side and the bicycle on the other. Half the furniture upstairs was built here.':
    'Εργαλεία στο ταμπλό, πάγκος στον πίσω τοίχο, αυτοκίνητο από τη μία και το ποδήλατο από την άλλη. Τα μισά έπιπλα του πάνω ορόφου φτιάχτηκαν εδώ.',

  /* --------------------------------- Lab ------------------------------ */
  'The lab': 'Το εργαστήριο',
  'the door to the landing': 'η πόρτα για το πλατύσκαλο',
  'the server': 'ο σέρβερ',
  'The home lab': 'Το εργαστήριο του σπιτιού',
  'A mini server on Linux and a bench of electronics. Everything he knows about running things he learned breaking his own machine at eleven at night, with nobody to escalate to.':
    'Ένας μικρός σέρβερ σε Linux και ένας πάγκος με ηλεκτρονικά. Ό,τι ξέρει για τη λειτουργία συστημάτων το έμαθε χαλώντας το δικό του μηχάνημα στις έντεκα το βράδυ, χωρίς κανέναν να κλιμακώσει.',

  /* ------------------------------ Library ----------------------------- */
  'The library': 'Η βιβλιοθήκη',
  'the shelf that swings': 'το ράφι που γυρίζει',
  'The room that is not on the plans': 'Το δωμάτιο που δεν είναι στα σχέδια',
  'Behind the middle shelf in the library: a television, a Switch, two beanbags and the posters he never grew out of.':
    'Πίσω από το μεσαίο ράφι της βιβλιοθήκης: μια τηλεόραση, ένα Switch, δύο πουφ και οι αφίσες που ποτέ δεν ξεπέρασε.',
  'the bookshelf': 'η βιβλιοθήκη',
  'The shelf downstairs': 'Το ράφι στο κάτω πάτωμα',
  'Dostoevsky, Hugo, Feynman, Orwell, Remarque, Steinbeck: six books he has gone back to, in a room with one shelf that turns out not to be only a shelf.':
    'Ντοστογιέφσκι, Ουγκώ, Φάινμαν, Όργουελ, Ρεμάρκ, Στάινμπεκ: έξι βιβλία στα οποία έχει επιστρέψει, σε ένα δωμάτιο με ένα ράφι που τελικά δεν είναι μόνο ράφι.',
  'the shelf of toys': 'το ράφι με τα παιχνίδια',
  'The shelf of toys': 'Το ράφι με τα παιχνίδια',
  'Four boards of things nobody ever put away. Most of it has not moved in twenty years.':
    'Τέσσερα ράφια με πράγματα που κανείς δεν μάζεψε ποτέ. Τα περισσότερα δεν έχουν κουνηθεί εδώ και είκοσι χρόνια.',
  'Pick things up. Nothing on this shelf minds being handled.':
    'Πιάσε ό,τι θέλεις. Τίποτα σε αυτό το ράφι δεν πειράζεται να το ακουμπήσουν.',
  'A handful of bricks': 'Μια χούφτα τουβλάκια',
  'A tin rocket': 'Ένας τενεκεδένιος πύραυλος',
  'The ball that never went back in the box':
    'Η μπάλα που ποτέ δεν ξαναμπήκε στο κουτί',
  'A tin robot': 'Ένα τενεκεδένιο ρομπότ',
  'A green dinosaur': 'Ένας πράσινος δεινόσαυρος',
  'A toy helicopter': 'Ένα παιχνίδι ελικόπτερο',
  'A red car': 'Ένα κόκκινο αυτοκινητάκι',
  'A wooden boat': 'Ένα ξύλινο καράβι',
  'Board games nobody has opened in years':
    'Επιτραπέζια που έχουν χρόνια να ανοιχτούν',
  'Pick one up.': 'Πιάσε ένα.',
  'just a toy.': 'απλώς ένα παιχνίδι.',
  'The helicopter goes down under your thumb, and somewhere in the wall something lets go.':
    'Το ελικόπτερο κατεβαίνει κάτω από τον αντίχειρά σου, και κάπου μέσα στον τοίχο κάτι ελευθερώνεται.',
  'The helicopter': 'Το ελικόπτερο',
  'A toy shelf in the library, and one toy on it that is a switch. Press the helicopter and the panel at the back of the room lets go.':
    'Ένα ράφι με παιχνίδια στη βιβλιοθήκη, και ένα παιχνίδι πάνω του που είναι διακόπτης. Πάτα το ελικόπτερο και το ταμπλό στο βάθος του δωματίου ελευθερώνεται.',
  'The shelf moves': 'Το ράφι κουνιέται',
  'The helicopter presses down further than a toy should. There is a hinge behind the middle shelf. There is a room behind that.':
    'Το ελικόπτερο πατιέται πιο βαθιά από όσο θα έπρεπε ένα παιχνίδι. Πίσω από το μεσαίο ράφι υπάρχει μεντεσές. Και πίσω από αυτόν, ένα δωμάτιο.',
  'the Verne shelf': 'το ράφι του Βερν',
  'The Verne shelf': 'Το ράφι του Βερν',
  'Five Weeks in a Balloon, Journey to the Centre of the Earth, Twenty Thousand Leagues, The Mysterious Island, A Captain at Fifteen, and A Drama in Livonia. Mostly people somewhere impossible, building their way out, which turned out to be a career.':
    'Πέντε Εβδομάδες σε Αερόστατο, Ταξίδι στο Κέντρο της Γης, Είκοσι Χιλιάδες Λεύγες, Το Μυστηριώδες Νησί, Ένας Δεκαπεντάχρονος Πλοίαρχος, και Ένα Δράμα στη Λιβονία. Ως επί το πλείστον άνθρωποι κάπου αδύνατα, που χτίζουν τον δρόμο τους προς τα έξω, που τελικά αποδείχθηκε επάγγελμα.',

  /* ------------------------------ Landing ----------------------------- */
  'The landing': 'Το πλατύσκαλο',
  'the stairs down to the living room': 'η σκάλα κάτω για το σαλόνι',
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
  'the shelf back to the library': 'το ράφι πίσω για τη βιβλιοθήκη',
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
  'the door to the programming lab':
    'η πόρτα για το εργαστήριο προγραμματισμού',
  'the door to the council room': 'η πόρτα για την αίθουσα του συμβουλίου',
  'The programming lab': 'Το εργαστήριο προγραμματισμού',
  'the door to the lecture hall': 'η πόρτα για το αμφιθέατρο',
  'the transcript': 'η αναλυτική βαθμολογία',
  'Fifty-five courses': 'Πενήντα πέντε μαθήματα',
  'The transcript, course by course: fifty-five of them at an average of 7.94, tens in every programming course from the first semester to the last, a 10 for the thesis, and 8.35 overall, in the five years the programme is designed for.':
    'Η αναλυτική, μάθημα προς μάθημα: πενήντα πέντε με μέσο όρο 7,94, δέκα σε κάθε μάθημα προγραμματισμού από το πρώτο εξάμηνο ως το τελευταίο, 10 στη διπλωματική, και 8,35 γενικός μέσος όρος, στα πέντε χρόνια που προβλέπει το πρόγραμμα.',
  'the Survival Guide': 'ο Οδηγός Επιβίωσης',
  'A hundred and ten pages for new students on how to get through every compulsory course in the School, written while he was getting through them himself. Years later the year below still passes it round.':
    'Εκατόν δέκα σελίδες για τους νέους φοιτητές για το πώς περνάς κάθε υποχρεωτικό μάθημα της Σχολής, γραμμένες όσο τα περνούσε ο ίδιος. Χρόνια μετά το μικρότερο έτος τον δίνει ακόμη χέρι με χέρι.',
  'The council room': 'Η αίθουσα του συμβουλίου',
  'the petition': 'το ψήφισμα',
  'Seven hundred signatures': 'Εφτακόσιες υπογραφές',
  'The Independent movement of ECE students he helped found in his third year: a petition of more than 700 signatures in two days, a speech to 800, and two years as the independent representative the Dean appointed, in the open, always saying what he was doing.':
    'Το Ανεξάρτητο κίνημα φοιτητών ΗΜΜΥ που βοήθησε να ιδρυθεί στο τρίτο του έτος: ψήφισμα με πάνω από 700 υπογραφές σε δύο μέρες, ομιλία σε 800, και δύο χρόνια ως ο ανεξάρτητος εκπρόσωπος που όρισε ο Κοσμήτορας, με διαφάνεια, λέγοντας πάντα τι έκανε.',
  'the publication case': 'η προθήκη της δημοσίευσης',
  'Published research': 'Δημοσιευμένη έρευνα',
  'Published on arXiv': 'Δημοσιευμένο στο arXiv',
  '"An M-Health Algorithmic Approach to Identify and Assess Physiotherapy Exercises in Real Time" (arXiv, Cornell University, December 2025). Pose estimation plus a modified Levenshtein distance, running entirely on the client.':
    '«An M-Health Algorithmic Approach to Identify and Assess Physiotherapy Exercises in Real Time» (arXiv, Cornell University, Δεκέμβριος 2025). Εκτίμηση στάσης σώματος μαζί με τροποποιημένη απόσταση Levenshtein, που τρέχει εξ ολοκλήρου στον client.',
  'the certificate wall': 'ο τοίχος με τα πιστοποιητικά',
  'MIT Open Learning: Universal AI Foundational Modules (2026). CITI Program: Biomedical Research Investigators (2026–2029). IBM Docker Essentials (2024). ECPE and ECCE in English, DELF B2 in French.':
    'MIT Open Learning: Universal AI Foundational Modules (2026). CITI Program: Biomedical Research Investigators (2026–2029). IBM Docker Essentials (2024). ECPE και ECCE στα αγγλικά, DELF B2 στα γαλλικά.',
  'the letters of reference': 'οι συστατικές επιστολές',
  References: 'Συστάσεις',
  'Academic references': 'Ακαδημαϊκές συστάσεις',
  'Prof. Panagiotis Tsanakas, Dean of the School of ECE and his thesis supervisor: the thesis was "marked by scientific soundness and technological originality", graded with distinction. Stelios Kandylakis, a classmate: "very strong coding skills, a solution-oriented mindset, and a person of integrity."':
    'Ο καθηγητής Παναγιώτης Τσανάκας, Κοσμήτορας της Σχολής ΗΜΜΥ και επιβλέπων της διπλωματικής του: η εργασία «διακρινόταν για την επιστημονική της αρτιότητα και την τεχνολογική της πρωτοτυπία», βαθμολογημένη με άριστα. Ο Στέλιος Κανδυλάκης, συμφοιτητής: «πολύ δυνατές ικανότητες στον προγραμματισμό, νοοτροπία προσανατολισμένη στη λύση, και άνθρωπος με ακεραιότητα.»',
  'the thesis display shelf': 'το ράφι της προθήκης της διπλωματικής',

  /* ---------------------------- Work District ------------------------- */
  /* Τρεις όροφοι: ισόγειο, IBM, Veltiston AI. */
  'Ground floor': 'Ισόγειο',
  'First floor · IBM': 'Πρώτος όροφος · IBM',
  'Second floor · Veltiston AI': 'Δεύτερος όροφος · Veltiston AI',
  'the building directory': 'ο πίνακας του κτιρίου',
  'What is on which floor': 'Τι υπάρχει σε κάθε όροφο',
  /* Ο πίνακας του κτιρίου, και ο τρίτος όροφος που δεν έχει όνομα. */
  Directory: 'Ευρετήριο',
  'Two employers, one floor each, in the order he worked them. Everything on the ground floor is the part that came before either of them, or runs underneath both.':
    'Δύο εργοδότες, ένας όροφος στον καθένα, με τη σειρά που τους δούλεψε. Ό,τι υπάρχει στο ισόγειο είναι το κομμάτι που προηγήθηκε και των δύο, ή που τρέχει από κάτω τους.',
  Ground: 'Ισόγειο',
  'Capabilities, certifications, student jobs':
    'Ικανότητες, πιστοποιήσεις, φοιτητικές δουλειές',
  First: 'Πρώτος',
  'IBM · 2023–2024': 'IBM · 2023–2024',
  Second: 'Δεύτερος',
  'Veltiston AI · 2024–present': 'Veltiston AI · 2024–σήμερα',
  Third: 'Τρίτος',
  'Empty. Waiting on an offer': 'Άδειος. Περιμένει μια πρόταση',
  'The lift has a button for the third floor. Press it and nothing lights, because nobody has decided yet what that floor is — which is the honest position of a senior engineer who is good at this and is listening to offers. If you are reading this because you are hiring, you are the one who gets to name it.':
    'Το ασανσέρ έχει κουμπί για τον τρίτο όροφο. Το πατάς και δεν ανάβει τίποτα, γιατί κανείς δεν έχει αποφασίσει ακόμη τι είναι αυτός ο όροφος — που είναι η ειλικρινής θέση ενός senior μηχανικού που είναι καλός σε αυτό και ακούει προτάσεις. Αν το διαβάζεις επειδή προσλαμβάνεις, εσύ είσαι που θα του δώσει όνομα.',
  'A floor per employer: IBM 2023–2024 on the first, Veltiston AI 2024–present on the second. The third floor is built and empty, and what goes on it has not been decided.':
    'Ένας όροφος ανά εργοδότη: IBM 2023–2024 στον πρώτο, Veltiston AI από το 2024 ως σήμερα στον δεύτερο. Ο τρίτος όροφος είναι χτισμένος και άδειος, και δεν έχει αποφασιστεί τι θα μπει σε αυτόν.',
  'the capabilities board': 'ο πίνακας των ικανοτήτων',
  'What he does': 'Τι κάνει',
  'the skills terminal': 'το τερματικό των δεξιοτήτων',
  'the certification wall': 'ο τοίχος των πιστοποιήσεων',
  Certifications: 'Πιστοποιήσεις',
  'the board of student jobs': 'ο πίνακας των φοιτητικών δουλειών',
  'While at NTUA': 'Στα χρόνια του ΕΜΠ',
  'The jobs he held as a student': 'Οι δουλειές που έκανε ως φοιτητής',
  'the letter beside the board': 'η επιστολή δίπλα στον πίνακα',
  'Foundation reference': 'Σύσταση του ιδρύματος',
  'Kyriakos Oikonomou, retired Justice of the Hellenic Supreme Court and Vice-President of the "Pantokrator" Foundation, who appointed him Director in 2021: his contribution "had far exceeded our expectations" — renovation, events, volunteers and digital media.':
    'Ο Κυριάκος Οικονόμου, Αρεοπαγίτης ε.τ. και Αντιπρόεδρος του Ιδρύματος «Παντοκράτωρ», που τον διόρισε Διευθυντή το 2021: η συνεισφορά του «είχε ξεπεράσει κατά πολύ τις προσδοκίες μας» — ανακαίνιση, εκδηλώσεις, εθελοντές και ψηφιακά μέσα.',
  Reference: 'Σύσταση',
  'From the Vice-President': 'Από τον Αντιπρόεδρο',
  'the stairs to the first floor': 'η σκάλα προς τον πρώτο όροφο',
  'the stairs to the second floor': 'η σκάλα προς τον δεύτερο όροφο',
  'the stairs down to the lobby': 'η σκάλα προς το ισόγειο',
  'the stairs down to the first floor': 'η σκάλα προς τον πρώτο όροφο',
  'the lift': 'το ασανσέρ',
  'the IBM pinboard': 'ο πίνακας ανακοινώσεων της IBM',
  'DevOps & integration, 2023–2024': 'DevOps και ενσωμάτωση, 2023–2024',
  'the team board': 'ο πίνακας της ομάδας',
  'Current role': 'Τρέχων ρόλος',
  'the platform terminal': 'το τερματικό της πλατφόρμας',
  'The platform': 'Η πλατφόρμα',
  'the technology wall': 'ο τοίχος των τεχνολογιών',
  'The stack, and the pace': 'Το stack, και ο ρυθμός',
  IBM: 'IBM',
  'Veltiston AI': 'Veltiston AI',
  'Work District': 'Συνοικία Εργασίας',
  Skills: 'Δεξιότητες',
  'the server rack': 'το rack των σέρβερ',

  /* ------------------------------ Army camp --------------------------- */
  Barracks: 'Θάλαμος',
  'the service record': 'το φύλλο μητρώου',
  'Reservist Second Lieutenant, Marine Special Forces, 2022–2023, a unit to plan for, train and look after.':
    'Έφεδρος Ανθυπολοχαγός, Πεζοναύτες Ειδικών Δυνάμεων, 2022–2023, μια μονάδα να σχεδιάζεις, να εκπαιδεύεις και να φροντίζεις.',
  'the commander’s letter': 'η επιστολή του διοικητή',
  'The commander’s letter': 'Η επιστολή του διοικητή',
  'Commander’s reference': 'Σύσταση του διοικητή',
  'Lt Col Georgios Mitsidis, Commander of the 575 Marine Battalion: Platoon Leader and Weapons Officer for a Marine Company, "accomplished his tasks successfully without the need of supervision"; recommended with the utmost confidence as "a valuable and trusted partner".':
    'Ο Αντισυνταγματάρχης Γεώργιος Μητσίδης, Διοικητής του 575 Τάγματος Πεζοναυτών: Διμοιρίτης και Αξιωματικός Οπλισμού σε Λόχο Πεζοναυτών, «έφερε εις πέρας τα καθήκοντά του με επιτυχία χωρίς να χρειάζεται επίβλεψη»· τον συστήνει με απόλυτη εμπιστοσύνη ως «πολύτιμο και αξιόπιστο συνεργάτη».',
  'the footlocker at the end of the bunks':
    'το ερμάριο στο τέλος των κρεβατιών',

  /* The officers' door, and the room behind it. */
  'Operations room': 'Αίθουσα επιχειρήσεων',
  'Officers only': 'Μόνο αξιωματικοί',
  'the door to the operations room': 'η πόρτα για την αίθουσα επιχειρήσεων',
  'the door to the barracks': 'η πόρτα για τον θάλαμο',
  'OFFICERS ONLY, stencilled across it at eye height. The handle turns, and the duty clerk on the far side turns you straight back round.':
    'ΜΟΝΟ ΑΞΙΩΜΑΤΙΚΟΙ, με στένσιλ στο ύψος των ματιών. Το πόμολο γυρίζει, και ο γραφέας υπηρεσίας από την άλλη μεριά σε γυρίζει αμέσως πίσω.',
  'Not in those clothes. There is a uniform hanging on the locker by the service record.':
    'Όχι με αυτά τα ρούχα. Υπάρχει μια στολή κρεμασμένη στο ντουλάπι δίπλα στο φύλλο μητρώου.',
  'The operations room': 'Η αίθουσα επιχειρήσεων',
  'Through the officers’ door at the Army Camp, which opens for the uniform and not for the man: Lt Col Mitsidis at his desk, and the landing plan on the table.':
    'Πίσω από την πόρτα των αξιωματικών στο Στρατόπεδο, που ανοίγει για τη στολή κι όχι για τον άνθρωπο: ο Αντισυνταγματάρχης Μητσίδης στο γραφείο του, και το σχέδιο της απόβασης στο τραπέζι.',

  /* His kit, and the duty bell. */
  'the officer’s uniform': 'η στολή του αξιωματικού',
  'OFFICER KIT': 'ΣΤΟΛΗ ΑΞΙΩΜΑΤΙΚΟΥ',
  'ON PARADE': 'ΣΕ ΥΠΗΡΕΣΙΑ',
  'In uniform': 'Με στολή',
  'Pattern combat dress and the green beret. The door to the operations room will open for you now.':
    'Στολή παραλλαγής και ο πράσινος μπερές. Η πόρτα της αίθουσας επιχειρήσεων θα σου ανοίξει τώρα.',
  'the duty bell': 'το καμπανάκι υπηρεσίας',
  'The duty bell': 'Το καμπανάκι υπηρεσίας',
  'Not for civilians': 'Όχι για πολίτες',
  'A brass bell on a bracket, its rope tied up out of reach of anybody passing through.':
    'Ένα μπρούντζινο καμπανάκι σε βραχίονα, με το σχοινί του δεμένο ψηλά, μακριά από όποιον περνάει.',
  'It calls the barracks to stand by their beds for evening inspection. Only the duty officer rings it, and the duty officer is in uniform.':
    'Καλεί τον θάλαμο να σταθεί δίπλα στα κρεβάτια για τη βραδινή επιθεώρηση. Μόνο ο αξιωματικός υπηρεσίας το χτυπά, και ο αξιωματικός υπηρεσίας φορά στολή.',

  /* The inspection it calls. */
  'Barracks orderly': 'Θαλαμοφύλακας',
  'Evening inspection': 'Βραδινή επιθεώρηση',
  'Barracks — attention! Five men, one to a bunk, heels on the line.':
    'Θάλαμος — προσοχή! Πέντε άντρες, ένας σε κάθε κρεβάτι, οι φτέρνες στη γραμμή.',
  'Lieutenant, barracks ready for inspection! Beds made, lockers squared, nobody missing.':
    'Κύριε Διμοιρίτα, θάλαμος έτοιμος για επιθεώρηση! Κρεβάτια στρωμένα, ντουλάπια τακτοποιημένα, κανείς δεν λείπει.',
  'Permission to turn in once the Lieutenant has walked the line, sir.':
    'Ζητώ την άδεια να κατακλιθούμε, μόλις ο κύριος Διμοιρίτης περάσει τη γραμμή.',
  'Already at attention, sir. Nobody moves until the Lieutenant says so.':
    'Ήδη σε στάση προσοχής, κύριε. Κανείς δεν κουνιέται μέχρι να το πει ο Διμοιρίτης.',

  /* ------------------------------- School ----------------------------- */
  'The hall': 'Το χολ',
  'Early education': 'Πρώτα χρόνια εκπαίδευσης',
  'the door to the Evangeliki classroom':
    'η πόρτα για την τάξη της Ευαγγελικής',
  Evangeliki: 'Ευαγγελική',
  'The Model Junior High School of Evangeliki in Nea Smyrni, through the west door of the Town School: one of four public Model schools in Greece, and he ranked 1st in the exam to get in.':
    'Το Πρότυπο Γυμνάσιο της Ευαγγελικής Σχολής στη Νέα Σμύρνη, από τη δυτική πόρτα του Σχολείου της Πόλης: ένα από τα τέσσερα δημόσια Πρότυπα σχολεία της Ελλάδας, και βγήκε 1ος στις εξετάσεις για να μπει.',
  'the door to the Ionidios classroom': 'η πόρτα για την τάξη της Ιωνιδείου',
  Ionidios: 'Ιωνίδειος',
  'The Model High School of Ionidios in Piraeus, through the east door of the Town School: the oldest school in Piraeus, founded in 1847, a second entrance exam ranked 1st, and the Piraeus prize for the top graduating grade of 2017.':
    'Το Ιωνίδειος Πρότυπο Λύκειο Πειραιά, από την ανατολική πόρτα του Σχολείου της Πόλης: το παλαιότερο σχολείο του Πειραιά, από το 1847, δεύτερες εισαγωγικές εξετάσεις με 1η θέση, και το βραβείο του Πειραιά για το πρώτο απολυτήριο του 2017.',
  'Model High School of Ionidios': 'Ιωνίδειος Πρότυπο Λύκειο',
  'The Piraeus prize': 'Το βραβείο του Πειραιά',
  'Ionidios, 2015–2017: 1st in the entrance exam, the excellence award every year, the Piraeus prize for the top graduating grade of 2017 at 19.9 out of 20, 2nd of about 1,650 in the national Biology competition, awards in Mathematics and Programming, and captain of the EUSO team.':
    'Ιωνίδειος, 2015–2017: 1ος στις εισαγωγικές εξετάσεις, αριστείο κάθε χρόνο, το βραβείο του Πειραιά για το πρώτο απολυτήριο του 2017 με 19,9 στα 20, 2ος σε περίπου 1.650 στον Πανελλήνιο Διαγωνισμό Βιολογίας, βραβεία σε Μαθηματικά και Προγραμματισμό, και αρχηγός της ομάδας EUSO.',
  'the scholarship letters': 'οι επιστολές για την υποτροφία',
  'Three letters from his teachers': 'Τρεις επιστολές από τους καθηγητές του',
  'Three letters from Ionidios': 'Τρεις επιστολές από την Ιωνίδειο',
  'His biology, physics and chemistry teachers, each on a scholarship recommendation form in September 2017: first in his class year after year, excellent throughout, in every event the school ran, and "without doubt among the best students I have had".':
    'Οι καθηγητές του στη Βιολογία, τη Φυσική και τη Χημεία, ο καθένας σε έντυπο συστατικής για υποτροφία τον Σεπτέμβριο του 2017: πρώτος της τάξης χρόνο με τον χρόνο, άριστος σε όλη τη διάρκεια, σε κάθε εκδήλωση του σχολείου, και «αναμφίβολα από τους καλύτερους μαθητές που είχα».',
  'the trophy case': 'η προθήκη των επάθλων',
  'Two cups in the hall': 'Δύο κύπελλα στο χολ',
  'Captain of the elementary school chess team, 1st in the city tournament; captain of the basketball team for two years, 3rd in the local tournament.':
    'Αρχηγός της ομάδας σκακιού του δημοτικού, 1ος στο τουρνουά της πόλης· αρχηγός της ομάδας μπάσκετ για δύο χρόνια, 3ος στο τοπικό τουρνουά.',
  'the volunteering case': 'η προθήκη του εθελοντισμού',
  'Teaching & volunteering': 'Διδασκαλία & εθελοντισμός',
  'the door to the hall': 'η πόρτα για το χολ',
  'the honours board': 'ο πίνακας των διακρίσεων',
  'Model Junior High School of Evangeliki':
    'Πρότυπο Γυμνάσιο Ευαγγελικής Σχολής',
  'Evangeliki, 2011–2015: first of the class every year with the prize of excellence, class president and school representative, and a fifteen-page report handed to the principal at the end of it.':
    'Ευαγγελική, 2011–2015: πρώτος της τάξης κάθε χρόνο με το αριστείο, πρόεδρος τάξης και εκπρόσωπος του σχολείου, και ένας απολογισμός δεκαπέντε σελίδων στα χέρια του διευθυντή στο τέλος.',
  'the Pascal machine': 'το μηχάνημα της Pascal',
  'Pascal from the age of thirteen, a sundial and a planetarium to scale, a submarine drone with the robotics class and an electric bicycle on his own, and the chess team to captain.':
    'Pascal από τα δεκατρία, ένα ηλιακό ρολόι και ένα πλανητάριο σε κλίμακα, ένα υποβρύχιο drone με την τάξη ρομποτικής και ένα ηλεκτρικό ποδήλατο μόνος του, και η ομάδα σκακιού για αρχηγία.',
  'the trophy case shelf': 'το ράφι της προθήκης των επάθλων',

  /* --------------------------- Radio & lighthouse --------------------- */
  'Control room': 'Αίθουσα ελέγχου',
  'the transmitter': 'ο πομπός',
  'Get in touch': 'Επικοινώνησε',
  'The message desk composes an email straight to Kitsos, with no operator in between.':
    'Το γραφείο μηνυμάτων συντάσσει email κατευθείαν προς τον Κίτσο, χωρίς κανέναν χειριστή στη μέση.',
  'Summit room': 'Το δωμάτιο της κορυφής',
  'the keeper’s logbook': 'το ημερολόγιο του φαροφύλακα',
  'The shelf swings out on a hinge nobody fitted by accident.':
    'Το ράφι ανοίγει σε έναν μεντεσέ που δεν τον έβαλε κανείς κατά λάθος.',
  'The short version': 'Η σύντομη εκδοχή',
  'Opened with all five district keys. The keeper’s logbook holds the career summary, what he is good at, and what he is looking for.':
    'Άνοιξε με τα πέντε κλειδιά των συνοικιών. Το ημερολόγιο του φαροφύλακα κρατάει τη σύνοψη της καριέρας, σε τι είναι καλός, και τι ψάχνει.',

  /* The globe at Evangeliki: the prompt you get beside it, and what the
     journal files once you have spun it. */
  'the globe': 'η υδρόγειος',
  'Six countries': 'Έξι χώρες',
  'The globe in the astronomy corner at Evangeliki: Greece, Cyprus, Germany, France, Italy and Switzerland, stood in rather than pointed at.':
    'Η υδρόγειος στη γωνιά της αστρονομίας στην Ευαγγελική: Ελλάδα, Κύπρος, Γερμανία, Γαλλία, Ιταλία και Ελβετία — χώρες όχι δειγμένες μα πατημένες.',
  'Flight deck': 'Θάλαμος πτήσης',
  'the crew screen': 'η οθόνη του πληρώματος',
  'Meet the characters': 'Γνωρίστε τους χαρακτήρες',
  'The crew screen': 'Η οθόνη του πληρώματος',
  'A screen on the flight deck with everybody on the island on it, and a tick against each one he stopped to hear.':
    'Μια οθόνη στον θάλαμο πτήσης με όλους όσοι ζουν στο νησί, και ένα τικ δίπλα σε όποιον στάθηκε να ακούσει.',
}
